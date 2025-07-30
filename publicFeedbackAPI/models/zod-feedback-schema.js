const { z } = require('zod');

const feedbackSchema = z.object({
  message: z.string()
    .min(10, 'Feedback must be at least 10 characters long')
    .max(1000, 'Feedback cannot exceed 1000 characters')
    .trim(),
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  category: z.enum(['bug', 'feature', 'general', 'complaint'])
    .optional()
    .default('general')
});

module.exports = { feedbackSchema };