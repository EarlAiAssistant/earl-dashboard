// ============================================================
// Profile system — browser-based user profiles (no auth required)
// Uses localStorage for persistence, prepared for future sync
// ============================================================

'use client';

import { generateId } from '@/src/lib/utils';

/** A lightweight user profile stored in the browser */
export interface Profile {
  id: string;
  name: string;
  avatarEmoji: string;
  createdAt: string;
  updatedAt: string;
}

const PROFILES_KEY = 'earl_profiles';
const ACTIVE_PROFILE_KEY = 'earl_active_profile';

/** Available avatar emojis for profiles */
export const AVATAR_EMOJIS = [
  '🦬', '🐻', '🦊', '🐺', '🦁', '🐯', '🦅', '🐝',
  '🦉', '🐙', '🦈', '🐋', '🦩', '🦜', '🐲', '🌟',
  '🚀', '⚡', '🔥', '💎', '🎯', '🧠', '💪', '🎨',
];

/**
 * Get all profiles from localStorage.
 * Creates a default profile if none exist.
 */
export function getProfiles(): Profile[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      const defaultProfile = createDefaultProfile();
      return [defaultProfile];
    }
    const profiles = JSON.parse(raw) as Profile[];
    if (!profiles.length) {
      const defaultProfile = createDefaultProfile();
      return [defaultProfile];
    }
    return profiles;
  } catch {
    const defaultProfile = createDefaultProfile();
    return [defaultProfile];
  }
}

/** Get the currently active profile */
export function getActiveProfile(): Profile {
  if (typeof window === 'undefined') {
    return { id: 'default', name: 'My Tasks', avatarEmoji: '🦬', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }

  const profiles = getProfiles();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);

  if (activeId) {
    const found = profiles.find((p) => p.id === activeId);
    if (found) return found;
  }

  // Fall back to first profile
  const first = profiles[0];
  localStorage.setItem(ACTIVE_PROFILE_KEY, first.id);
  return first;
}

/** Set the active profile by ID */
export function setActiveProfile(profileId: string): Profile | null {
  const profiles = getProfiles();
  const profile = profiles.find((p) => p.id === profileId);
  if (!profile) return null;

  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  return profile;
}

/** Create a new profile */
export function createProfile(name: string, avatarEmoji?: string): Profile {
  const profiles = getProfiles();
  const now = new Date().toISOString();
  const profile: Profile = {
    id: generateId(),
    name: name.trim(),
    avatarEmoji: avatarEmoji || AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
    createdAt: now,
    updatedAt: now,
  };

  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

/** Rename a profile */
export function renameProfile(profileId: string, newName: string): Profile | null {
  const profiles = getProfiles();
  const profile = profiles.find((p) => p.id === profileId);
  if (!profile) return null;

  profile.name = newName.trim();
  profile.updatedAt = new Date().toISOString();
  saveProfiles(profiles);
  return profile;
}

/** Update a profile's avatar emoji */
export function updateProfileAvatar(profileId: string, avatarEmoji: string): Profile | null {
  const profiles = getProfiles();
  const profile = profiles.find((p) => p.id === profileId);
  if (!profile) return null;

  profile.avatarEmoji = avatarEmoji;
  profile.updatedAt = new Date().toISOString();
  saveProfiles(profiles);
  return profile;
}

/** Delete a profile (cannot delete the last one) */
export function deleteProfile(profileId: string): boolean {
  const profiles = getProfiles();
  if (profiles.length <= 1) return false;

  const filtered = profiles.filter((p) => p.id !== profileId);
  saveProfiles(filtered);

  // If deleted the active profile, switch to first
  const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (activeId === profileId) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, filtered[0].id);
  }

  return true;
}

/**
 * Export all data for a profile as JSON.
 * In the current architecture, tasks are in SQLite (server-side),
 * so this exports a snapshot request. For a full client-side version,
 * this would export localStorage data.
 */
export function exportProfileData(profileId: string): string {
  const profiles = getProfiles();
  const profile = profiles.find((p) => p.id === profileId);

  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: profile || null,
    profileId,
  }, null, 2);
}

// ---- Internal helpers ----

function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function createDefaultProfile(): Profile {
  const now = new Date().toISOString();
  const profile: Profile = {
    id: 'default',
    name: 'My Tasks',
    avatarEmoji: '🦬',
    createdAt: now,
    updatedAt: now,
  };
  saveProfiles([profile]);
  localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
  return profile;
}
