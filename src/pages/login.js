// src/pages/login.js
import { db } from "../db/connection.js";
import { employeeMaster } from "../db/schema_teaching.js";
import { employeeMasterNonTeaching } from "../db/schema_non_teaching.js";
import { eq } from "drizzle-orm";
import { signAccessToken } from "../utils/jwt.js";
import { empDeptMaster } from "../db/schema_emp_dept_master.js";


/**
 * @swagger
 * /login/teaching:
 *   post:
 *     summary: Login for teaching staff
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [off_email, password]
 *             properties:
 *               off_email: { type: string, example: teacher@example.com }
 *               password:  { type: string, example: yourpassword }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token:   { type: string, description: "JWT access token (Bearer)" }
 *                 user:    { type: object }
 *       400: { description: Missing credentials }
 *       401: { description: Invalid credentials }
 */

/**
 * @swagger
 * /login/nonteaching:
 *   post:
 *     summary: Login for non-teaching staff
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [off_email, password]
 *             properties:
 *               off_email: { type: string, example: nonteacher@example.com }
 *               password:  { type: string, example: yourpassword }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token:   { type: string, description: "JWT access token (Bearer)" }
 *                 user:    { type: object }
 *       400: { description: Missing credentials }
 *       401: { description: Invalid credentials }
 */

export function registerLoginRoute(app) {
  // Teaching staff login
  app.post("/login/teaching", async (req, res) => {
    const { off_email, password } = req.body;
    if (!off_email || !password) {
      return res.status(400).json({ error: "off_email and password are required" });
    }
    try {
      const rows = await db.select().from(employeeMaster).where(eq(employeeMaster.off_email, off_email)).limit(1);
      if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
      const user = rows[0];


      // TODO: replace with bcrypt compare if passwords are hashed
      if (user.password !== password) return res.status(401).json({ error: "Invalid credentials" });
      
      const { password: _pw, ...userData } = user;
      const empId = user.emp_id ? String(user.emp_id).slice(-3) : "";
      console.log(empId);

      // Minimal claims — keep the JWT small
      const token = signAccessToken({
        sub: user.off_email, // or user.id if you have it
        role: "teaching",
        email: user.off_email,
        EMP_ID: empId,
      });

      return res.json({ success: true, token, user: userData });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
// Teaching staff login

app.post("/login/teaching", async (req, res) => {
  const { off_email, password, portal } = req.body;

  if (!off_email || !password) {
    return res.status(400).json({ error: "off_email and password are required" });
  }

  if (portal) {
    const allowedPortals = ["facultyinformation", "leaveportal"];
    if (!allowedPortals.includes(portal)) {
      return res.status(400).json({ error: "Invalid portal for teaching staff" });
    }
  }

  try {
    const rows = await db
      .select()
      .from(employeeMaster)
      .where(eq(employeeMaster.off_email, off_email))
      .limit(1);

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { password: _pw, ...userData } = user;

    const token = signAccessToken({
      sub: userData.id || userData.off_email,
      email: userData.off_email,
      role: "teaching",
      EMP_ID: userData.emp_id,
      is_superadmin: user.is_superadmin || 0, // Include super admin status
      ...(portal && { portal }),
    });

    return res.json({
      success: true,
      token,
      user: userData,
      is_superadmin: user.is_superadmin || 0, // Include in response
      ...(portal && { portal }),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

  // Non-teaching staff login
  app.post("/login/nonteaching", async (req, res) => {
    const { off_email, password } = req.body;
    if (!off_email || !password) {
      return res.status(400).json({ error: "off_email and password are required" });
    }
    try {
      const rows = await db.select().from(employeeMasterNonTeaching).where(eq(employeeMasterNonTeaching.off_email, off_email)).limit(1);
      if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
      const user = rows[0];

      // TODO: replace with bcrypt compare if passwords are hashed
      if (user.password !== password) return res.status(401).json({ error: "Invalid credentials" });

      const { password: _pw, ...userData } = user;

      const token = signAccessToken({
        sub: user.off_email, // or user.id if you have it
        role: "non-teaching",
        email: user.off_email,
      });

      return res.json({ success: true, token, user: userData });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
app.post("/login/nonteaching", async (req, res) => {
  const { off_email, password, portal } = req.body;

  if (!off_email || !password) {
    return res.status(400).json({ error: "off_email and password are required" });
  }

  if (portal) {
    if (portal !== "leaveportal") {
      return res.status(400).json({ error: "Invalid portal for non-teaching staff" });
    }
  }

  try {
    const rows = await db
      .select()
      .from(employeeMasterNonTeaching)
      .where(eq(employeeMasterNonTeaching.off_email, off_email))
      .limit(1);

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { password: _pw, ...userData } = user;

    const token = signAccessToken({
      sub: userData.id || userData.off_email,
      email: userData.off_email,
      role: "nonteaching",
      EMP_ID: userData.emp_id || userData.id,
      is_superadmin: user.is_superadmin || 0, // Include super admin status
      ...(portal && { portal }),
    });

    return res.json({
      success: true,
      token,
      user: userData,
      is_superadmin: user.is_superadmin || 0, // Include in response
      ...(portal && { portal }),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
}
