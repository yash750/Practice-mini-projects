import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const testPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'yulu_ride_test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})


export default testPool
