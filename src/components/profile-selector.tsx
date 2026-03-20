// ============================================================
// Profile selector — dropdown in the header for switching profiles
// ============================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { useProfiles } from '@/src/lib/hooks/use-profiles';
import { AVATAR_EMOJIS, type Profile } from '@/src/lib/profiles';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';
import { toastSuccess, toastError } from '@/src/lib/hooks/use-toast';
import {
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Download,
  Upload,
  UserCircle,
} from 'lucide-react';

export function ProfileSelector() {
  const {
    profiles,
    activeProfile,
    switchProfile,
    addProfile,
    rename,
    updateAvatar,
    remove,
    mounted,
  } = useProfiles();

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setEditing(null);
        setShowEmojiPicker(null);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!mounted || !activeProfile) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground">
        <UserCircle className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  const handleSwitch = (profileId: string) => {
    switchProfile(profileId);
    setOpen(false);
    toastSuccess('Profile switched');
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const profile = addProfile(newName.trim());
    switchProfile(profile.id);
    setNewName('');
    setCreating(false);
    toastSuccess('Profile created', profile.name);
  };

  const handleRename = (profileId: string) => {
    if (!editName.trim()) return;
    rename(profileId, editName.trim());
    setEditing(null);
    toastSuccess('Profile renamed');
  };

  const handleDelete = (profileId: string) => {
    if (profiles.length <= 1) {
      toastError("Can't delete", 'You need at least one profile');
      return;
    }
    const success = remove(profileId);
    if (success) {
      toastSuccess('Profile deleted');
    }
  };

  const handleExport = async () => {
    try {
      // Fetch all tasks to include in export
      const res = await fetch('/api/tasks?pageSize=1000');
      const data = await res.json();

      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        profile: activeProfile,
        tasks: data.data || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earl-dashboard-${activeProfile.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toastSuccess('Data exported');
    } catch {
      toastError('Export failed');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.version || !data.tasks || !Array.isArray(data.tasks)) {
          toastError('Invalid file', 'Not a valid Earl Dashboard export');
          return;
        }

        // Import tasks one by one
        let imported = 0;
        for (const task of data.tasks) {
          const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
            }),
          });
          if (res.ok) imported++;
        }

        toastSuccess(`Imported ${imported} tasks`);
        // Trigger a page reload to refresh data
        window.location.reload();
      } catch {
        toastError('Import failed', 'Could not parse the file');
      }
    };
    input.click();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border',
          'hover:bg-accent hover:border-ring/30 transition-all text-sm',
          open && 'bg-accent border-ring/30'
        )}
        aria-label="Switch profile"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-base leading-none" role="img" aria-label={activeProfile.name}>
          {activeProfile.avatarEmoji}
        </span>
        <span className="font-medium max-w-[120px] truncate">{activeProfile.name}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-[280px] bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
          {/* Profile list */}
          <div className="p-1.5 max-h-[300px] overflow-y-auto" role="listbox" aria-label="Profiles">
            {profiles.map((profile) => (
              <div key={profile.id} role="option" aria-selected={profile.id === activeProfile.id}>
                {editing === profile.id ? (
                  /* Edit mode */
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <button
                      onClick={() => setShowEmojiPicker(showEmojiPicker === profile.id ? null : profile.id)}
                      className="text-base shrink-0 hover:scale-110 transition-transform"
                      title="Change avatar"
                    >
                      {profile.avatarEmoji}
                    </button>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(profile.id);
                        if (e.key === 'Escape') setEditing(null);
                      }}
                    />
                    <button
                      onClick={() => handleRename(profile.id)}
                      className="p-1 hover:bg-accent rounded text-green-400"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="p-1 hover:bg-accent rounded text-muted-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Display mode */
                  <div
                    className={cn(
                      'flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer group transition-colors',
                      profile.id === activeProfile.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-accent'
                    )}
                    onClick={() => handleSwitch(profile.id)}
                  >
                    <span className="text-base shrink-0">{profile.avatarEmoji}</span>
                    <span className="flex-1 text-sm font-medium truncate">{profile.name}</span>

                    {profile.id === activeProfile.id && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}

                    {/* Edit/delete buttons (on hover) */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditName(profile.name);
                          setEditing(profile.id);
                        }}
                        className="p-1 hover:bg-muted rounded"
                        title="Rename"
                      >
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </button>
                      {profiles.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(profile.id);
                          }}
                          className="p-1 hover:bg-muted rounded"
                          title="Delete profile"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Emoji picker */}
                {showEmojiPicker === profile.id && (
                  <div className="grid grid-cols-8 gap-1 px-2 py-2 border-t border-border">
                    {AVATAR_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          updateAvatar(profile.id, emoji);
                          setShowEmojiPicker(null);
                        }}
                        className={cn(
                          'p-1.5 rounded hover:bg-accent text-base transition-colors',
                          profile.avatarEmoji === emoji && 'bg-primary/20 ring-1 ring-primary/30'
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Create new profile */}
          <div className="border-t border-border p-1.5">
            {creating ? (
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Profile name..."
                  className="h-7 text-sm flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                  }}
                />
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="p-1 hover:bg-accent rounded text-green-400 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => { setCreating(false); setNewName(''); }}
                  className="p-1 hover:bg-accent rounded text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Profile
              </button>
            )}
          </div>

          {/* Import/Export */}
          <div className="border-t border-border p-1.5 flex gap-1">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
