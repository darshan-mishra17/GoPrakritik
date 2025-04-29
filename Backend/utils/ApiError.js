// utils/ApiError.js
/**
 * Custom API error class that extends the built-in Error class
 * @class
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Create a new ApiError instance
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {boolean} [isOperational=true] - Whether the error is operational (vs programming error)
     * @param {string} [stack=''] - Error stack trace
     */
    constructor(statusCode, message, isOperational = true, stack = '') {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
    
    /**
     * Creates a "bad request" error (400)
     * @param {string} message - Error message
     * @returns {ApiError} - New ApiError instance
     */
    static badRequest(message) {
      return new ApiError(400, message);
    }
    
    /**
     * Creates an "unauthorized" error (401)
     * @param {string} message - Error message
     * @returns {ApiError} - New ApiError instance
     */
    static unauthorized(message) {
      return new ApiError(401, message);
    }
    
    /**
     * Creates a "forbidden" error (403)
     * @param {string} message - Error message
     * @returns {ApiError} - New ApiError instance
     */
    static forbidden(message) {
      return new ApiError(403, message);
    }
    
    /**
     * Creates a "not found" error (404)
     * @param {string} message - Error message
     * @returns {ApiError} - New ApiError instance
     */
    static notFound(message) {
      return new ApiError(404, message);
    }
    
    /**
     * Creates an "internal server" error (500)
     * @param {string} message - Error message
     * @returns {ApiError} - New ApiError instance
     */
    static internal(message) {
      return new ApiError(500, message);
    }
  }
  
  module.exports = ApiError;