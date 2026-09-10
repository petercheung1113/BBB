export const FRACTION_STATION_IDS = [
  "fair-share",
  "num-den",
  "unit",
  "shade",
  "challenge",
] as const;

export type FractionStationId = (typeof FRACTION_STATION_IDS)[number];

export type FractionStationMeta = {
  id: FractionStationId;
  name: string;
  blurb: string;
  emoji: string;
  color: string;
};

export const FRACTION_STATIONS: FractionStationMeta[] = [
  {
    id: "fair-share",
    name: "平分蛋糕",
    blurb: "哪一塊切得公平？認識「等份」。",
    emoji: "🎂",
    color: "#f05a3a",
  },
  {
    id: "num-den",
    name: "認識分子分母",
    blurb: "分母＝分幾份，分子＝取幾份。",
    emoji: "🍕",
    color: "#f0c43a",
  },
  {
    id: "unit",
    name: "單位分數",
    blurb: "比較 1/2、1/3、1/4——分母愈大，一塊愈小。",
    emoji: "📏",
    color: "#3a9a6a",
  },
  {
    id: "shade",
    name: "圖形塗色分數",
    blurb: "塗出指定份數，再檢查答案。",
    emoji: "🎨",
    color: "#5a7af0",
  },
  {
    id: "challenge",
    name: "小挑戰",
    blurb: "綜合小測驗，考考你懂不懂分數概念。",
    emoji: "⭐",
    color: "#c05af0",
  },
];

export function isFractionStationId(id: string): id is FractionStationId {
  return (FRACTION_STATION_IDS as readonly string[]).includes(id);
}

export type ChallengeQ = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explain: string;
};

export const CHALLENGE_QUESTIONS: ChallengeQ[] = [
  {
    id: "c1",
    prompt: "把一塊蛋糕切成「相等」的兩份，每一份是？",
    choices: ["1/2", "2/1", "1/3", "2/2"],
    answer: 0,
    explain: "整塊分 2 等份，取 1 份，就是 1/2。",
  },
  {
    id: "c2",
    prompt: "分數 3/4 裏，哪個是分母？",
    choices: ["3", "4", "3 和 4", "沒有分母"],
    answer: 1,
    explain: "分母在下面，表示整塊被分成幾等份——這裏是 4。",
  },
  {
    id: "c3",
    prompt: "分數 2/5 裏，分子告訴我們什麼？",
    choices: ["分成 2 份", "取了 2 份", "分成 5 份", "一共 7 份"],
    answer: 1,
    explain: "分子在上面，表示取了幾份——這裏取了 2 份。",
  },
  {
    id: "c4",
    prompt: "同樣大小的圓餅，哪一塊比較大？",
    choices: ["1/2", "1/3", "1/4", "一樣大"],
    answer: 0,
    explain: "單位分數分母愈大，每一份愈小。所以 1/2 > 1/3 > 1/4。",
  },
  {
    id: "c5",
    prompt: "把長條分成 6 等份，塗了 4 份，代表哪個分數？",
    choices: ["4/6", "6/4", "4/4", "1/6"],
    answer: 0,
    explain: "分母 6（分成幾份），分子 4（塗了幾份）→ 4/6。",
  },
  {
    id: "c6",
    prompt: "下面哪一種切法是「公平」的？",
    choices: ["兩塊大小一樣", "一塊很大一塊很小", "隨便切三塊", "只切邊緣"],
    answer: 0,
    explain: "公平＝等份。每份大小要一樣，才叫平分。",
  },
  {
    id: "c7",
    prompt: "1/4 和 1/8，哪個比較大？（同樣大小的整塊）",
    choices: ["1/4", "1/8", "一樣大", "無法比較"],
    answer: 0,
    explain: "分母愈大，單位分數愈小。1/4 比 1/8 大。",
  },
  {
    id: "c8",
    prompt: "披薩分成 8 等份，小明吃了 3 份。他吃了整塊的？",
    choices: ["3/8", "8/3", "3/3", "1/8"],
    answer: 0,
    explain: "分母 8、分子 3 → 吃了 3/8。",
  },
];
