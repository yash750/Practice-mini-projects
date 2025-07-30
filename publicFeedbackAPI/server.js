const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const feedbackRoutes = require('./routes/feedback.route');
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
}));
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
    console.log('Connected to MongoDB');
    }).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    }
);


// Routes
app.use('/', feedbackRoutes);
app.use('/api/feedback', feedbackRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});