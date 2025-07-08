import express from 'express';
import { db } from './utils/connectDB.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api', (req, res) => {
    console.log('Welcome to the server!');
    return res.send('Welcome to the server!');
});

// Test the database connection on startup
db.execute('SELECT 1')
  .then(() => {
    console.log('Connected to database');
    app.listen(port, () => {
      console.log(`Server started on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to database: ', err);
    process.exit(1);
  });