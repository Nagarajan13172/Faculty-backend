import express from "express";
import dotenv from "dotenv";
import { db } from "./src/db/connection.js";
import { employeeMaster } from "./src/db/schema_teaching.js";
import { eq } from "drizzle-orm";
import { registerLoginRoute } from "./src/pages/login.js";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const app = express();
app.use(express.json());

// Swagger setup
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Employee API",
    version: "1.0.0",
    description: "API documentation for Employee Login and Health Check",
  },
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/pages/login.js", "./index.js"],
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Register login API
registerLoginRoute(app);


app.get("/health", async (_req, res) => {
  try {
    // drizzle-orm health check
    await db.select().from(employeeMaster).limit(1);
    res.json({ status: "ok", db: "up" });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});


const port = Number(process.env.PORT || 3000);
app.listen(port, async () => {
  try {
    // drizzle-orm connection check at startup
    await db.select().from(employeeMaster).limit(1);
    console.log(`Server listening on http://localhost:${port}`);
  } catch (e) {
    console.error("Failed to connect to MySQL:", e.message);
    process.exit(1);
  }
});
