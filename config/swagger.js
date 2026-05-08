const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Alumni Platform API',
      version:     '1.0.0',
      description: 'Web API for the AR Alumni Platform — University of Westminster',
    },
    servers: [{ url: process.env.BASE_URL || 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        apiKey:     { type: 'http', scheme: 'bearer', bearerFormat: 'API Key' },
      },
    },
  },
  apis: ['./routes/*.js'], 
});