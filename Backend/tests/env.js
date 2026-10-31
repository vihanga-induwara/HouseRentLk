// Environment for every test file (runs before any module is loaded)
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_that_is_long_enough_for_validation';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.ENABLE_SCHEDULER = 'false';
