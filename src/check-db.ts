import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Manually parse .env file
const envPath = path.resolve(".env");
let supabaseUrl = "";
let supabaseAnonKey = "";

try {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split("=");
    const key = parts[0]?.trim();
    const val = parts.slice(1).join("=").trim();
    if (key === "VITE_SUPABASE_URL") supabaseUrl = val;
    if (key === "VITE_SUPABASE_ANON_KEY") supabaseAnonKey = val;
  }
} catch (err: any) {
  console.error("Failed to read .env file:", err.message);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in parsed .env file");
  console.log("supabaseUrl:", supabaseUrl);
  console.log("supabaseAnonKey length:", supabaseAnonKey?.length);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  console.log("Checking if 'problem_notes' table exists...");
  const { data: notesData, error: notesError } = await supabase
    .from("problem_notes")
    .select("*")
    .limit(1);

  if (notesError) {
    console.log("Error querying problem_notes table:", notesError.message, notesError.code);
  } else {
    console.log("Successfully queried problem_notes! Table exists.");
  }

  console.log("\nChecking if 'related_problems' table exists...");
  const { data: relData, error: relError } = await supabase
    .from("related_problems")
    .select("*")
    .limit(1);

  if (relError) {
    console.log("Error querying related_problems table:", relError.message, relError.code);
  } else {
    console.log("Successfully queried related_problems! Table exists.");
  }
}

checkTable();
