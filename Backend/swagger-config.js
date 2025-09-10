import swaggerJsdoc from 'swagger-jsdoc';
import { writeFileSync } from 'fs';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'University Evaluation API',
      version: '1.0.0',
      description: 'University evaluation system with 3 dimensions: Governance, Social, Environmental - Auto-generated documentation',
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
        description: 'User authentication endpoints'
      },
      {
        name: 'Universities',
        description: 'University management endpoints'
      },
      {
        name: 'Dimensions',
        description: 'Evaluation dimensions (Governance, Social, Environmental)'
      },
      {
        name: 'Questions',
        description: 'Evaluation questions for each dimension'
      },
      {
        name: 'Evaluations',
        description: 'University evaluation management'
      },
      {
        name: 'Protected',
        description: 'Protected endpoints that require authentication'
      },
      {
        name: 'Health',
        description: 'API health status'
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
        },
        Dimension: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Governance'
            },
            code: {
              type: 'string',
              example: 'governance'
            },
            description: {
              type: 'string',
              example: 'Governance dimension evaluation'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T10:00:00Z'
            }
          }
        },
        Question: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            dimension_id: {
              type: 'integer',
              example: 1
            },
            text: {
              type: 'string',
              example: 'How would you rate the university governance transparency?'
            },
            order_index: {
              type: 'integer',
              example: 1
            },
            scale_descriptions: {
              type: 'object',
              example: {
                "1": "Poor transparency",
                "2": "Fair transparency", 
                "3": "Good transparency",
                "4": "Very good transparency",
                "5": "Excellent transparency"
              }
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T10:00:00Z'
            }
          }
        },
        University: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Universidad Nacional'
            },
            city: {
              type: 'string',
              example: 'Bogotá'
            },
            department: {
              type: 'string',
              example: 'Cundinamarca'
            }
          }
        },
        EvaluationResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            evaluation_id: {
              type: 'integer',
              example: 1
            },
            question_id: {
              type: 'integer',
              example: 1
            },
            score: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 4
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T10:00:00Z'
            },
            questions: {
              $ref: '#/components/schemas/Question'
            }
          }
        },
        Evaluation: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            university_id: {
              type: 'integer',
              example: 1
            },
            dimension_id: {
              type: 'integer',
              example: 1
            },
            status: {
              type: 'string',
              enum: ['draft', 'submitted'],
              example: 'draft'
            },
            comments: {
              type: 'string',
              nullable: true,
              example: 'Overall good governance practices'
            },
            submitted_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2024-01-01T10:00:00Z'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T09:00:00Z'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T09:30:00Z'
            },
            universities: {
              $ref: '#/components/schemas/University'
            },
            dimensions: {
              $ref: '#/components/schemas/Dimension'
            }
          }
        },
        EvaluationWithResponses: {
          allOf: [
            {
              $ref: '#/components/schemas/Evaluation'
            },
            {
              type: 'object',
              properties: {
                evaluation_responses: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/EvaluationResponse'
                  }
                }
              }
            }
          ]
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