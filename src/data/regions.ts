import type { Region } from "../types/mood";

export const regions: Region[] = [
  { id: "nara", name: "奈良" },
  { id: "osaka", name: "大阪" },
  { id: "kyoto", name: "京都" },
  { id: "tokyo", name: "東京" },
  { id: "kanagawa", name: "神奈川" },
  { id: "fukuoka", name: "福岡" },
  { id: "hokkaido", name: "北海道" },
];

export const regionById = Object.fromEntries(
  regions.map((region) => [region.id, region]),
) as Record<Region["id"], Region>;
