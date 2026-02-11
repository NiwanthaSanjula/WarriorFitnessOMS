export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;
  
    constructor(message: string, statusCode: number) {
      super(message); // Pass message to the parent Error class
  
      this.statusCode = statusCode;
      // If code starts with 4, it's a 'fail' (client error), otherwise it's an 'error' (server error)
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      
      // We mark this as 'operational' so we know it's an error we expected (like a wrong password)
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }