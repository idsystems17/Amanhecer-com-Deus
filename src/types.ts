/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Devotional {
  /** Day of the year (1 to 365) */
  day: number;
  title: string;
  verseText: string;
  verseReference: string;
  reflection: string;
  action: string;
  prayer: string;
  category: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export type FontSizeOption = 'normal' | 'large' | 'extra-large';
export type ContrastOption = 'standard' | 'high-contrast-light' | 'high-contrast-dark';
export type FontFamilyOption = 'sans' | 'serif';

export interface AccessibilitySettings {
  fontSize: FontSizeOption;
  contrast: ContrastOption;
  fontFamily: FontFamilyOption;
  audioSpeed: number;
}

export interface UserSettings {
  notificationTime: string;
  notificationsEnabled: boolean;
  readDays: number[]; // List of day numbers (1..365) marked as read
  starredDays: number[]; // Starred day numbers
}
