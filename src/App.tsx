import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { moodCategories, moods, moodById, type MoodCategory } from "./data/moods";
import { regionAreas, regions, regionById, type RegionArea } from "./data/regions";
import { getClientId } from "./lib/clientId";
import {
  buildMoodRanking,
  buildRegionRanking,
  filterRecentPosts,
  getTopMoodByRegion,
} from "./lib/moodStats";
import { createMoodPostRepository } from "./lib/postRepository";
import { getCooldownStatus, recordSubmission } from "./lib/submissionCooldown";
import type { MoodId, MoodPost, MoodRank, RegionId, RegionMood } from "./types/mood";

const repository = createMoodPostRepository();
const PUBLIC_APP_URL = "https://mood-pulse-five.vercel.app/";
const SUCCESS_MESSAGE_MS = 4000;
const CONSTELLATION_NODE_LIMIT = 12;
const FEATURED_REGION_IDS = [
  "tokyo",
  "osaka",
  "kyoto",
  "nara",
  "fukuoka",
  "hokkaido",
] as const satisfies readonly RegionId[];
const PARTICLE_SEEDS = [
  { x: "8%", y: "13%", size: "7px", delay: "-0.2s", duration: "12s" },
  { x: "18%", y: "32%", size: "13px", delay: "-2.6s", duration: "16s" },
  { x: "33%", y: "17%", size: "9px", delay: "-6.1s", duration: "14s" },
  { x: "47%", y: "43%", size: "6px", delay: "-1.8s", duration: "18s" },
  { x: "64%", y: "12%", size: "11px", delay: "-4.7s", duration: "15s" },
  { x: "82%", y: "26%", size: "8px", delay: "-7.4s", duration: "17s" },
  { x: "91%", y: "54%", size: "14px", delay: "-3.2s", duration: "20s" },
  { x: "13%", y: "68%", size: "10px", delay: "-8.3s", duration: "19s" },
  { x: "28%", y: "83%", size: "6px", delay: "-5.5s", duration: "13s" },
  { x: "43%", y: "72%", size: "12px", delay: "-9.1s", duration: "21s" },
  { x: "57%", y: "88%", size: "8px", delay: "-1.2s", duration: "16s" },
  { x: "76%", y: "75%", size: "10px", delay: "-6.8s", duration: "18s" },
  { x: "88%", y: "91%", size: "7px", delay: "-10.4s", duration: "22s" },
  { x: "5%", y: "49%", size: "12px", delay: "-4s", duration: "15s" },
  { x: "69%", y: "51%", size: "6px", delay: "-11.1s", duration: "17s" },
  { x: "52%", y: "26%", size: "9px", delay: "-7.9s", duration: "14s" },
];

type MoodParticle = {
  id: string;
  moodId: MoodId;
  x: string;
  y: string;
  size: string;
  delay: string;
  duration: string;
  intensity: string;
};

type SubmitRipple = {
  id: number;
  moodId: MoodId;
};

type AreaFilter = "all" | RegionArea;
type MoodCategoryFilter = "all" | MoodCategory;

const MOOD_CATEGORY_LABELS: Record<MoodCategoryFilter, string> = {
  all: "すべて",
  energy: "気力",
  activity: "行動",
  mood: "気分",
  body: "からだ",
};

function App() {
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>("nara");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [regionSearch, setRegionSearch] = useState("");
  const [selectedMoodId, setSelectedMoodId] = useState<MoodId>("sleepy");
  const [moodCategoryFilter, setMoodCategoryFilter] = useState<MoodCategoryFilter>("all");
  const [moodSearch, setMoodSearch] = useState("");
  const [posts, setPosts] = useState<MoodPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [submitRipple, setSubmitRipple] = useState<SubmitRipple | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [cooldownNow, setCooldownNow] = useState(Date.now());
  const [clientId] = useState(() => getClientId());

  useEffect(() => {
    repository
      .listRecentPosts()
      .then((recentPosts) => setPosts(filterRecentPosts(recentPosts)))
      .catch(() => {
        setStatusMessage("読み込みに失敗しました。少し時間をおいてもう一度お試しください。");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => setCooldownNow(Date.now()), 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!submitRipple) {
      return;
    }

    const timeoutId = window.setTimeout(() => setSubmitRipple(null), 1500);

    return () => window.clearTimeout(timeoutId);
  }, [submitRipple]);

  useEffect(() => {
    if (!statusMessage.includes("参加しました")) {
      return;
    }

    const timeoutId = window.setTimeout(() => setStatusMessage(""), SUCCESS_MESSAGE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  useEffect(() => {
    if (!isAboutOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAboutOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAboutOpen]);

  const selectedRegion = regionById[selectedRegionId];
  const selectedMood = moodById[selectedMoodId];
  const areaFilters = useMemo(() => ["all", ...regionAreas] as const, []);
  const moodCategoryFilters = useMemo(() => ["all", ...moodCategories] as const, []);

  const recentPosts = useMemo(() => filterRecentPosts(posts), [posts]);
  const regionRanking = useMemo(
    () => buildRegionRanking(recentPosts, selectedRegionId, moods),
    [recentPosts, selectedRegionId],
  );
  const nationalRanking = useMemo(
    () => buildMoodRanking(recentPosts, moods),
    [recentPosts],
  );
  const regionComparison = useMemo(
    () => getTopMoodByRegion(recentPosts, regions, moods),
    [recentPosts],
  );
  const constellationRegions = useMemo(
    () => selectConstellationRegions(regionComparison, selectedRegionId),
    [regionComparison, selectedRegionId],
  );
  const moodParticles = useMemo(
    () => buildMoodParticles(nationalRanking, selectedMoodId),
    [nationalRanking, selectedMoodId],
  );
  const filteredRegions = useMemo(
    () => filterRegions(areaFilter, regionSearch),
    [areaFilter, regionSearch],
  );
  const filteredMoods = useMemo(
    () => filterMoods(moodCategoryFilter, moodSearch),
    [moodCategoryFilter, moodSearch],
  );
  const cooldownStatus = useMemo(
    () => getCooldownStatus(clientId, selectedRegionId, cooldownNow),
    [clientId, cooldownNow, selectedMoodId, selectedRegionId],
  );

  const topRegionRank = regionRanking[0];
  const topNationalRank = nationalRanking[0];
  const shareText = makeShareText(selectedRegion.name, topRegionRank?.mood);
  const isCoolingDown = cooldownStatus.isCoolingDown;
  const isSuccessMessage = statusMessage.includes("参加しました");
  const showCooldownNotice = isCoolingDown && !isSuccessMessage;
  const cooldownMessage = isCoolingDown
    ? `この地域には少し前に参加しました。あと ${cooldownStatus.remainingMinutes} 分でまた参加できます。`
    : "";

  async function handleSubmit() {
    const latestCooldownStatus = getCooldownStatus(clientId, selectedRegionId);

    if (latestCooldownStatus.isCoolingDown) {
      setCooldownNow(Date.now());
      return;
    }

    setIsSaving(true);
    setStatusMessage("");
    setCopyStatus("");

    try {
      const savedPost = await repository.createPost({
        mood: selectedMoodId,
        region: selectedRegion,
        clientId,
      });

      setPosts((currentPosts) => filterRecentPosts([savedPost, ...currentPosts]));
      recordSubmission(clientId, selectedRegionId, selectedMoodId, savedPost.createdAt);
      setCooldownNow(Date.now());
      setStatusMessage(`${selectedRegion.name}の空気に参加しました。`);
      setSubmitRipple({ id: savedPost.createdAt, moodId: savedPost.mood });
    } catch {
      setStatusMessage("保存に失敗しました。通信環境を確認してもう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCopyShareText() {
    setCopyStatus("");

    try {
      await navigator.clipboard.writeText(shareText);
      setCopyStatus("共有文をコピーしました。");
    } catch {
      setCopyStatus("コピーできませんでした。テキストを長押しでコピーしてください。");
    }
  }

  return (
    <main className={`appShell mood-${selectedMoodId}`}>
      <div className="ambientLayer" aria-hidden="true">
        <span className="ambientWave ambientWaveOne" />
        <span className="ambientWave ambientWaveTwo" />
        <span className="ambientGrid" />
        <div className="particleField">
          {moodParticles.map((particle) => (
            <span
              className={`moodParticle moodTone-${particle.moodId}`}
              key={particle.id}
              style={
                {
                  "--particle-x": particle.x,
                  "--particle-y": particle.y,
                  "--particle-size": particle.size,
                  "--particle-delay": particle.delay,
                  "--particle-duration": particle.duration,
                  "--particle-intensity": particle.intensity,
                } as CSSProperties
              }
            />
          ))}
        </div>
        {submitRipple ? (
          <span
            className={`submitRipple moodTone-${submitRipple.moodId}`}
            key={submitRipple.id}
          />
        ) : null}
      </div>

      <section className="hero" aria-labelledby="page-title">
        <div className="heroContent">
          <p className="eyebrow">地域のムード天気図</p>
          <h1 id="page-title">Mood Pulse</h1>
          <p className="heroCopy">街の気分が、見える。</p>
          <p className="heroSupport">
            奈良、東京、大阪、京都。小さな気分が、今の街の空気になる。
          </p>
        </div>
        <div className="heroArt" aria-hidden="true">
          <div className="pulseBadge">
            <span>{topNationalRank?.mood.emoji ?? "💭"}</span>
            <strong>{topNationalRank?.mood.shortLabel ?? "観測待ち"}</strong>
          </div>
          <div className="pulseLine">
            <span />
          </div>
          <div className="moodTrace">
            <span>😴 奈良</span>
            <span>💻 東京</span>
            <span>🍜 大阪</span>
          </div>
        </div>
      </section>

      <section className="panel regionPanel" aria-labelledby="region-title">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Region</p>
            <h2 id="region-title">地域を選ぶ</h2>
          </div>
          <span className="modeBadge" aria-label="集計状態">
            {repository.mode === "firestore" ? "ライブ集計中" : "この端末のみ"}
          </span>
        </div>
        <div className="selectedRegionDisplay" aria-live="polite">
          <span>現在の地域</span>
          <strong>{selectedRegion.name}</strong>
          <small>{selectedRegion.area}</small>
        </div>
        <div className="areaTabs" role="tablist" aria-label="地方フィルター">
          {areaFilters.map((area) => (
            <button
              aria-selected={areaFilter === area}
              className={`areaTab ${areaFilter === area ? "selected" : ""}`}
              key={area}
              onClick={() => setAreaFilter(area)}
              role="tab"
              type="button"
            >
              {area === "all" ? "すべて" : area}
            </button>
          ))}
        </div>
        <label className="regionSearch">
          <span>地域検索</span>
          <input
            className="regionSearchInput"
            onChange={(event) => setRegionSearch(event.target.value)}
            placeholder="地域を検索"
            type="search"
            value={regionSearch}
          />
        </label>
        <div className="chipGrid" role="list" aria-label="地域一覧">
          {filteredRegions.length ? (
            <div className="regionChipGrid">
              {filteredRegions.map((region) => (
                <button
                  aria-pressed={region.id === selectedRegionId}
                  className={`chip ${region.id === selectedRegionId ? "selected" : ""}`}
                  key={region.id}
                  onClick={() => {
                    setSelectedRegionId(region.id);
                    setCooldownNow(Date.now());
                    setStatusMessage("");
                    setCopyStatus("");
                  }}
                  type="button"
                >
                  {region.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="regionEmpty">一致する地域がありません。</p>
          )}
        </div>
      </section>

      <section className="panel moodPanel" aria-labelledby="mood-title">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Mood</p>
            <h2 id="mood-title">今の空気を選ぶ</h2>
          </div>
        </div>
        <div className={`selectedMoodPreview moodTone-${selectedMood.id}`} aria-live="polite">
          <span>選択中</span>
          <strong>
            {selectedMood.emoji} {selectedMood.label}
          </strong>
          <small>{MOOD_CATEGORY_LABELS[selectedMood.category]}</small>
        </div>
        <div className="moodCategoryTabs" role="tablist" aria-label="状態カテゴリ">
          {moodCategoryFilters.map((category) => (
            <button
              aria-selected={moodCategoryFilter === category}
              className={`moodCategoryTab ${moodCategoryFilter === category ? "selected" : ""}`}
              key={category}
              onClick={() => setMoodCategoryFilter(category)}
              role="tab"
              type="button"
            >
              {MOOD_CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
        <label className="moodSearch">
          <span>状態検索</span>
          <input
            className="moodSearchInput"
            onChange={(event) => setMoodSearch(event.target.value)}
            placeholder="状態を検索"
            type="search"
            value={moodSearch}
          />
        </label>
        <div className="moodGrid" role="list" aria-label="ムード一覧">
          {filteredMoods.length ? (
            filteredMoods.map((mood) => (
              <button
                aria-pressed={mood.id === selectedMoodId}
                className={`moodButton moodTone-${mood.id} ${
                  mood.id === selectedMoodId ? "selected" : ""
                }`}
                key={mood.id}
                onClick={() => {
                  setSelectedMoodId(mood.id);
                  setCooldownNow(Date.now());
                  setStatusMessage("");
                  setCopyStatus("");
                }}
                type="button"
              >
                <span className="moodEmoji">{mood.emoji}</span>
                <span>{mood.label}</span>
              </button>
            ))
          ) : (
            <p className="moodEmpty">一致する状態がありません。</p>
          )}
        </div>
        <button
          className={`submitButton ${statusMessage.includes("参加しました") ? "success" : ""}`}
          disabled={isSaving || isCoolingDown}
          onClick={handleSubmit}
          type="button"
        >
          {isSaving ? "送信中..." : "今の空気に参加する"}
        </button>
        {showCooldownNotice ? <p className="cooldownMessage">{cooldownMessage}</p> : null}
        {statusMessage ? (
          <p className="statusMessage" role="status">
            {statusMessage}
          </p>
        ) : null}
      </section>

      <section className="panel highlightPanel" aria-labelledby="selected-region-title">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Selected</p>
            <h2 id="selected-region-title">{selectedRegion.name}の今</h2>
          </div>
          <span className="countBadge">{regionRanking.reduce((sum, rank) => sum + rank.count, 0)}件</span>
        </div>
        {isLoading ? (
          <p className="emptyText">読み込み中...</p>
        ) : regionRanking.length ? (
          <>
            <div className="rankingList">
              {regionRanking.slice(0, 3).map((rank, index) => (
                <div className={`rankingRow moodTone-${rank.mood.id}`} key={rank.mood.id}>
                  <span className="rankNumber">{index + 1}</span>
                  <div className="rankingMood">
                    <span>{rank.mood.emoji}</span>
                    <strong>{rank.mood.label}</strong>
                  </div>
                  <div className="barTrack" aria-hidden="true">
                    <span style={{ width: `${rank.percent}%` }} />
                  </div>
                  <b>{rank.percent}%</b>
                </div>
              ))}
            </div>
            <div className="airCard">
              <p>{selectedRegion.name}の空気</p>
              <strong>{topRegionRank.mood.airLabel}</strong>
            </div>
          </>
        ) : (
          <p className="emptyText">
            まだ24時間以内の投稿がありません。最初のムードを送って、この地域の空気を作りましょう。
          </p>
        )}
      </section>

      <section className="panel" aria-labelledby="national-title">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Japan</p>
            <h2 id="national-title">全国の今</h2>
          </div>
          <span className="countBadge">{recentPosts.length}件</span>
        </div>
        {nationalRanking.length ? (
          <ol className="nationalList">
            {nationalRanking.slice(0, 5).map((rank) => (
              <li className={`moodTone-${rank.mood.id}`} key={rank.mood.id}>
                <span className="nationalEmoji">{rank.mood.emoji}</span>
                <div className="nationalMood">
                  <strong>{rank.mood.label}</strong>
                  <span className="miniBar" aria-hidden="true">
                    <i style={{ width: `${rank.percent}%` }} />
                  </span>
                </div>
                <small>{rank.count}件</small>
              </li>
            ))}
          </ol>
        ) : (
          <p className="emptyText">全国ランキングはまだ観測待ちです。</p>
        )}
      </section>

      <section className="panel" aria-labelledby="comparison-title">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Areas</p>
            <h2 id="comparison-title">地域別トップムード</h2>
          </div>
        </div>
        <div className="regionMoodList constellationGrid">
          {constellationRegions.map((item, index) => (
            <div
              className={`regionMoodRow constellationNode ${
                item.region.id === selectedRegionId ? "selected" : ""
              } ${item.topMood ? `moodTone-${item.topMood.id}` : ""}`}
              key={item.region.id}
              style={{ "--node-delay": `${index * 0.08}s` } as CSSProperties}
            >
              <span className="constellationDot" aria-hidden="true" />
              <strong>{item.region.name}</strong>
              {item.topMood ? (
                <span className="regionTopMood">
                  {item.topMood.emoji} {item.topMood.label}
                </span>
              ) : (
                <span className="muted">まだなし</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="panel sharePanel" aria-labelledby="share-title">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Share</p>
            <h2 id="share-title">Xで共有</h2>
          </div>
        </div>
        <pre className="shareText">{shareText}</pre>
        <button className="copyButton" onClick={handleCopyShareText} type="button">
          共有文をコピー
        </button>
        {copyStatus ? (
          <p className="statusMessage" role="status">
            {copyStatus}
          </p>
        ) : null}
      </section>

      <footer className="appFooter">
        <button className="aboutLink" onClick={() => setIsAboutOpen(true)} type="button">
          このアプリについて
        </button>
      </footer>

      {isAboutOpen ? (
        <div
          aria-labelledby="about-title"
          aria-modal="true"
          className="modalBackdrop"
          onClick={() => setIsAboutOpen(false)}
          role="dialog"
        >
          <div className="aboutModal" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <p className="sectionKicker">About / Privacy</p>
                <h2 id="about-title">Mood Pulseについて</h2>
              </div>
              <button
                aria-label="閉じる"
                className="modalClose"
                onClick={() => setIsAboutOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="aboutBody">
              <p>Mood Pulseは、地域ごとの「今の空気」を集計して見るWebアプリです。</p>
              <ul>
                <li>個人の現在地は取得しません。</li>
                <li>ログインは不要です。</li>
                <li>自由コメントは扱いません。</li>
                <li>個人の投稿一覧や位置は表示しません。</li>
                <li>投稿されるのは、選択した地域、選択した状態、投稿時刻、匿名の端末IDのみです。</li>
                <li>同じ地域への連続投稿を防ぐため、同じ端末では30分に1回まで参加できます。</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function makeShareText(regionName: string, topMood?: (typeof moods)[number]): string {
  if (!topMood) {
    return `今日の${regionName}は、まだ観測待ち。\n${regionName}、最初の空気を送ってみよう。\n#MoodPulse\n${PUBLIC_APP_URL}`;
  }

  return `今日の${regionName}は「${topMood.emoji} ${topMood.label}」が1位。\n${regionName}、今日は${topMood.airLabel}。\n#MoodPulse\n${PUBLIC_APP_URL}`;
}

function filterRegions(areaFilter: AreaFilter, searchValue: string) {
  const normalizedSearch = searchValue.trim().toLowerCase();

  return regions.filter((region) => {
    const matchesArea = areaFilter === "all" || region.area === areaFilter;

    if (!matchesArea) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      region.name.includes(searchValue.trim()) ||
      region.id.toLowerCase().includes(normalizedSearch) ||
      region.area.includes(searchValue.trim())
    );
  });
}

function filterMoods(categoryFilter: MoodCategoryFilter, searchValue: string) {
  const trimmedSearch = searchValue.trim();
  const normalizedSearch = trimmedSearch.toLowerCase();

  return moods.filter((mood) => {
    const matchesCategory = categoryFilter === "all" || mood.category === categoryFilter;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      mood.label.includes(trimmedSearch) ||
      mood.shortLabel.includes(trimmedSearch) ||
      mood.id.toLowerCase().includes(normalizedSearch)
    );
  });
}

function selectConstellationRegions(
  regionComparison: RegionMood[],
  selectedRegionId: RegionId,
): RegionMood[] {
  const byRegionId = new Map(regionComparison.map((item) => [item.region.id, item]));
  const selectedRegion = byRegionId.get(selectedRegionId);
  const regionsWithPosts = regionComparison
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const featuredRegions = FEATURED_REGION_IDS.map((regionId) => byRegionId.get(regionId)).filter(
    (item): item is RegionMood => Boolean(item),
  );
  const orderedCandidates = [
    selectedRegion,
    ...regionsWithPosts,
    ...featuredRegions,
    ...regionComparison,
  ].filter((item): item is RegionMood => Boolean(item));
  const selectedIds = new Set<RegionId>();
  const constellationRegions: RegionMood[] = [];

  orderedCandidates.forEach((item) => {
    if (selectedIds.has(item.region.id) || constellationRegions.length >= CONSTELLATION_NODE_LIMIT) {
      return;
    }

    selectedIds.add(item.region.id);
    constellationRegions.push(item);
  });

  return constellationRegions;
}

function buildMoodParticles(
  ranking: MoodRank[],
  selectedMoodId: MoodId,
): MoodParticle[] {
  const fallbackRanking: MoodRank[] = [
    {
      mood: moodById[selectedMoodId],
      count: 0,
      percent: 100,
    },
  ];
  const sourceRanking = ranking.length ? ranking : fallbackRanking;

  return PARTICLE_SEEDS.map((seed, index) => {
    const distributionPoint = ((index + 0.5) / PARTICLE_SEEDS.length) * 100;
    const rank = pickRankForPoint(sourceRanking, distributionPoint) ?? sourceRanking[0];
    const intensity = Math.max(0.32, Math.min(0.95, rank.percent / 100 + 0.18));

    return {
      id: `${rank.mood.id}-${index}`,
      moodId: rank.mood.id,
      x: seed.x,
      y: seed.y,
      size: seed.size,
      delay: seed.delay,
      duration: seed.duration,
      intensity: intensity.toFixed(2),
    };
  });
}

function pickRankForPoint(ranking: MoodRank[], point: number): MoodRank | undefined {
  let accumulatedPercent = 0;

  return ranking.find((rank) => {
    accumulatedPercent += rank.percent;
    return point <= accumulatedPercent;
  });
}

export default App;
