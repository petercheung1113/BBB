import type { ArenaDeckQuestion } from "@/lib/arena/types";

const DEFAULT_TIME_LIMIT_SEC = 20;
const DECK_SIZE = 10;

/**
 * Dedicated Kahoot deck for 圖形課堂擂台.
 * Primary-friendly: Chinese formula wording (長乘闊 / 底乘高), no a+b / a×b algebra.
 * Always returns exactly DECK_SIZE questions (shuffled each room).
 */
const ARENA_BANK: ArenaDeckQuestion[] = [
  {
    id: "ar-rect-area",
    prompt: "長方形的面積怎樣算？",
    options: ["長加闊", "長乘闊", "（長加闊）乘 2", "長乘長"],
    answer: 1,
    explain: "長方形面積 = 長 × 闊（也可以說底 × 高）。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-rect-peri",
    prompt: "長方形的周界怎樣算？",
    options: ["長乘闊", "長加闊", "（長加闊）乘 2", "只加兩條長邊"],
    answer: 2,
    explain: "周界是走一圈：兩條長加兩條闊，即（長 + 闊）× 2。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-sq-area",
    prompt: "正方形的面積怎樣算？",
    options: ["邊長加邊長", "邊長乘邊長", "邊長乘 4", "邊長除 2"],
    answer: 1,
    explain: "正方形四邊一樣長，面積 = 邊長 × 邊長。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-sq-peri",
    prompt: "正方形的周界怎樣算？",
    options: ["邊長乘邊長", "邊長加邊長", "邊長乘 4", "邊長乘 2"],
    answer: 2,
    explain: "四條邊一樣長，周界 = 邊長 × 4。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-tri-area",
    prompt: "三角形的面積怎樣算？",
    options: ["底加高", "底乘高", "底乘高再除以 2", "三邊相加"],
    answer: 2,
    explain: "兩個相同三角形可拼成平行四邊形，所以一個三角形面積 = 底 × 高 ÷ 2。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-para-area",
    prompt: "平行四邊形的面積怎樣算？",
    options: ["底加高", "底乘高", "底乘高再除以 2", "四邊相加"],
    answer: 1,
    explain: "平行四邊形面積 = 底 × 高（高是兩條平行底邊之間的垂直距離）。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-trap-area",
    prompt: "梯形的面積怎樣算？",
    options: [
      "上底乘下底",
      "（上底加下底）乘高再除以 2",
      "上底乘高",
      "四邊相加",
    ],
    answer: 1,
    explain: "兩個相同梯形可拼成平行四邊形，所以面積 =（上底 + 下底）× 高 ÷ 2。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-peri-vs-area",
    prompt: "周界和面積有什麼不同？",
    options: [
      "沒有不同，數字一定一樣",
      "周界是走一圈的長度，面積是蓋住多少地",
      "周界用平方厘米，面積用厘米",
      "只有圓才有周界",
    ],
    answer: 1,
    explain: "周界是邊界總長度（厘米）；面積是裏面鋪滿的大小（平方厘米）。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-tri-why-half",
    prompt: "為什麼三角形面積要「再除以 2」？",
    options: [
      "因為三角形有 3 條邊",
      "兩個相同三角形可拼成一個平行四邊形",
      "高一定是底的一半",
      "除以 2 比較好看",
    ],
    answer: 1,
    explain: "兩個完全一樣的三角形可以拼成平行四邊形（面積是底 × 高），所以一個只要一半。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-rhombus-peri",
    prompt: "菱形的周界怎樣算？（四邊一樣長）",
    options: ["邊長乘邊長", "邊長乘 4", "兩條對角線相加", "邊長加高"],
    answer: 1,
    explain: "菱形四邊相等，周界 = 邊長 × 4。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-height",
    prompt: "量平行四邊形的「高」，應該怎樣量？",
    options: [
      "沿着斜邊量",
      "兩條底邊之間直直（垂直）的距離",
      "隨便量一條對角線",
      "只能量最短的邊",
    ],
    answer: 1,
    explain: "高是兩條平行底邊之間的垂直距離，不是斜邊長度。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
  {
    id: "ar-cut-paste",
    prompt: "把平行四邊形剪一塊貼過去變成長方形，面積會怎樣？",
    options: ["面積減半", "面積變大", "面積不變", "面積變零"],
    answer: 2,
    explain: "只是搬家，沒有丢掉地，所以面積不變；這也說明面積 = 底 × 高。",
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  },
];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/** Build a 10-question arena deck (Chinese options, primary-friendly). */
export function buildArenaDeck(): ArenaDeckQuestion[] {
  const picked = shuffle(ARENA_BANK).slice(0, DECK_SIZE);
  if (picked.length < DECK_SIZE) {
    throw new Error("arena deck empty");
  }
  return picked;
}
