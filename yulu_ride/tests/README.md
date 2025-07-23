# Yulu Ride API Tests

This directory contains tests for the Yulu Ride API.

## Test Structure

- `controllers/`: Unit tests for controller functions
- `integration/`: Integration tests that test the API endpoints with the actual database

## Running Tests

To run all tests:

```bash
npm test
```

To run specific tests:

```bash
npm test -- tests/controllers/get_available_bikes.controller.test.js
npm test -- tests/integration/get_available_bikes.integration.test.js
```

## Test Database

The integration tests use the test database configured in `db/connectTestDB.js`. Make sure the test database is properly set up with the required tables and test data before running the integration tests.

### Required Test Data

For integration tests to work properly, the test database should contain:

1. A valid user with sufficient balance (>= 50)
2. A blocked user
3. A user with low balance (< 50)
4. Bikes in a service area
5. Service areas with proper spatial data

## Test Coverage

Test coverage reports are generated in the `coverage/` directory after running the tests. Open `coverage/lcov-report/index.html` in a browser to view the coverage report.

## HTML Reports

HTML test reports are generated in the `html-report/` directory. Open `html-report/report.html` in a browser to view the test results in a more readable format.