import express from 'express';
import { pool } from './utils/connectDB.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import jobsRouter from './routes/jobs.route.js';


dotenv.config();

const app = express();

pool.query('SELECT 1').
  then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  })



const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api', (req, res) => {
    console.log('Welcome to the server!');
    return res.send('Welcome to the server!');
});

app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);



app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});