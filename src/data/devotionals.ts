/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Devotional } from '../types';

export function getDevotionalForDay(day: number): Devotional {
  return {
    day: Math.max(1, Math.min(365, day)),
    title: '',
    verseText: '',
    verseReference: '',
    reflection: '',
    action: '',
    prayer: '',
    category: '',
    isEmpty: true,
  };
}

export function getDayOfYear(date: Date = new Date()): number {
  const utc1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  const utc2 = Date.UTC(date.getFullYear(), 0, 1, 12, 0, 0);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.round((utc1 - utc2) / oneDay) + 1;
}
