import { useState, useEffect } from 'react';

const KEYS = {
  lastOpen: 'domex_last_open',
  streak: 'domex_streak',
  scores: 'domex_daily_scores',
};

export interface DailyScore {
  fecha: string;
  score: number;
  tareasCompletadas: number;
  totalTareas: number;
  noticiasLeidas: number;
}

function calcStreak(): number {
  const today = new Date().toDateString();
  const lastOpen = localStorage.getItem(KEYS.lastOpen);
  const current = parseInt(localStorage.getItem(KEYS.streak) || '0');

  if (lastOpen === today) return current;

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const next = lastOpen === yesterday ? current + 1 : 1;
  localStorage.setItem(KEYS.streak, String(next));
  localStorage.setItem(KEYS.lastOpen, today);
  return next;
}

export function useStreaks() {
  const [streak] = useState(() => calcStreak());

  return streak;
}

export function calcScore(tareasCompletadas: number, totalTareas: number, noticiasLeidas: number): number {
  const tareasScore = totalTareas > 0 ? (tareasCompletadas / totalTareas) * 50 : 0;
  const noticiasScore = Math.min(noticiasLeidas / 3, 1) * 50;
  return Math.round(tareasScore + noticiasScore);
}

export function getDailyScores(): DailyScore[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.scores) || '[]');
  } catch {
    return [];
  }
}

export function saveDailyScore(score: DailyScore): void {
  const scores = getDailyScores();
  const today = new Date().toISOString().split('T')[0];
  const idx = scores.findIndex(s => s.fecha === today);
  if (idx >= 0) {
    scores[idx] = score;
  } else {
    scores.push(score);
  }
  localStorage.setItem(KEYS.scores, JSON.stringify(scores.slice(-30)));
}
