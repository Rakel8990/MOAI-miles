// Shared leaderboard API for Moai Miles, backed by Upstash Redis (installed via
// Vercel's Marketplace storage integration — see README.md for the one-time setup).
//
// GET  /api/leaderboard  -> { entries: [...top 20 by score...] }
// POST /api/leaderboard  -> body: { name, score, bags, distance } -> { entries: [...] }
//
// If no database is connected yet, this responds with 503 so the game can fall
// back to each player's local leaderboard instead of breaking.

import { Redis } from '@upstash/redis';

// Vercel's Upstash Marketplace integration has used a couple of different env var
// names over time, so we check both to avoid a naming mismatch breaking this.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = REDIS_URL && REDIS_TOKEN ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

const KEY = 'moaiMiles:leaderboard';
const MAX_STORED = 100; // keep some headroom server-side beyond what's displayed
const MAX_RETURNED = 20;

function sanitizeEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.name || 'Runner').trim().slice(0, 20) || 'Runner';
  const score = Number(raw.score);
  const bags = Number(raw.bags);
  const distance = Number(raw.distance);
  // Generous sanity caps to block obviously-fake/malicious submissions without
  // punishing genuinely great runs. Not a full anti-cheat system.
  if (!Number.isFinite(score) || score < 0 || score > 2000000) return null;
  if (!Number.isFinite(bags) || bags < 0 || bags > 100000) return null;
  if (!Number.isFinite(distance) || distance < 0 || distance > 1000000) return null;
  return {
    name,
    score: Math.floor(score),
    bags: Math.floor(bags),
    distance: Math.floor(distance),
    date: new Date().toISOString().slice(0, 10),
  };
}

export default async function handler(req, res) {
  if (!redis) {
    res.status(503).json({ error: 'Leaderboard storage is not connected yet. See README.md.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const list = (await redis.get(KEY)) || [];
      res.status(200).json({ entries: list.slice(0, MAX_RETURNED) });
      return;
    }

    if (req.method === 'POST') {
      const entry = sanitizeEntry(req.body);
      if (!entry) { res.status(400).json({ error: 'Invalid entry.' }); return; }

      const list = (await redis.get(KEY)) || [];
      list.push(entry);
      list.sort((a, b) => b.score - a.score);
      const trimmed = list.slice(0, MAX_STORED);
      await redis.set(KEY, trimmed);
      res.status(200).json({ entries: trimmed.slice(0, MAX_RETURNED) });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: 'Leaderboard request failed.' });
  }
}
