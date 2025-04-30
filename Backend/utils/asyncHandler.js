// utils/asyncHandler.js
/**
 * Wraps an async function to handle errors and pass them to Express error middleware
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - A middleware function that handles errors
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('Async handler caught error:', err);
      next(err);
    });
  };
  
  module.exports = { asyncHandler };