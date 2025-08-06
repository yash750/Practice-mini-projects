# Test Database Setup Guide

This project now supports two testing approaches:

## 1. Manual Test Data (Existing)
- **File**: `tests/integration/get_available_bikes.integration.test.js`
- **Command**: `npm run test:manual`
- **Setup**: Requires manual data insertion into main database
- **Use case**: When you want to test with real database entries

## 2. Automated Test Data (New)
- **File**: `tests/integration/get_available_bikes.auto.integration.test.js`
- **Command**: `npm run test:auto`
- **Setup**: Automatically creates and cleans up test data in test database
- **Use case**: Clean, isolated testing environment

## Database Requirements

### Test Database Setup
1. Create test database: `yulu_ride_test`
2. Run the same schema as main database
3. Ensure `.env.test` has correct test database credentials

### Running Tests

```bash
# Run manual tests (existing approach)
npm run test:manual

# Run automated tests (new approach)
npm run test:auto

# Run all tests (both approaches)
npm test
```

## Test Data Setup Utility

The `TestDataSetup` class in `tests/utils/testDataSetup.js` provides:

- **Automatic data creation**: Users, bikes, service areas, cities
- **Complete cleanup**: Removes all created data after tests
- **Database consistency**: Ensures clean state before and after tests
- **Flexible configuration**: Override default test data as needed

## Benefits of Automated Approach

1. **No manual setup required**
2. **Consistent test environment**
3. **Parallel test execution safe**
4. **Complete isolation between test runs**
5. **Automatic cleanup prevents data pollution**

Both approaches coexist - choose based on your testing needs.