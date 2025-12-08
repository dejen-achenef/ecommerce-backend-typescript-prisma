// Input validation utilities for request validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" };
  }
  if (password.length > 100) {
    return { valid: false, message: "Password must be less than 100 characters" };
  }
  return { valid: true };
};

export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  if (!username || username.trim().length === 0) {
    return { valid: false, message: "Username is required" };
  }
  if (username.length < 3) {
    return { valid: false, message: "Username must be at least 3 characters long" };
  }
  if (username.length > 50) {
    return { valid: false, message: "Username must be less than 50 characters" };
  }
  return { valid: true };
};

export const validatePrice = (price: number): { valid: boolean; message?: string } => {
  if (price < 0) {
    return { valid: false, message: "Price cannot be negative" };
  }
  if (price > 1000000) {
    return { valid: false, message: "Price cannot exceed 1,000,000" };
  }
  return { valid: true };
};

export const validateStock = (stock: number): { valid: boolean; message?: string } => {
  if (stock < 0) {
    return { valid: false, message: "Stock cannot be negative" };
  }
  if (!Number.isInteger(stock)) {
    return { valid: false, message: "Stock must be an integer" };
  }
  return { valid: true };
};

