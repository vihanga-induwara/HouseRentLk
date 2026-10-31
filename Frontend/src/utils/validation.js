// Must match the backend rule in Backend/controllers/authController.js
export const PASSWORD_RULE = 'Password must be at least 8 characters and include uppercase, lowercase, and numbers.';

export const isStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
