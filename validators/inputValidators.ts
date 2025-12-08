// Input validation utilities for request validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must include at least one uppercase letter (A-Z)" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must include at least one lowercase letter (a-z)" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must include at least one number (0-9)" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: "Password must include at least one special character (e.g., !@#$%^&*)" };
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
  // Must be alphanumeric only (letters and numbers, no special characters or spaces)
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return { valid: false, message: "Username must be alphanumeric (letters and numbers only, no special characters or spaces)" };
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
  if (price <= 0) {
    return { valid: false, message: "Price must be a positive number greater than 0" };
  }
  if (price > 1000000) {
    return { valid: false, message: "Price cannot exceed 1,000,000" };
  }
  return { valid: true };
};

export const validateProductName = (name: string): { valid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: "Product name is required" };
  }
  if (name.trim().length < 3) {
    return { valid: false, message: "Product name must be at least 3 characters long" };
  }
  if (name.trim().length > 100) {
    return { valid: false, message: "Product name must be less than 100 characters" };
  }
  return { valid: true };
};

export const validateProductDescription = (description: string): { valid: boolean; message?: string } => {
  if (!description || description.trim().length === 0) {
    return { valid: false, message: "Product description is required" };
  }
  if (description.trim().length < 10) {
    return { valid: false, message: "Product description must be at least 10 characters long" };
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

