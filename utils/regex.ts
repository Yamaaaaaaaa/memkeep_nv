export const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validateUsername = (username: string): boolean => /^[A-Za-z0-9]+$/.test(username);
export const validatePassword = (password: string): boolean => password.length >= 6;
export const isNonEmpty = (field: string) => field.trim() !== "";
