import { db } from "../db/connection.js";
import { leave } from "../db/schema_leave.js";
import { eq } from "drizzle-orm";

// Staff applies for leave
export async function applyLeave(req, res) {
  const { LTYPE, EMP_ID, ROLE_ID, LFROM, LTO, INCHARGE, RESON, TOTAL, Daytype, Session, Timing } = req.body;
  if (!LTYPE || !EMP_ID || !LFROM || !LTO) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    await db.insert(leave).values({
      LTYPE, EMP_ID, ROLE_ID, LFROM, LTO, INCHARGE, RESON, TOTAL, status: 0, Daytype, Session, Timing, cancel: 0
    });
    res.json({ success: true, message: "Leave applied successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Superadmin views pending leaves for their department
export async function getPendingLeaves(req, res) {
  const { dept } = req.user; // Assume dept is set in JWT or session
  try {
    const leaves = await db.select().from(leave).where(eq(leave.status, 0));
    // Optionally filter by dept if you add dept to leave table
    res.json({ success: true, leaves });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Superadmin approves/denies leave
export async function approveLeave(req, res) {
  const { id, status, cancel_reason } = req.body;
  if (!id || typeof status === 'undefined') {
    return res.status(400).json({ error: "id and status are required" });
  }
  try {
    await db.update(leave).set({ status, cancel_reason }).where(eq(leave.id, id));
    res.json({ success: true, message: "Leave status updated" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Staff views their leave status
export async function getMyLeaves(req, res) {
  console.log(req.user);
  const EMP_ID = req.user.EMP_ID; // EMP_ID is a value, not an object
  if (!EMP_ID) {
    return res.status(400).json({ error: "EMP_ID not found in token" });
  }
  try {
    const leaves = await db.select().from(leave).where(eq(leave.EMP_ID, EMP_ID));
    res.json({ success: true, leaves });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
