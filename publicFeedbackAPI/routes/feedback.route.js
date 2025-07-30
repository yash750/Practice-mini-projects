const express = require('express')
const router = express.Router();

const feedbackController = require('../controllers/feedbackController.js');
const validateSchema  = require('../middlewares/schemaValidation.middleware.js');


router.get('/healthcheck', feedbackController.healthcheck);
router.post('/submit',validateSchema, feedbackController.createFeedback);
router.get('/getFeedbacks', feedbackController.getFeedbacks);

module.exports = router;