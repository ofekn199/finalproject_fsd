import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { env } from "../config/env";

const routesPath = path.join(__dirname, "../routes/*.ts");

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ArenaX API",
      version: "1.0.0",
      description: "Final project API documentation",
    },
    servers: [{ url: `http://localhost:${env.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [routesPath],
});