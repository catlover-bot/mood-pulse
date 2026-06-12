import type { Region, RegionId } from "../data/regions";

export type { Region, RegionId } from "../data/regions";

export type MoodId =
  | "sleepy"
  | "working"
  | "studying"
  | "limit"
  | "hungry"
  | "motivated"
  | "moving"
  | "break";

export type MoodPost = {
  id: string;
  mood: MoodId;
  regionId: RegionId;
  regionName: string;
  createdAt: number;
  clientId: string;
};

export type Mood = {
  id: MoodId;
  emoji: string;
  label: string;
  shortLabel: string;
  airLabel: string;
};

export type MoodRank = {
  mood: Mood;
  count: number;
  percent: number;
};

export type RegionMood = {
  region: Region;
  topMood: Mood | null;
  count: number;
};
