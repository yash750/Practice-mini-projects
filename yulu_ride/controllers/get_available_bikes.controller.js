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
        return false;
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
        return res.status(500).json({ error: 'Error fetching available bikes', message: error.message });
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
    const {lat, long, email} = req.body;

    if (!lat || !long || !email) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }
    let rows;
    //fetch user by using its email and check isBlocked and balance
    try {
        const query = `SELECT id, isBlocked, balance FROM users WHERE email = '${email}'`;
        [rows] = await pool.execute(query);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
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
        return res.status(403).json({status: false, message: 'Your account is blocked.', balance: balance});
    }
    if (balance < 50) {
        return res.status(403).json({status: false, message: 'You balance is low.', balance: balance});
    }

    const userInServiceArea = await isUserInServiceArea(lat, long);
    if (!userInServiceArea.allow_ride) {
        return res.status(403).json({status: false, message: userInServiceArea.message, balance: balance});
    }

    const bikes = await fetchAvailableBikes(userInServiceArea);
    
    if (bikes.length === 0) {
        return res.status(404).json({ status: false, message: 'No bikes available in your area.', balance: balance, bikes: []});
    }
    // create entry in bikeAvailabilityHistory table
    const logEntryId = uuidv4();
    console.log(logEntryId);
    const responseJson = JSON.stringify(bikes);

    await makeEntryInHistory(logEntryId, userId, lat, long, responseJson);
    return res.status(200).json({ status: true, allow_ride: true, message: 'Success', balance: balance, bikes: bikes});

};

const healthCheck = async (req, res) => {
    return res.status(200).json({ status: true, message: 'Success' });
};

export { get_available_bikes, healthCheck };



    
