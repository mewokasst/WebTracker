// ===========================================================
// shared-deadlines.js — CRUD helpers for the
// "shared_deadlines" Supabase table (admin-posted,
// visible to every student on the dashboard)
// ===========================================================

import { supabase } from "./supabase-config.js";

function mapRow(r) {
  return {
    id: r.id,
    title: r.title,
    subjectOrScope: r.subject_or_scope,
    dueDate: r.due_date,
    description: r.description,
    postedBy: r.posted_by,
    createdAt: r.created_at
  };
}

export async function addSharedDeadline(postedByUid, { title, subjectOrScope, dueDate, description }) {
  if (!title || !dueDate) throw new Error("Title and due date are required.");
  const { error } = await supabase.from("shared_deadlines").insert({
    title,
    subject_or_scope: subjectOrScope || "All Students",
    due_date: dueDate,
    description: description || "",
    posted_by: postedByUid
  });
  if (error) throw error;
}

export async function deleteSharedDeadline(id) {
  const { error } = await supabase.from("shared_deadlines").delete().eq("id", id);
  if (error) throw error;
}

export async function getAllSharedDeadlines() {
  const { data, error } = await supabase
    .from("shared_deadlines")
    .select("*")
    .order("due_date", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapRow);
}
