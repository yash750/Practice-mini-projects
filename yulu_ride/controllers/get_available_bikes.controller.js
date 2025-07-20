import pool from '../db/connectDatabase.js'
import { v4 as uuidv4 } from 'uuid';

async function isUserInServiceArea(userLat, userLng) {
    const point = `POINT(${userLng} ${userLat})`;
    let rows;
    try {
        [rows] = await pool.execute(`
          SELECT sa.*
          FROM service_areas sa
          WHERE ST_Contains(
            sa.area,
            ST_GeomFromText(?, 4326)
          )
        `, [point]);
    } catch (error) {
        console.error('Error fetching service areas:', error);
        return { allow_ride: false, message: "Error checking service area availability." };
    }
  
    if (rows.length === 0) {
      return {
        allow_ride: false,
        message: "We are not serviceable in your area"
      };
    } else {
      return {
        allow_ride: true,
        service_area_name: rows[0].name,
        city_id: rows[0].city_id
      };
    }
}
async function fetchAvailableBikes(userInServiceArea) {
    try {
        const [bikes] = await pool.execute(
            `
            SELECT b.*
            FROM bikes b
            WHERE
              b.isFaulty = false
              AND b.status = 'available'
              AND ST_Contains(
                (SELECT area FROM service_areas WHERE name = ? LIMIT 1),
                ST_GeomFromText(CONCAT('POINT(', b.longitude, ' ', b.latitude, ')'), 4326)
              )
            `,
            [userInServiceArea.service_area_name]
        );
        return bikes;
    } catch (error) {
        console.error('Error fetching available bikes:', error);
        throw error;
    }
}

async function makeEntryInHistory( logEntryId, userId, lat, long, responseJson) {
    try {
        await pool.execute(
        `
        INSERT INTO bikeAvailabilityHistory (id, userId, latitude, longitude, response)
        VALUES (?, ?, ?, ?, ?)
        `,
        [logEntryId, userId, lat, long, responseJson]
        );
        return true;
    } catch (error) {
        console.error('Error logging bike availability:', error);
    }
}
  
const get_available_bikes = async (req, res) => {
    try {
        const {lat, long, email} = req.body;
    
        if (!lat || !long || !email) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }
        let rows;
        try {
            const query = `SELECT id, isBlocked, balance FROM users WHERE email = ?`;
            [rows] = await pool.execute(query, [email]);
            if (rows.length === 0) {
                return res.status(401).json({ message: 'User not found.', data:{balance: 0, allow_ride: false, bikes: []} });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ error: 'Error fetching user', message: error.message });
        }
        const user = rows[0];
        const userId = user.id;
        const isBlocked = user.isBlocked;
        const balance = user.balance;
        
        if (isBlocked) {
            return res.status(200).json({message: 'Your account is blocked.', data : {balance: balance, allow_ride: false, bikes: []} });
        }
        if (balance < 50) {
            return res.status(200).json({message: 'You balance is low.',data : {balance: balance, allow_ride: false, bikes: []}});
        }
    
        const userInServiceArea = await isUserInServiceArea(lat, long);
        if (!userInServiceArea.allow_ride) {
            return res.status(200).json({message: userInServiceArea.message,data : {balance: balance, allow_ride: false, bikes: []}});
        }
    
        let bikes;
        try {
            bikes = await fetchAvailableBikes(userInServiceArea);
        } catch (error) {
            return res.status(403).json({ error: 'Error fetching available bikes', message: error.message });
        }
        
        if (bikes.length === 0) {
            return res.status(200).json({message: 'No bikes available in your area.',data : {balance: balance, allow_ride: false, bikes: []}});
        }
        // create entry in bikeAvailabilityHistory table
        const logEntryId = uuidv4();
        const responseJson = JSON.stringify(bikes);
    
        try {
            await makeEntryInHistory(logEntryId, userId, lat, long, responseJson);
        } catch (logError) {
            console.error('Failed to log bike availability history, but returning success to user.', logError);
        }
        return res.status(200).json({message: 'Success', data : {balance: balance, allow_ride: true, bikes: bikes}});
    
    } catch (error) {
        console.error('Error in get_available_bikes controller:', error);
        return res.status(500).json({ error: 'Error in get_available_bikes controller', message: error.message });
    }
};

const healthCheck = async (req, res) => {
    return res.status(200).json({message: 'Success' });
};

export { get_available_bikes, healthCheck };



    
