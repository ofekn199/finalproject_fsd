import swaggerJSDoc from "swagger-jsdoc";
import { env } from "../config/env";

// Swagger (OpenAPI) configuration
export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ArenaX API",
      version: "1.0.0",
      description: "Final project API documentation",
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
      },
    ],
  },
  apis: ["src/routes/*.ts"],
});