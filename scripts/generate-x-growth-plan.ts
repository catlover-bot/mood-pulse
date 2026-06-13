import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PUBLIC_URL = "https://mood-pulse-five.vercel.app/";
const OUTPUT_ROOT = path.join(process.cwd(), "outputs", "x-growth");
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

const productContext = {
  name: "Mood Pulse",
  url: PUBLIC_URL,
  concept: "Japan regional mood/state atmosphere visualization web app",
  features: [
    "47 Japanese prefectures",
    "24 predefined mood/state options",
    "Mood Observatory",
    "region share cards",
    "PWA support",
    "no login",
    "no geolocation",
    "no comments",
    "aggregated regional mood data only",
  ],
};

const searchQueries = [
  "個人開発 Webアプリ",
  "個人開発 PWA",
  "Firebase 個人開発",
  "Vercel React 個人開発",
  "TypeScript Webアプリ",
  "地域アプリ 個人開発",
  "可視化 Webアプリ",
  "体験型UI Web",
  "学生開発 Webアプリ",
  "ハッカソン PWA",
  "奈良 アプリ 開発",
  "関西 個人開発",
  "大阪 Webアプリ",
  "京都 Webアプリ",
  "気分 可視化",
  "今日の状態 アプリ",
  "mood app Japan",
  "React Firebase app",
  "Vercel PWA",
  "interactive UI web app",
];

const accountTopics = [
  "個人開発者",
  "React / TypeScript を触っている開発者",
  "Firebase / Vercel 利用者",
  "PWA や小さなWebアプリを作っている人",
  "UI/UX / インタラクションデザインに関心がある人",
  "地域アプリやローカルコミュニティに関心がある人",
  "学生開発・ハッカソン参加者",
  "奈良・関西・大阪・京都の開発/デザイン界隈",
  "データ可視化や感情/状態の記録に関心がある人",
];

const deterministicDrafts = [
  `奈良、東京、大阪、京都。\n街ごとの「今の空気」をゆるく見られるWebアプリを作っています。\nMood Pulse: ${PUBLIC_URL}\n\n#MoodPulse #個人開発`,
  `今日はどの街が眠い？どの街が作業中？\nMood Pulseは、地域ごとの気分や状態を集計して眺める小さなWebアプリです。\n${PUBLIC_URL}\n\n#MoodPulse #Webアプリ`,
  `ログインなし、現在地取得なし、コメントなし。\nただ「今の状態」を選んで、街の空気として眺めるアプリです。\n${PUBLIC_URL}\n\n#MoodPulse #PWA`,
  `地域ごとのムードを光っぽく可視化する「空気の観測室」を入れました。\n反応が集まると、街の空気がちょっとだけ見える感じになります。\n${PUBLIC_URL}\n\n#MoodPulse #体験型UI`,
  `Mood Pulseに地域シェアカードを追加しました。\n「奈良、今日はワクワクしてる」みたいに、街の空気をそのまま共有できます。\n${PUBLIC_URL}\n\n#MoodPulse #個人開発`,
  `Firebase / Vercel / React / TypeScriptで、地域の今の空気を見るPWAを作っています。\n技術デモではなく、ちょっと使いたくなる雰囲気を目指しています。\n${PUBLIC_URL}\n\n#MoodPulse`,
  `「天気」ではなく「気分」の地域マップっぽいものを作っています。\n地図も位置情報も使わず、47都道府県の集計だけで遊べる形です。\n${PUBLIC_URL}\n\n#MoodPulse #可視化`,
  `今日の街、どんな空気？\nMood Pulseで今の状態を1タップで送って、地域ごとのムードを見られます。\n${PUBLIC_URL}\n\n#MoodPulse`,
];

async function main() {
  const date = getJstDateString();
  const generatedWithOpenAi = Boolean(process.env.OPENAI_API_KEY);
  const openAiSections = generatedWithOpenAi ? await generateOpenAiSections(date) : null;
  const markdown = buildMarkdown({
    date,
    postDrafts: openAiSections?.postDrafts ?? deterministicDrafts,
    weeklyNotes: openAiSections?.weeklyNotes ?? createDeterministicWeeklyNotes(),
    generatedWithOpenAi: Boolean(openAiSections),
  });
  const outputPath = path.join(OUTPUT_ROOT, `${date}.md`);

  await mkdir(OUTPUT_ROOT, { recursive: true });
  await writeFile(outputPath, markdown, "utf8");

  console.log(`Generated X growth plan: ${outputPath}`);
  console.log(
    openAiSections
      ? `OpenAI polishing: enabled (${OPENAI_MODEL})`
      : "OpenAI polishing: skipped; used deterministic templates.",
  );
  console.log("No X actions were automated.");
}

function getJstDateString(date = new Date()): string {
  const jstTime = date.getTime() + 9 * 60 * 60 * 1000;
  return new Date(jstTime).toISOString().slice(0, 10);
}

function buildMarkdown({
  date,
  postDrafts,
  weeklyNotes,
  generatedWithOpenAi,
}: {
  date: string;
  postDrafts: string[];
  weeklyNotes: string[];
  generatedWithOpenAi: boolean;
}): string {
  return `# Mood Pulse X Growth Plan - ${date}

> This file is a manual planning aid. It does not like, follow, reply, DM, post, scrape, or automate X.
> Human review is required before every action.
> Generation mode: ${generatedWithOpenAi ? `OpenAI-assisted (${OPENAI_MODEL})` : "deterministic template"}.

## 1. 今日の投稿案

${postDrafts.slice(0, 10).map((draft, index) => `### Draft ${index + 1}\n\n${draft}`).join("\n\n")}

## 2. 探すべき投稿検索キーワード

${searchQueries.map((query) => `- ${query}`).join("\n")}

### Accounts / topics to look for

${accountTopics.map((topic) => `- ${topic}`).join("\n")}

## 3. いいね候補の判断基準

Do not like anything automatically. Use this only as a manual review checklist.

- Is the post relevant to Mood Pulse, individual development, regional apps, UI, PWA, React, Firebase, Vercel, or mood/visualization?
- Is it from a real, authentic-looking account?
- Would liking it feel natural and respectful?
- Is the post not sensitive, political, controversial, tragic, or crisis-related?
- Is it not asking for private information?
- Is it not spam, engagement bait, or a giveaway farm?
- Is it not a post where a like could look like opportunistic promotion?
- Would you still like it if Mood Pulse did not exist?

### いいね候補レビューリスト

| Candidate post URL | Why relevant? | Safe / natural? | Manual decision |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

## 4. フォロー候補の判断基準

Do not follow anything automatically. Use this only as a manual review checklist.

- Does the account post about individual development, apps, design, Firebase, React, TypeScript, Vercel, PWA, student projects, or hackathons?
- Does the account look authentic and active?
- Is the account relevant to Mood Pulse or adjacent communities?
- Would following this account be natural even without a growth goal?
- Is this a small number of thoughtful follows, not mass or bulk following?
- Does the account avoid spam, harassment, stolen content, or suspicious engagement tactics?
- Would future interaction with this account likely be useful, kind, or interesting?

### フォロー候補レビューリスト

| Candidate account URL | Why relevant? | Authentic? | Manual decision |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

## 5. 今日の手動アクション

- Xで検索クエリを3つだけ試す
- 気になる投稿を5件だけ確認する
- 自然だと思う投稿だけ手動でいいねする
- 関連性が高い人だけ手動でフォローする
- Mood Pulseの投稿を1つだけ出す
- 投稿後、無理に伸ばそうとせず反応を観察する
- 反応がよかった言葉を週次メモに残す

### Weekly marketing notes

${weeklyNotes.map((note) => `- ${note}`).join("\n")}

## 6. Safety checklist

- No automated likes
- No automated follows
- No automated unfollows
- No automated replies
- No automated mentions
- No DMs
- No Selenium / Playwright automation against X
- No scripted operation of the X website
- No mass actions
- No bulk engagement
- No duplicate spam
- No trend hijacking
- Human review required
- Keep all actions slow, relevant, and manual

## Product context

- Product: ${productContext.name}
- URL: ${productContext.url}
- Concept: ${productContext.concept}
${productContext.features.map((feature) => `- ${feature}`).join("\n")}
`;
}

function createDeterministicWeeklyNotes(): string[] {
  return [
    "Track which phrasing gets more natural replies: 「街の空気」 vs 「地域のムード」 vs 「気分の天気図」.",
    "Try one post focused on product feeling and one post focused on implementation learning.",
    "Avoid asking for generic RTs. Prefer concrete asks like 「奈良で試してみて」 or 「好きな都道府県を見てみて」.",
    "Collect questions people ask about privacy, location, and login; use them to improve README or About copy.",
    "If screenshots perform well, reuse the region share card format with different prefectures.",
  ];
}

async function generateOpenAiSections(
  date: string,
): Promise<{ postDrafts: string[]; weeklyNotes: string[] } | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          {
            role: "system",
            content:
              "You generate safe, human-reviewed marketing planning content. Never suggest automated social actions, spam, bulk engagement, DMs, automated replies, or trend hijacking.",
          },
          {
            role: "user",
            content: `Generate JSON for a manual X growth plan for Mood Pulse on ${date}.

Return only JSON with this shape:
{
  "postDrafts": string[],
  "weeklyNotes": string[]
}

Requirements:
- 5 to 10 Japanese X post drafts.
- Friendly, playful, product-facing.
- Include the URL ${PUBLIC_URL} in every draft.
- Mention Mood Pulse features naturally: 47 prefectures, 24 mood/state options, Mood Observatory, region share cards, PWA, no login, no geolocation, no comments, aggregated only.
- No automated likes/follows/replies/DMs.
- No spam or aggressive growth tactics.
- weeklyNotes should be 4 to 7 concise manual marketing observations or experiment ideas.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn(`OpenAI request failed with status ${response.status}; using deterministic templates.`);
      return null;
    }

    const payload = (await response.json()) as OpenAiResponsePayload;
    const text = extractOpenAiText(payload)?.trim();

    if (!text) {
      console.warn("OpenAI response did not include output_text; using deterministic templates.");
      return null;
    }

    const parsed = JSON.parse(text) as { postDrafts?: unknown; weeklyNotes?: unknown };
    const postDrafts = Array.isArray(parsed.postDrafts)
      ? parsed.postDrafts.filter((item): item is string => typeof item === "string")
      : [];
    const weeklyNotes = Array.isArray(parsed.weeklyNotes)
      ? parsed.weeklyNotes.filter((item): item is string => typeof item === "string")
      : [];

    if (!postDrafts.length || !weeklyNotes.length) {
      console.warn("OpenAI response was incomplete; using deterministic templates.");
      return null;
    }

    return {
      postDrafts: postDrafts.slice(0, 10),
      weeklyNotes: weeklyNotes.slice(0, 7),
    };
  } catch (error) {
    console.warn("OpenAI generation failed; using deterministic templates.");
    if (error instanceof Error) {
      console.warn(error.message);
    }
    return null;
  }
}

type OpenAiResponsePayload = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

function extractOpenAiText(payload: OpenAiResponsePayload): string | null {
  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }

  const contentText = payload.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .find((text): text is string => typeof text === "string" && text.trim().length > 0);

  return contentText ?? null;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
