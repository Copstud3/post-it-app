import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Post-it App API",
      version: "1.0.0",
      description: "API documentation for the Post-it social media app",
    },
    servers: [
        {
            url: "{protocol}://{host}",
            description: "Current server",
            variables: {
              protocol: { default: "https" },
              host: { default: "post-it-app-cwv0.onrender.com/" },
            },
          },
          { url: "http://localhost:3000", description: "Local development server" },
    ],
  },
  apis: ["./src/controllers/*.ts"], // Point to your controller files
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("Swagger docs available at /api/v1/docs");
  };