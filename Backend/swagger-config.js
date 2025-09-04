import swaggerJsdoc from 'swagger-jsdoc';
import { writeFileSync } from 'fs';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Supabase Auth API',
      version: '1.0.0',
      description: 'API de autenticación con Supabase - Documentación automática generada',
      contact: {
        name: 'API Support',
        email: 'support@api.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticación de usuarios'
      },
      {
        name: 'Protected',
        description: 'Endpoints protegidos que requieren autenticación'
      },
      {
        name: 'Health',
        description: 'Estado de la API'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
            },
            email: {
              type: 'string',
              example: 'usuario@ejemplo.com'
            },
            email_confirmed_at: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00Z'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00Z'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'usuario@ejemplo.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'mipassword123'
            }
          }
        },
        SignupRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'nuevo@ejemplo.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'mipassword123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                session: {
                  type: 'object',
                  properties: {
                    access_token: {
                      type: 'string'
                    },
                    refresh_token: {
                      type: 'string'
                    },
                    expires_at: {
                      type: 'number'
                    },
                    token_type: {
                      type: 'string',
                      example: 'bearer'
                    }
                  }
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'LOGIN_ERROR'
            },
            message: {
              type: 'string',
              example: 'Invalid credentials'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object',
              nullable: true
            }
          }
        }
      }
    }
  },
  apis: ['./src/controllers/*.js', './src/routes/*.js', './src/app.js'],
};

const specs = swaggerJsdoc(options);

writeFileSync('./swagger-output.json', JSON.stringify(specs, null, 2));

console.log('✅ Swagger documentation generated successfully!');
console.log('📄 File: swagger-output.json');