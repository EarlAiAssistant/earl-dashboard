// ============================================================
// React hook for profile management with reactive state
// ============================================================

'use client';

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  getProfiles,
  getActiveProfile,
  setActiveProfile as setActiveProfileFn,
  createProfile as createProfileFn,
  renameProfile as renameProfileFn,
  updateProfileAvatar as updateProfileAvatarFn,
  deleteProfile as deleteProfileFn,
  type Profile,
} from '@/src/lib/profiles';

// Simple event emitter for profile changes
let listeners: Array<() => void> = [];
let snapshotVersion = 0;

function emitChange() {
  snapshotVersion++;
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return snapshotVersion;
}

function getServerSnapshot() {
  return 0;
}

/**
 * Hook to manage profiles with reactive updates.
 * All mutations trigger re-renders across all consumers.
 */
export function useProfiles() {
  // Subscribe to changes
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profiles = mounted ? getProfiles() : [];
  const activeProfile = mounted ? getActiveProfile() : null;

  const switchProfile = useCallback((profileId: string) => {
    const result = setActiveProfileFn(profileId);
    if (result) emitChange();
    return result;
  }, []);

  const addProfile = useCallback((name: string, avatarEmoji?: string) => {
    const profile = createProfileFn(name, avatarEmoji);
    emitChange();
    return profile;
  }, []);

  const rename = useCallback((profileId: string, newName: string) => {
    const result = renameProfileFn(profileId, newName);
    if (result) emitChange();
    return result;
  }, []);

  const updateAvatar = useCallback((profileId: string, avatarEmoji: string) => {
    const result = updateProfileAvatarFn(profileId, avatarEmoji);
    if (result) emitChange();
    return result;
  }, []);

  const remove = useCallback((profileId: string) => {
    const success = deleteProfileFn(profileId);
    if (success) emitChange();
    return success;
  }, []);

  return {
    profiles,
    activeProfile,
    switchProfile,
    addProfile,
    rename,
    updateAvatar,
    remove,
    mounted,
  };
}
