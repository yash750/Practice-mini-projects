import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cookieParser from 'cookie-parser'  
import db_routes from './routes/db_connection.route.js' 
import bike_routes from './routes/get_available_bikes.route.js'
import db_health_check from './db/db_health_check.js'

const PORT = process.env.PORT || 3000

const app = express()

db_health_check()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Welcome to Yulu Ride!')
})
app.use('/api/db', db_routes)
app.use('/api/bikes', bike_routes)

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server started on port: ${PORT}`)
    })
}

export default app;
