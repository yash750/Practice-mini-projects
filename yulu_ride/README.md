# Yulu Ride - Bike Sharing Service API

A location-based bike-sharing service API that helps users find available bikes in their vicinity. The system validates service areas, checks user eligibility, and provides real-time bike availability with comprehensive logging and testing.

## 🚀 Features

- **Location-based bike discovery** - Find available bikes within service areas using geospatial queries
- **User validation** - Account status, balance, and eligibility checks
- **Service area management** - Geofenced service zones with polygon-based location validation
- **Real-time availability** - Live bike status tracking and availability updates
- **Comprehensive logging** - Complete audit trail of user searches and bike availability
- **Robust testing** - Unit and integration tests with coverage reporting
- **Slack integration** - Automated test result notifications

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with spatial data support
- **Testing**: Jest, Supertest
- **Notifications**: Slack Web API
- **Other**: UUID for unique identifiers, bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher) with spatial extensions
- npm or yarn package manager

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yulu_ride
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=yulu_ride
   PORT=3000
   
   # Slack Integration (Optional)
   SLACK_BOT_TOKEN=your_slack_bot_token
   SLACK_CHANNEL_ID=your_slack_channel_id
   REPORT_URL=your_report_hosting_url
   ```

4. **Database Setup**
   
   Create the MySQL database and tables using the schema defined in `models/schema.js`:
   - `users` - User accounts with location and balance information
   - `bikes` - Bike inventory with location and status
   - `service_areas` - Geofenced service zones (POLYGON data)
   - `cities` - City definitions with service mappings
   - `bikeAvailabilityHistory` - Search history and audit logs

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔌 API Endpoints

### Health Check
```http
GET /api/bikes/health
```
Returns service health status.

### Get Available Bikes
```http
POST /api/bikes/get_available_bikes
Content-Type: application/json

{
  "lat": 12.9716,
  "long": 77.5946,
  "email": "user@example.com"
}
```

**Response Format:**
```json
{
  "message": "Success",
  "data": {
    "balance": 120,
    "allow_ride": true,
    "bikes": [
      {
        "id": "bike-uuid",
        "bikeNumber": 101,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "status": "available",
        "bikeCategory": "standard"
      }
    ]
  }
}
```

## 🗄️ Database Schema

### Users Table
- User authentication and profile information
- Account balance and blocking status
- Location tracking for service area validation

### Bikes Table
- Bike inventory with real-time location
- Status tracking (available, in-use, maintenance)
- Fault reporting and categorization

### Service Areas Table
- Geospatial polygon definitions for service zones
- City-based service area mapping
- Spatial indexing for efficient location queries

### History Tracking
- Complete audit trail of user searches
- Response logging for analytics and debugging
- Timestamp-based activity tracking

## 🧪 Testing

The project includes comprehensive test coverage:

### Run Tests
```bash
# Run all tests with coverage
npm test

# Run tests with Slack notification
npm run test:notify
```

### Test Structure
- **Unit Tests**: Individual function testing with mocked dependencies
- **Integration Tests**: End-to-end API testing with real database
- **Coverage Reports**: HTML and LCOV format reports generated

### Test Users
Reference `test_users.md` for pre-configured test scenarios:
- Valid users with sufficient balance
- Users with insufficient balance
- Blocked users
- Users outside service areas

## 🔄 Business Logic Flow

1. **User Validation**
   - Verify user exists and account is active
   - Check account balance (minimum ₹50 required)
   - Validate account is not blocked

2. **Location Validation**
   - Check if user location falls within any service area
   - Use MySQL spatial functions for geofenced validation

3. **Bike Availability**
   - Query available bikes within the user's service area
   - Filter out faulty or reserved bikes
   - Return bikes with location and details

4. **Audit Logging**
   - Log all search requests with user location
   - Store complete response for analytics
   - Generate unique tracking IDs

## 📊 Monitoring & Notifications

- **Slack Integration**: Automated test result notifications
- **Coverage Reports**: HTML reports with detailed metrics
- **Health Checks**: Database connectivity monitoring
- **Error Logging**: Comprehensive error tracking and reporting

## 🚀 Deployment

1. **Environment Setup**
   - Configure production database credentials
   - Set appropriate PORT and environment variables
   - Enable database health checks

2. **Database Migration**
   - Ensure all tables are created with proper indexes
   - Load initial data for cities and service areas
   - Configure spatial indexes for performance

3. **Process Management**
   - Use PM2 or similar for process management
   - Configure log rotation and monitoring
   - Set up automated restarts and health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Yashwardhan Singh Chundawat**

---

## 🔧 Development Notes

- The application uses ES6 modules (`"type": "module"` in package.json)
- Spatial queries require MySQL 8.0+ with spatial extensions
- Test database should be separate from production
- Slack notifications are optional but recommended for CI/CD

For detailed API documentation and advanced configuration, refer to the source code and test files.