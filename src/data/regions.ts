export const regions = [
  { id: "hokkaido", name: "北海道", area: "北海道" },

  { id: "aomori", name: "青森", area: "東北" },
  { id: "iwate", name: "岩手", area: "東北" },
  { id: "miyagi", name: "宮城", area: "東北" },
  { id: "akita", name: "秋田", area: "東北" },
  { id: "yamagata", name: "山形", area: "東北" },
  { id: "fukushima", name: "福島", area: "東北" },

  { id: "ibaraki", name: "茨城", area: "関東" },
  { id: "tochigi", name: "栃木", area: "関東" },
  { id: "gunma", name: "群馬", area: "関東" },
  { id: "saitama", name: "埼玉", area: "関東" },
  { id: "chiba", name: "千葉", area: "関東" },
  { id: "tokyo", name: "東京", area: "関東" },
  { id: "kanagawa", name: "神奈川", area: "関東" },

  { id: "niigata", name: "新潟", area: "中部" },
  { id: "toyama", name: "富山", area: "中部" },
  { id: "ishikawa", name: "石川", area: "中部" },
  { id: "fukui", name: "福井", area: "中部" },
  { id: "yamanashi", name: "山梨", area: "中部" },
  { id: "nagano", name: "長野", area: "中部" },
  { id: "gifu", name: "岐阜", area: "中部" },
  { id: "shizuoka", name: "静岡", area: "中部" },
  { id: "aichi", name: "愛知", area: "中部" },

  { id: "mie", name: "三重", area: "近畿" },
  { id: "shiga", name: "滋賀", area: "近畿" },
  { id: "kyoto", name: "京都", area: "近畿" },
  { id: "osaka", name: "大阪", area: "近畿" },
  { id: "hyogo", name: "兵庫", area: "近畿" },
  { id: "nara", name: "奈良", area: "近畿" },
  { id: "wakayama", name: "和歌山", area: "近畿" },

  { id: "tottori", name: "鳥取", area: "中国" },
  { id: "shimane", name: "島根", area: "中国" },
  { id: "okayama", name: "岡山", area: "中国" },
  { id: "hiroshima", name: "広島", area: "中国" },
  { id: "yamaguchi", name: "山口", area: "中国" },

  { id: "tokushima", name: "徳島", area: "四国" },
  { id: "kagawa", name: "香川", area: "四国" },
  { id: "ehime", name: "愛媛", area: "四国" },
  { id: "kochi", name: "高知", area: "四国" },

  { id: "fukuoka", name: "福岡", area: "九州・沖縄" },
  { id: "saga", name: "佐賀", area: "九州・沖縄" },
  { id: "nagasaki", name: "長崎", area: "九州・沖縄" },
  { id: "kumamoto", name: "熊本", area: "九州・沖縄" },
  { id: "oita", name: "大分", area: "九州・沖縄" },
  { id: "miyazaki", name: "宮崎", area: "九州・沖縄" },
  { id: "kagoshima", name: "鹿児島", area: "九州・沖縄" },
  { id: "okinawa", name: "沖縄", area: "九州・沖縄" },
] as const;

export type Region = (typeof regions)[number];
export type RegionId = Region["id"];
export type RegionArea = Region["area"];

export const regionAreas = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州・沖縄",
] as const satisfies readonly RegionArea[];

export const regionById = Object.fromEntries(
  regions.map((region) => [region.id, region]),
) as Record<RegionId, Region>;
