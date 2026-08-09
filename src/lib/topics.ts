import { supabase } from "./supabase";

export async function getTopics() {
  const { data, error } = await supabase.from("topics").select("*").order("name");

  if (error) {
    console.error("TOPICS ERROR:", error);
    return [];
  }

  return data || [];
}
