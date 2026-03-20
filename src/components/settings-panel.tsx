// ============================================================
// Settings panel — notification preferences, integrations, webhooks
// ============================================================

'use client';

import { useState } from 'react';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/src/lib/hooks/use-notifications';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { toastSuccess, toastError } from '@/src/lib/hooks/use-toast';
import { cn } from '@/src/lib/utils';
import {
  Bell,
  Webhook,
  Settings,
  Slack,
  Mail,
  X,
  Plus,
  Trash2,
  Loader2,
  Check,
  Bot,
} from 'lucide-react';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors',
          checked ? 'bg-blue-500' : 'bg-muted'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}

function NotificationSettings() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  if (isLoading || !prefs) {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }

  const handleUpdate = (key: string, value: boolean) => {
    updatePrefs.mutate({ [key]: value });
    toastSuccess('Preferences updated');
  };

  return (
    <div className="space-y-1 divide-y divide-border">
      <Toggle
        checked={prefs.taskCreated}
        onChange={(v) => handleUpdate('taskCreated', v)}
        label="Task Created"
        description="When a new task is created"
      />
      <Toggle
        checked={prefs.taskCompleted}
        onChange={(v) => handleUpdate('taskCompleted', v)}
        label="Task Completed"
        description="When a task is marked as done"
      />
      <Toggle
        checked={prefs.statusChanged}
        onChange={(v) => handleUpdate('statusChanged', v)}
        label="Status Changes"
        description="When task status changes"
      />
      <Toggle
        checked={prefs.priorityChanged}
        onChange={(v) => handleUpdate('priorityChanged', v)}
        label="Priority Changes"
        description="When task priority changes"
      />
      <Toggle
        checked={prefs.highPriority}
        onChange={(v) => handleUpdate('highPriority', v)}
        label="Urgent Tasks"
        description="When a task is set to urgent"
      />
      <Toggle
        checked={prefs.earlAction}
        onChange={(v) => handleUpdate('earlAction', v)}
        label="Earl Actions"
        description="When Earl creates or modifies tasks"
      />
    </div>
  );
}

function WebhookSettings() {
  const [webhooks, setWebhooks] = useState<Array<{ id: string; name: string; url: string; enabled: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  // Load webhooks
  useState(() => {
    fetch('/api/webhooks')
      .then((r) => r.json())
      .then((data) => {
        setWebhooks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  });

  const addWebhook = async () => {
    if (!name || !url) return;
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, events: ['*'] }),
      });
      if (res.ok) {
        const data = await res.json();
        setWebhooks((wh) => [...wh, { id: data.id, name, url, enabled: true }]);
        setName('');
        setUrl('');
        toastSuccess('Webhook created');
      }
    } catch {
      toastError('Failed to create webhook');
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      await fetch(`/api/webhooks?id=${id}`, { method: 'DELETE' });
      setWebhooks((wh) => wh.filter((w) => w.id !== id));
      toastSuccess('Webhook deleted');
    } catch {
      toastError('Failed to delete webhook');
    }
  };

  const toggleWebhook = async (id: string, enabled: boolean) => {
    try {
      await fetch('/api/webhooks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });
      setWebhooks((wh) => wh.map((w) => (w.id === id ? { ...w, enabled } : w)));
    } catch {
      toastError('Failed to update webhook');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add webhook */}
      <div className="space-y-2">
        <Input
          placeholder="Webhook name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm"
        />
        <div className="flex gap-2">
          <Input
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={addWebhook} disabled={!name || !url}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Webhook list */}
      {webhooks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No webhooks configured</p>
      ) : (
        <div className="space-y-2">
          {webhooks.map((wh) => (
            <div key={wh.id} className="flex items-center gap-2 p-2 border border-border rounded text-sm">
              <div className={cn('w-2 h-2 rounded-full', wh.enabled ? 'bg-green-400' : 'bg-gray-400')} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{wh.name}</div>
                <div className="text-xs text-muted-foreground truncate">{wh.url}</div>
              </div>
              <button
                onClick={() => toggleWebhook(wh.id, !wh.enabled)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {wh.enabled ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => deleteWebhook(wh.id)} className="p-1 hover:bg-accent rounded">
                <Trash2 className="h-3 w-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EarlApiInfo() {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm">
        <div className="flex items-center gap-2 font-medium text-blue-400 mb-2">
          <Bot className="h-4 w-4" />
          Earl AI Integration
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Earl can create, update, and manage tasks programmatically via the API.
        </p>
        <div className="space-y-1 text-xs font-mono">
          <div><span className="text-muted-foreground">Endpoint:</span> POST /api/earl</div>
          <div><span className="text-muted-foreground">Auth:</span> Bearer $EARL_API_KEY</div>
        </div>
      </div>

      <div className="text-xs space-y-2">
        <div className="font-medium">Actions:</div>
        <div className="p-2 bg-muted/30 rounded font-mono text-[11px] space-y-1">
          <div>{'{ "action": "create", "title": "...", "priority": "high" }'}</div>
          <div>{'{ "action": "update", "id": "...", "status": "in_progress" }'}</div>
          <div>{'{ "action": "done", "id": "..." }'}</div>
          <div>{'{ "action": "note", "id": "...", "note": "..." }'}</div>
          <div>{'{ "action": "search", "query": "...", "status": "..." }'}</div>
        </div>
      </div>

      <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
        <span className="font-medium">Env var:</span> Set <code className="px-1 py-0.5 bg-muted rounded">EARL_API_KEY</code> to
        secure the endpoint. Default dev key: <code className="px-1 py-0.5 bg-muted rounded">earl-dev-key-change-me</code>
      </div>
    </div>
  );
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [tab, setTab] = useState<'notifications' | 'webhooks' | 'earl'>('notifications');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[520px] max-h-[80vh] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-5">
          {[
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'webhooks', label: 'Webhooks', icon: Webhook },
            { id: 'earl', label: 'Earl API', icon: Bot },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors -mb-px',
                tab === id
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setTab(id as typeof tab)}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {tab === 'notifications' && <NotificationSettings />}
          {tab === 'webhooks' && <WebhookSettings />}
          {tab === 'earl' && <EarlApiInfo />}
        </div>
      </div>
    </div>
  );
}
