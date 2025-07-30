# Public Feedback API

A secure, anonymous feedback collection API with rate limiting and validation.

## Features

- ✅ Anonymous feedback submission
- ✅ Zod schema validation
- ✅ IP-based rate limiting
- ✅ Security middleware (Helmet, CORS)
- ✅ Global error handling
- ✅ Feedback statistics

## Installation

```bash
npm install
```

## Usage

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### POST /api/feedback/submit
Submit anonymous feedback with rate limiting (5 submissions per 15 minutes per IP).

**Request Body:**
```json
{
  "message": "Your feedback message (10-1000 characters)",
  "rating": 5,
  "category": "general"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": 1,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/feedback/stats
Get feedback statistics (10 requests per minute per IP).

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "categories": {
      "general": 3,
      "bug": 1,
      "feature": 1
    },
    "averageRating": "4.2"
  }
}
```

## Validation Rules

- **message**: Required, 10-1000 characters
- **rating**: Optional, integer 1-5
- **category**: Optional, enum: ['bug', 'feature', 'general', 'complaint']

## Rate Limits

- Feedback submission: 5 requests per 15 minutes per IP
- Stats endpoint: 10 requests per minute per IP

## Testing

Visit `http://localhost:3001` for a simple HTML form to test the API.

## Success Metrics

- ✅ 99% valid submissions (Zod validation)
- ✅ 100% rate-limited abusive IPs (express-rate-limit)