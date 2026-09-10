// ===========================================================
// tasks.js — CRUD helpers for the "tasks" Supabase table
// ===========================================================
// DB columns are snake_case (Postgres convention); this file maps
// them to the camelCase shape the rest of the app already expects
// (t.dueDate, t.ownerUid, etc.) so no HTML/UI code had to change.

import { supabase } from "./supabase-config.js";

function mapRow(r) {
  return {
    id: r.id,
    ownerUid: r.owner_uid,
    title: r.title,
    subject: r.subject,
    dueDate: r.due_date,
    priority: r.priority,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at
  };
}

export async function addTask(ownerUid, { title, subject, dueDate, priority, notes }) {
  if (!title || !dueDate) throw new Error("Title and due date are required.");
  const { error } = await supabase.from("tasks").insert({
    owner_uid: ownerUid,
    title,
    subject: subject || "General",
    due_date: dueDate,
    priority: priority || "medium",
    status: "pending",
    notes: notes || ""
  });
  if (error) throw error;
}

export async function updateTask(taskId, fields) {
  const payload = {};
  if (fields.title !== undefined) payload.title = fields.title;
  if (fields.subject !== undefined) payload.subject = fields.subject;
  if (fields.dueDate !== undefined) payload.due_date = fields.dueDate;
  if (fields.priority !== undefined) payload.priority = fields.priority;
  if (fields.notes !== undefined) payload.notes = fields.notes;
  if (fields.status !== undefined) payload.status = fields.status;

  const { error } = await supabase.from("tasks").update(payload).eq("id", taskId);
  if (error) throw error;
}

export async function deleteTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

export async function toggleTaskStatus(taskId, currentStatus) {
  const { error } = await supabase
    .from("tasks")
    .update({ status: currentStatus === "done" ? "pending" : "done" })
    .eq("id", taskId);
  if (error) throw error;
}

export async function getUserTasks(ownerUid) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("owner_uid", ownerUid)
    .order("due_date", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapRow);
}

// ---------- Helpers (unchanged) ----------
export function isOverdue(task) {
  if (task.status === "done") return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.dueDate < today;
}

export function isDueSoon(task) {
  // due within the next 2 days, not overdue, not done
  if (task.status === "done" || isOverdue(task)) return false;
  const today = new Date();
  const due = new Date(task.dueDate);
  const diffDays = (due - today) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 2;
}
