import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pdfRouter from './routes/pdf.routes.js';
import videoRouter from './routes/video.routes.js';
import authRouter from './routes/auth.routes.js';
import connectDB from './services/connectDB.js';
import cookieParser from 'cookie-parser';


dotenv.config();

const port = process.env.PORT || 5000;
connectDB();

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Bamboo Chat' });
});

app.use('/api/auth', authRouter);
app.use('/api/pdf', pdfRouter);
app.use('api/video', videoRouter);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});