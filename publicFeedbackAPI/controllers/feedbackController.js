const Feedback = require('../models/feedback.model');

const createFeedback = async (req, res) => {
    try {
        const { message, rating, category } = req.body;
        const feedback = new Feedback({
            message,
            rating,
            category
        });

        await feedback.save();

        return res.status(201).json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        return res.status(200).json({ success: true, feedbacks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const healthcheck = async(req, res) => {
    console.log('Healthcheck successful');
    return res.status(200).json({ success: true, message: 'Healthcheck successful' });
};

module.exports = {
    createFeedback,
    getFeedbacks,
    healthcheck
};
