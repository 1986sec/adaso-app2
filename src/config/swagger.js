const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ADASO Backend API',
      version: '1.0.0',
      description: 'ADASO Firma Takip Sistemi Backend API Documentation',
      contact: {
        name: 'ADASO Team',
        email: 'info@adaso.com',
        url: 'https://adaso.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:7000',
        description: 'Development server'
      },
      {
        url: 'https://api.adaso.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' }
          }
        },
        Company: {
          type: 'object',
          properties: {
            companyName: { type: 'string', example: 'ABC Company Ltd.' },
            contactPerson: { type: 'string', example: 'Jane Smith' },
            email: { type: 'string', format: 'email', example: 'info@abc.com' },
            phone: { type: 'string', example: '+90 212 123 45 67' },
            sector: { type: 'string', example: 'Technology' },
            status: { type: 'string', enum: ['active', 'inactive', 'prospect'], example: 'active' }
          }
        },
        Visit: {
          type: 'object',
          properties: {
            company: { type: 'string', example: '507f1f77bcf86cd799439011' },
            visitDate: { type: 'string', format: 'date', example: '2024-01-15' },
            status: { type: 'string', enum: ['planned', 'completed', 'cancelled'], example: 'planned' },
            visitType: { type: 'string', enum: ['regular', 'special'], example: 'regular' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['income', 'expense'], example: 'income' },
            category: { type: 'string', example: 'Sales' },
            amount: { type: 'number', example: 1000.00 },
            description: { type: 'string', example: 'Monthly sales revenue' },
            date: { type: 'string', format: 'date', example: '2024-01-15' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
