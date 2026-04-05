'use client';

import React, { useEffect, useState, useCallback } from 'react';

/**
 * Admin "Publish to Live" button.
 *
 * Rendered in the Payload admin as a custom beforeNavLinks component so it
 * sits in the sidebar above every page. Shows:
 *   - Big orange "Publish to Live" button (fires POST /api/publish-now)
 *   - Last published timestamp (relative)
 *   - "Changes waiting" indicator when deploy-state.pendingChangesSince is set
 *   - Cooldown countdown when within the 15-min auto-deploy window
 *
 * Refreshes its state every 30 seconds.
 */

type DeployState = {
  lastAutoDeployAt?: string | null;
  lastManualDeployAt?: string | null;
  lastTriggeredBy?: 'auto' | 'manual' | 'cron' | null;
  pendingChangesSince?: string | null;
};

const COOLDOWN_MS = 15 * 60 * 1000;
const REFRESH_MS = 30 * 1000;

function relativeTime(iso?: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function fmtCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function PublishButton() {
  const [state, setState] = useState<DeployState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [now, setNow] = useState(Date.now());

  // Poll DeployState global
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/globals/deploy-state', { credentials: 'include' });
      if (res.ok) setState(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
    const i1 = setInterval(refresh, REFRESH_MS);
    const i2 = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(i1);
      clearInterval(i2);
    };
  }, [refresh]);

  const handlePublish = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/publish-now', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ kind: 'ok', text: json.message || 'Deploy triggered' });
        refresh();
      } else {
        setMessage({ kind: 'err', text: json.error || 'Failed to trigger deploy' });
      }
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message });
    } finally {
      setBusy(false);
      setTimeout(() => setMessage(null), 6000);
    }
  };

  const lastAt = state?.lastAutoDeployAt ? new Date(state.lastAutoDeployAt).getTime() : 0;
  const cooldownRemaining = Math.max(0, COOLDOWN_MS - (now - lastAt));
  const inCooldown = cooldownRemaining > 0;
  const hasPending = !!state?.pendingChangesSince;

  return (
    <div
      style={{
        padding: '1rem',
        margin: '1rem 0',
        borderRadius: '0.5rem',
        background: 'rgba(244, 143, 40, 0.08)',
        border: '1px solid rgba(244, 143, 40, 0.3)',
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#936950',
          marginBottom: '0.5rem',
        }}
      >
        Live site
      </div>

      <button
        type="button"
        onClick={handlePublish}
        disabled={busy}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: busy ? '#d78040' : '#f48f28',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0.375rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: busy ? 'wait' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {busy ? 'Publishing…' : 'Publish to Live'}
      </button>

      <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', lineHeight: 1.5, color: '#555' }}>
        <div>
          Last published: <strong>{relativeTime(state?.lastAutoDeployAt)}</strong>
          {state?.lastTriggeredBy && (
            <span style={{ opacity: 0.6 }}> ({state.lastTriggeredBy})</span>
          )}
        </div>

        {hasPending && !inCooldown && (
          <div style={{ color: '#c26a00', marginTop: '0.25rem' }}>
            ⚠ Changes waiting — click to publish
          </div>
        )}

        {hasPending && inCooldown && (
          <div style={{ color: '#c26a00', marginTop: '0.25rem' }}>
            ⚠ {relativeTime(state.pendingChangesSince)}: changes pending · auto-publish in{' '}
            {fmtCountdown(cooldownRemaining)}
          </div>
        )}

        {!hasPending && inCooldown && (
          <div style={{ opacity: 0.6, marginTop: '0.25rem' }}>
            Cooldown: next auto-publish in {fmtCountdown(cooldownRemaining)}
          </div>
        )}
      </div>

      {message && (
        <div
          style={{
            marginTop: '0.6rem',
            padding: '0.5rem 0.65rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            background: message.kind === 'ok' ? '#e8f5e9' : '#fdecea',
            color: message.kind === 'ok' ? '#1b5e20' : '#b71c1c',
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
