import { db } from "../db/connection.js";
import { employeeMaster } from "../db/schema_teaching.js";
import { employeeMasterNonTeaching } from "../db/schema_non_teaching.js";
import { eq } from "drizzle-orm";

/**
 * @swagger
 * /login/teaching:
 *   post:
 *     summary: Login for teaching staff
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - off_email
 *               - password
 *             properties:
 *               off_email:
 *                 type: string
 *                 example: teacher@example.com
 *               password:
 *                 type: string
 *                 example: yourpassword
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /login/nonteaching:
 *   post:
 *     summary: Login for non-teaching staff
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - off_email
 *               - password
 *             properties:
 *               off_email:
 *                 type: string
 *                 example: nonteacher@example.com
 *               password:
 *                 type: string
 *                 example: yourpassword
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials
 */

export function registerLoginRoute(app) {
  // Teaching staff login
  app.post("/login/teaching", async (req, res) => {
    const { off_email, password } = req.body;
    if (!off_email || !password) {
      return res.status(400).json({ error: "off_email and password are required" });
    }
    try {
      const user = await db
        .select()
        .from(employeeMaster)
        .where(eq(employeeMaster.off_email, off_email))
        .limit(1);
      if (!user.length) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (user[0].password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // Remove password from response
      const { password: _pw, ...userData } = user[0];
      res.json({ success: true, user: userData });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Non-teaching staff login
  app.post("/login/nonteaching", async (req, res) => {
    const { off_email, password } = req.body;
    if (!off_email || !password) {
      return res.status(400).json({ error: "off_email and password are required" });
    }
    try {
      const user = await db
        .select()
        .from(employeeMasterNonTeaching)
        .where(eq(employeeMasterNonTeaching.off_email, off_email))
        .limit(1);
      if (!user.length) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (user[0].password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // Remove password from response
      const { password: _pw, ...userData } = user[0];
      res.json({ success: true, user: userData });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

