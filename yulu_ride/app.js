// server.js
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cookieParser from 'cookie-parser'  
import db_routes from './routes/db_connection.route.js' 
import bike_routes from './routes/get_available_bikes.route.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Welcome to Yulu Ride!')
})
app.use('/api/db', db_routes)
app.use('/api/bikes', bike_routes)

export default app;
