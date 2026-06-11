import type { Mood, MoodId, MoodPost, MoodRank, Region, RegionMood } from "../types/mood";

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function filterRecentPosts(posts: MoodPost[], now = Date.now()): MoodPost[] {
  const cutoff = now - ONE_DAY_MS;

  return posts.filter((post) => post.createdAt >= cutoff);
}

export function buildMoodRanking(posts: MoodPost[], moods: Mood[]): MoodRank[] {
  const total = posts.length;
  const counts = posts.reduce(
    (accumulator, post) => {
      accumulator[post.mood] = (accumulator[post.mood] ?? 0) + 1;
      return accumulator;
    },
    {} as Partial<Record<MoodId, number>>,
  );

  return moods
    .map((mood) => {
      const count = counts[mood.id] ?? 0;

      return {
        mood,
        count,
        percent: total === 0 ? 0 : Math.round((count / total) * 100),
      };
    })
    .filter((rank) => rank.count > 0)
    .sort((a, b) => b.count - a.count || moods.indexOf(a.mood) - moods.indexOf(b.mood));
}

export function buildRegionRanking(
  posts: MoodPost[],
  regionId: Region["id"],
  moods: Mood[],
): MoodRank[] {
  return buildMoodRanking(
    posts.filter((post) => post.regionId === regionId),
    moods,
  );
}

export function getTopMoodByRegion(
  posts: MoodPost[],
  regions: Region[],
  moods: Mood[],
): RegionMood[] {
  return regions.map((region) => {
    const ranking = buildRegionRanking(posts, region.id, moods);
    const topRank = ranking[0];

    return {
      region,
      topMood: topRank?.mood ?? null,
      count: topRank?.count ?? 0,
    };
  });
}
