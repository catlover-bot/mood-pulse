import type { Mood } from "../types/mood";

export const moods: Mood[] = [
  {
    id: "sleepy",
    emoji: "😴",
    label: "眠い",
    shortLabel: "眠い",
    airLabel: "今日はずっと眠い",
  },
  {
    id: "working",
    emoji: "💻",
    label: "作業中",
    shortLabel: "作業",
    airLabel: "みんな作業中",
  },
  {
    id: "studying",
    emoji: "📚",
    label: "勉強中",
    shortLabel: "勉強",
    airLabel: "勉強モード",
  },
  {
    id: "limit",
    emoji: "🫠",
    label: "限界",
    shortLabel: "限界",
    airLabel: "静かに限界",
  },
  {
    id: "hungry",
    emoji: "🍜",
    label: "腹減った",
    shortLabel: "空腹",
    airLabel: "腹減り気分",
  },
  {
    id: "motivated",
    emoji: "🔥",
    label: "やる気ある",
    shortLabel: "やる気",
    airLabel: "やる気ある",
  },
  {
    id: "moving",
    emoji: "🚃",
    label: "移動中",
    shortLabel: "移動",
    airLabel: "移動中多め",
  },
  {
    id: "break",
    emoji: "☕",
    label: "休憩中",
    shortLabel: "休憩",
    airLabel: "休憩中",
  },
];

export const moodById = Object.fromEntries(
  moods.map((mood) => [mood.id, mood]),
) as Record<Mood["id"], Mood>;
