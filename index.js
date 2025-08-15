// index.js
import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { db } from "./src/db/connection.js";
import { employeeMaster } from "./src/db/schema_teaching.js";
import { registerLoginRoute } from "./src/pages/login.js";
import { authMiddleware } from "./src/utils/jwt.js"; 

dotenv.config();

const app = express();
app.use(express.json());

// Swagger setup (add Bearer scheme)
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Employee API",
    version: "1.0.0",
    description: "API documentation for Employee Login and Health Check",
  },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
};
const options = { swaggerDefinition, apis: ["./src/pages/login.js", "./index.js"] };
const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Register login API
registerLoginRoute(app);

// Public health check (leave public if you want)
app.get("/health", async (_req, res) => {
  try {
    await db.select().from(employeeMaster).limit(1);
    res.json({ status: "ok", db: "up" });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// Example protected route
/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user (requires Bearer token)
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, async () => {
  try {
    await db.select().from(employeeMaster).limit(1);
    console.log(`Server listening on http://localhost:${port}`);
  } catch (e) {
    console.error("Failed to connect to MySQL:", e.message);
    process.exit(1);
  }
});
