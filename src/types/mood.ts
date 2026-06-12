import type { Region, RegionId } from "../data/regions";

export type { Mood, MoodCategory, MoodId } from "../data/moods";
export type { Region, RegionId } from "../data/regions";

import type { Mood, MoodId } from "../data/moods";

export type MoodPost = {
  id: string;
  mood: MoodId;
  regionId: RegionId;
  regionName: string;
  createdAt: number;
  clientId: string;
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
