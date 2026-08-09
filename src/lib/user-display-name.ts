import { User } from "@supabase/supabase-js";

/**
 * Extracts and capitalizes the username part from an email address.
 * E.g., divyanshgupta231@gmail.com -> Divyanshgupta231
 */
export function getEmailFallback(email?: string): string {
  if (!email) return "Developer";
  const username = email.split("@")[0];
  if (!username) return "Developer";
  return username.charAt(0).toUpperCase() + username.slice(1);
}

/**
 * Resolves the display name for a user based on the defined priority:
 * 1. profiles.full_name
 * 2. user.user_metadata.full_name
 * 3. user.user_metadata.name
 * 4. Email username fallback
 */
export function getUserDisplayName(
  user: User | null | undefined,
  profileFullName?: string | null,
): string {
  // 1. profiles.full_name
  if (profileFullName && profileFullName.trim()) {
    return profileFullName.trim();
  }

  // 2. user.user_metadata.full_name
  if (user?.user_metadata?.full_name && String(user.user_metadata.full_name).trim()) {
    return String(user.user_metadata.full_name).trim();
  }

  // 3. user.user_metadata.name
  if (user?.user_metadata?.name && String(user.user_metadata.name).trim()) {
    return String(user.user_metadata.name).trim();
  }

  // 4. user.user_metadata.given_name and family_name
  if (user?.user_metadata?.given_name || user?.user_metadata?.family_name) {
    const given = String(user.user_metadata.given_name || "").trim();
    const family = String(user.user_metadata.family_name || "").trim();
    if (given || family) {
      return `${given} ${family}`.trim();
    }
  }

  // 5. user.user_metadata.user_name (e.g. GitHub/Discord provider username)
  if (user?.user_metadata?.user_name && String(user.user_metadata.user_name).trim()) {
    return String(user.user_metadata.user_name).trim();
  }

  // 6. Email username fallback
  return getEmailFallback(user?.email);
}

/**
 * Generates up to a two-letter uppercase initial code for avatars from a display name.
 * E.g., "Divyansh Gupta" -> "DG", "Aakash K." -> "AK", "divyanshgupta231" -> "DI"
 */
export function getUserInitials(displayName: string): string {
  if (!displayName || !displayName.trim()) return "UN";
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) {
    const firstInitial = parts[0][0] || "";
    const secondInitial = parts[1][0] || "";
    return (firstInitial + secondInitial).toUpperCase();
  }
  return displayName.trim().substring(0, 2).toUpperCase();
}
