const {feedbackSchema} = require('../models/zod-feedback-schema');

const validateSchema = async (req, res, next) => {
    try {
        const { message, rating, category } = req.body;
        const result = await feedbackSchema.safeParseAsync({ message, rating, category });
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.error.message });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = validateSchema;