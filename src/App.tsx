import { useEffect, useMemo, useRef, useState } from "react";
import { moods, moodById } from "./data/moods";
import { regions, regionById } from "./data/regions";
import { getClientId } from "./lib/clientId";
import {
  buildMoodRanking,
  buildRegionRanking,
  filterRecentPosts,
  getTopMoodByRegion,
} from "./lib/moodStats";
import { createMoodPostRepository } from "./lib/postRepository";
import type { MoodId, MoodPost, RegionId } from "./types/mood";

const repository = createMoodPostRepository();
const PUBLIC_APP_URL = "https://mood-pulse-five.vercel.app/";

function App() {
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>("nara");
  const [selectedMoodId, setSelectedMoodId] = useState<MoodId>("sleepy");
  const [posts, setPosts] = useState<MoodPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const clientIdRef = useRef<string>("");

  useEffect(() => {
    clientIdRef.current = getClientId();

    repository
      .listRecentPosts()
      .then((recentPosts) => setPosts(filterRecentPosts(recentPosts)))
      .catch(() => {
        setStatusMessage("読み込みに失敗しました。少し時間をおいてもう一度お試しください。");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const selectedRegion = regionById[selectedRegionId];
  const selectedMood = moodById[selectedMoodId];

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

  const topRegionRank = regionRanking[0];
  const topNationalRank = nationalRanking[0];
  const shareText = makeShareText(selectedRegion.name, topRegionRank?.mood);

  async function handleSubmit() {
    setIsSaving(true);
    setStatusMessage("");
    setCopyStatus("");

    try {
      const savedPost = await repository.createPost({
        mood: selectedMoodId,
        region: selectedRegion,
        clientId: clientIdRef.current,
      });

      setPosts((currentPosts) => filterRecentPosts([savedPost, ...currentPosts]));
      setStatusMessage(`${selectedRegion.name}の空気に参加しました。`);
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
    <main className="appShell">
      <div className="ambientLayer" aria-hidden="true">
        <span className="ambientWave ambientWaveOne" />
        <span className="ambientWave ambientWaveTwo" />
        <span className="ambientGrid" />
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
          <span className="modeBadge">
            {repository.mode === "firestore" ? "Firestore" : "Local demo"}
          </span>
        </div>
        <div className="chipGrid" role="list" aria-label="地域一覧">
          {regions.map((region) => (
            <button
              className={`chip ${region.id === selectedRegionId ? "selected" : ""}`}
              key={region.id}
              onClick={() => setSelectedRegionId(region.id)}
              type="button"
            >
              {region.name}
            </button>
          ))}
        </div>
      </section>

      <section className="panel moodPanel" aria-labelledby="mood-title">
        <div className="sectionHeader">
          <div>
            <p className="sectionKicker">Mood</p>
            <h2 id="mood-title">今の気分を送る</h2>
          </div>
        </div>
        <div className="moodGrid" role="list" aria-label="ムード一覧">
          {moods.map((mood) => (
            <button
              className={`moodButton ${mood.id === selectedMoodId ? "selected" : ""}`}
              key={mood.id}
              onClick={() => setSelectedMoodId(mood.id)}
              type="button"
            >
              <span className="moodEmoji">{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
        <button
          className={`submitButton ${statusMessage.includes("参加しました") ? "success" : ""}`}
          disabled={isSaving}
          onClick={handleSubmit}
          type="button"
        >
          {isSaving ? "送信中..." : `${selectedMood.emoji} ${selectedMood.label}で参加する`}
        </button>
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
                <div className="rankingRow" key={rank.mood.id}>
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
              <li key={rank.mood.id}>
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
        <div className="regionMoodList">
          {regionComparison.map((item) => (
            <div className="regionMoodRow" key={item.region.id}>
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
    </main>
  );
}

function makeShareText(regionName: string, topMood?: (typeof moods)[number]): string {
  if (!topMood) {
    return `今日の${regionName}は、まだ観測待ち。\n${regionName}、最初の空気を送ってみよう。\n#MoodPulse\n${PUBLIC_APP_URL}`;
  }

  return `今日の${regionName}は「${topMood.emoji} ${topMood.label}」が1位。\n${regionName}、今日は${topMood.airLabel}。\n#MoodPulse\n${PUBLIC_APP_URL}`;
}

export default App;
