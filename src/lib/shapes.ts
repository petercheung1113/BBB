export const SHAPE_IDS = [
  "square",
  "rectangle",
  "triangle",
  "circle",
  "parallelogram",
  "rhombus",
  "trapezoid",
  "hexagon",
] as const;

export type ShapeId = (typeof SHAPE_IDS)[number];

export type DimKey =
  | "side"
  | "length"
  | "width"
  | "base"
  | "height"
  | "sideA"
  | "sideB"
  | "sideC"
  | "radius"
  | "top"
  | "bottom"
  | "leg"
  | "diag1"
  | "diag2";

export type DimField = {
  key: DimKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
};

export type Dims = Partial<Record<DimKey, number>>;

export type ShapeDef = {
  id: ShapeId;
  name: string;
  nickname: string;
  tagline: string;
  level: string;
  color: string;
  ink: string;
  sides: string;
  angles: string;
  properties: string[];
  lookFor: string[];
  perimeter: {
    formula: string;
    spoken: string;
    why: string[];
    example: { given: string; steps: string[]; result: string };
  };
  area: {
    formula: string;
    formulaAlt?: string;
    spoken: string;
    why: string[];
    example: { given: string; steps: string[]; result: string };
  };
  mistakes: string[];
  realWorld: string[];
  funFact: string;
  lab: DimField[];
  defaults: Dims;
};

export const SHAPES: Record<ShapeId, ShapeDef> = {
  square: {
    id: "square",
    name: "正方形",
    nickname: "方方",
    tagline: "四邊一樣長，四個角都是直角",
    level: "小一開始",
    color: "var(--color-sq)",
    ink: "var(--color-sq-ink)",
    sides: "4 條邊，全部相等",
    angles: "4 個直角（每個 90°）",
    properties: [
      "四條邊一樣長，對邊平行。",
      "四個角都是直角，所以轉彎時每次都轉得整整齊齊。",
      "兩條對角線一樣長，而且互相垂直平分。",
      "正方形同時也是長方形、菱形和平行四邊形的『特別版』。",
    ],
    lookFor: ["四邊相等", "四個直角", "可以完美地鋪滿地面"],
    perimeter: {
      formula: "周界 = 邊長 × 4",
      spoken: "正方形的周界，等於邊長乘以四。因為四條邊一樣長，把一條邊加四次就行了。",
      why: [
        "周界就是沿着圖形走一圈的總長度。",
        "正方形四條邊完全一樣，所以不用四條邊逐一相加，直接『邊長 × 4』最快。",
        "你也可以想成：把正方形的四條邊拆開，接成一條長長的直線，那條直線就是周界。",
      ],
      example: {
        given: "邊長 6 厘米",
        steps: ["周界 = 6 × 4", "6 × 4 = 24"],
        result: "24 厘米",
      },
    },
    area: {
      formula: "面積 = 邊長 × 邊長",
      spoken: "正方形的面積，等於邊長乘以邊長。也就是邊長的平方。",
      why: [
        "面積是圖形蓋住多少『地』，可以想成有多少個 1 厘米 × 1 厘米的小格子。",
        "如果邊長是 3 厘米，就可以鋪 3 行、每行 3 格，一共 9 格。",
        "所以把『一行有幾格』乘『有幾行』，也就是邊長 × 邊長。",
      ],
      example: {
        given: "邊長 5 厘米",
        steps: ["面積 = 5 × 5", "5 × 5 = 25"],
        result: "25 平方厘米",
      },
    },
    mistakes: [
      "把周界和面積搞混：周界是走一圈的長度，面積是鋪滿的格子。",
      "只乘兩邊就停下：正方形四邊都要算進周界。",
    ],
    realWorld: ["地磚", "棋盤格子", "窗框", "便當盒蓋"],
    funFact: "蜂巢不是正方形，因為六邊形才能用最少的牆圍出最大的空間。正方形卻最擅長把地面鋪得沒有縫隙。",
    lab: [{ key: "side", label: "邊長", min: 1, max: 12, step: 0.5, unit: "cm" }],
    defaults: { side: 5 },
  },
  rectangle: {
    id: "rectangle",
    name: "長方形",
    nickname: "長長",
    tagline: "對邊相等，四個角都是直角",
    level: "小一開始",
    color: "var(--color-rect)",
    ink: "var(--color-rect-ink)",
    sides: "4 條邊，對邊相等",
    angles: "4 個直角（每個 90°）",
    properties: [
      "長和闊可以不一樣；兩條長相等，兩條闊相等。",
      "四個角都是直角，對邊平行。",
      "對角線一樣長，並且互相平分。",
      "當長等於闊時，長方形就變成正方形。",
    ],
    lookFor: ["對邊相等", "四個直角", "像門、書、電話"],
    perimeter: {
      formula: "周界 = (長 + 闊) × 2",
      spoken: "長方形的周界，等於長加闊，再乘以二。因為走一圈會經過兩次長、兩次闊。",
      why: [
        "從一個角出發走一圈：長、闊、長、闊。",
        "兩條長加兩條闊，可以先把『一組長 + 一組闊』加起來，再乘 2。",
        "這比 長 + 闊 + 長 + 闊 更快，也不容易漏加。",
      ],
      example: {
        given: "長 8 厘米，闊 3 厘米",
        steps: ["周界 = (8 + 3) × 2", "11 × 2 = 22"],
        result: "22 厘米",
      },
    },
    area: {
      formula: "面積 = 長 × 闊",
      spoken: "長方形的面積，等於長乘以闊。就像數一數裏面有幾行、每行幾格。",
      why: [
        "把長方形鋪上 1 厘米的小正方形。",
        "每行的格子數等於『長』，行數等於『闊』。",
        "總格數 = 每行格數 × 行數 = 長 × 闊。",
      ],
      example: {
        given: "長 7 厘米，闊 4 厘米",
        steps: ["面積 = 7 × 4", "7 × 4 = 28"],
        result: "28 平方厘米",
      },
    },
    mistakes: [
      "周界誤做成 長 × 闊（那是面積）。",
      "只加長和闊一次，忘記走一圈還有另外兩邊。",
    ],
    realWorld: ["書本", "門", "足球場", "電話屏幕"],
    funFact: "標準足球場就是一個很大的長方形。球證量的是長和闊，不是斜着量。",
    lab: [
      { key: "length", label: "長", min: 2, max: 14, step: 0.5, unit: "cm" },
      { key: "width", label: "闊", min: 1, max: 10, step: 0.5, unit: "cm" },
    ],
    defaults: { length: 8, width: 4 },
  },
  triangle: {
    id: "triangle",
    name: "三角形",
    nickname: "尖尖",
    tagline: "三條邊、三個角，內角和 180°",
    level: "小一開始",
    color: "var(--color-tri)",
    ink: "var(--color-tri-ink)",
    sides: "3 條邊",
    angles: "3 個角，加起來 180°",
    properties: [
      "三條邊、三個角、三個頂點，是邊數最少的多邊形。",
      "三個內角加起來永遠是 180°。",
      "等邊三角形三邊相等；等腰三角形有兩邊相等；直角三角形有一個 90° 角。",
      "任意三條長度要能組成三角形，必須最短兩邊加起來大於第三邊。",
    ],
    lookFor: ["三個尖角", "像屋頂、三明治、交通警告牌"],
    perimeter: {
      formula: "周界 = 邊 a + 邊 b + 邊 c",
      spoken: "三角形的周界，就是三條邊加起來。邊長不一定相同，所以要三條都量。",
      why: [
        "走一圈會經過每一條邊各一次。",
        "如果是等邊三角形，三邊相同，周界 = 邊長 × 3。",
        "量的時候要沿着邊走，不要抄近路量『高』。",
      ],
      example: {
        given: "三邊分別是 5、6、7 厘米",
        steps: ["周界 = 5 + 6 + 7", "5 + 6 + 7 = 18"],
        result: "18 厘米",
      },
    },
    area: {
      formula: "面積 = 底 × 高 ÷ 2",
      spoken: "三角形的面積，等於底乘高再除以二。因為兩個相同的三角形可以拼成一個平行四邊形。",
      why: [
        "『底』是你選的那一條邊，『高』是從對面頂點垂直落到這條底的距離。",
        "把兩個完全一樣的三角形，其中一個倒過來，剛好拼成一個平行四邊形。",
        "平行四邊形面積是底 × 高，兩個三角形平分它，所以一個只要一半：底 × 高 ÷ 2。",
        "直角三角形更簡單：兩條直角邊就是底和高，面積 = 兩股相乘 ÷ 2。",
      ],
      example: {
        given: "底 10 厘米，高 6 厘米",
        steps: ["面積 = 10 × 6 ÷ 2", "60 ÷ 2 = 30"],
        result: "30 平方厘米",
      },
    },
    mistakes: [
      "忘記除以 2。",
      "把斜邊當成高：高一定要垂直於底，像一條直直的柱。",
      "周界漏加一條邊。",
    ],
    realWorld: ["屋頂", "三文治", "三角彩旗", "交通警告牌"],
    funFact: "三條邊的架子最穩。所以起重機、鐵橋會用很多三角形，因為它不容易被壓扁。",
    lab: [
      { key: "base", label: "底", min: 3, max: 14, step: 0.5, unit: "cm" },
      { key: "height", label: "高", min: 2, max: 10, step: 0.5, unit: "cm" },
    ],
    defaults: { base: 8, height: 5 },
  },
  circle: {
    id: "circle",
    name: "圓形",
    nickname: "圓圓",
    tagline: "到圓心的距離都一樣",
    level: "小二開始",
    color: "var(--color-circ)",
    ink: "var(--color-circ-ink)",
    sides: "沒有直邊，是一條彎彎的圓周",
    angles: "沒有角",
    properties: [
      "圓心到圓周上任何一點的距離都相等，這段距離叫半徑。",
      "直徑穿過圓心，是最長的弦，直徑 = 半徑 × 2。",
      "圓周是圓的周界，彎彎的一圈。",
      "圓周率 π 大約是 3.14，表示『圓周大約是直徑的 3.14 倍』。",
    ],
    lookFor: ["完全圓滾滾", "沒有角", "像車輪、硬幣、時鐘"],
    perimeter: {
      formula: "周界（圓周）= 2 × π × 半徑  或  π × 直徑",
      spoken: "圓的周界叫圓周，等於二乘圓周率再乘半徑。也可以用圓周率乘直徑。小學通常取 π 為 3.14。",
      why: [
        "無論圓多大，圓周除以直徑，答案都接近 3.14。這個神奇的數叫圓周率 π。",
        "所以圓周 = π × 直徑。直徑又是 2 個半徑，於是也可以寫成 2 × π × 半徑。",
        "用一條線沿着圓繞一圈，再拉直，長度就是圓周。",
      ],
      example: {
        given: "半徑 5 厘米，π = 3.14",
        steps: ["圓周 = 2 × 3.14 × 5", "2 × 3.14 = 6.28", "6.28 × 5 = 31.4"],
        result: "31.4 厘米",
      },
    },
    area: {
      formula: "面積 = π × 半徑 × 半徑",
      spoken: "圓的面積，等於圓周率乘以半徑再乘以半徑。也就是 π 乘半徑的平方。",
      why: [
        "把圓像切蛋糕一樣切成很多薄扇形，再一上一下排好，會越來越像長方形。",
        "這個長方形的『闊』大約是半徑 r，『長』大約是圓周的一半，也就是 πr。",
        "長 × 闊 = πr × r = πr²。所以圓面積是 π 乘半徑乘半徑。",
      ],
      example: {
        given: "半徑 4 厘米，π = 3.14",
        steps: ["面積 = 3.14 × 4 × 4", "4 × 4 = 16", "3.14 × 16 = 50.24"],
        result: "50.24 平方厘米",
      },
    },
    mistakes: [
      "把直徑當成半徑來算（答案會差四倍！）。",
      "只乘一次半徑：面積是 r × r，不是只乘一次。",
      "周界用了 πr²（那是面積）。",
    ],
    realWorld: ["車輪", "硬幣", "時鐘", "餅乾", "井蓋"],
    funFact: "井蓋做成圓形，因為圓的直徑到處都一樣，蓋子怎樣轉都不會掉進洞裏。",
    lab: [{ key: "radius", label: "半徑", min: 1, max: 8, step: 0.5, unit: "cm" }],
    defaults: { radius: 4 },
  },
  parallelogram: {
    id: "parallelogram",
    name: "平行四邊形",
    nickname: "斜斜",
    tagline: "兩對邊分別平行而且相等",
    level: "小三開始",
    color: "var(--color-para)",
    ink: "var(--color-para-ink)",
    sides: "4 條邊，對邊相等",
    angles: "對角相等，鄰角加起來 180°",
    properties: [
      "兩對邊分別平行，對邊相等。",
      "對角相等；鄰角互補（加起來 180°）。",
      "對角線互相平分。",
      "長方形、菱形、正方形都是特殊的平行四邊形。",
    ],
    lookFor: ["像被推斜的長方形", "對邊平行", "高要垂直量"],
    perimeter: {
      formula: "周界 = (邊 a + 邊 b) × 2",
      spoken: "平行四邊形的周界，等於相鄰兩條邊相加再乘二。斜邊也要算進去，不要用高來代替斜邊。",
      why: [
        "走一圈經過兩條底、兩條斜邊。",
        "高是用來算面積的垂直距離，不是邊的長度。",
        "所以周界要用實際的邊長，不是高。",
      ],
      example: {
        given: "底 9 厘米，鄰邊 5 厘米",
        steps: ["周界 = (9 + 5) × 2", "14 × 2 = 28"],
        result: "28 厘米",
      },
    },
    area: {
      formula: "面積 = 底 × 高",
      spoken: "平行四邊形的面積，等於底乘以高。高是兩條底邊之間直直的距離，不是斜邊。",
      why: [
        "從左邊剪下一個直角三角形，搬到右邊貼上，平行四邊形就變成了長方形。",
        "這個長方形的長就是底，闊就是高，面積不變。",
        "所以平行四邊形面積 = 長方形面積 = 底 × 高。",
        "高一定要垂直於底，像一把直直的尺子，不能沿着斜邊量。",
      ],
      example: {
        given: "底 10 厘米，高 6 厘米",
        steps: ["面積 = 10 × 6", "10 × 6 = 60"],
        result: "60 平方厘米",
      },
    },
    mistakes: [
      "用斜邊當高。",
      "面積做成 (a + b) × 2（那是周界）。",
    ],
    realWorld: ["停車位的斜線", "手提袋拉開的樣子", "某些地磚"],
    funFact: "把一疊紙推斜，從旁邊看就是平行四邊形。紙的面積沒有變，因為高變了但底還在。",
    lab: [
      { key: "base", label: "底", min: 4, max: 14, step: 0.5, unit: "cm" },
      { key: "leg", label: "鄰邊", min: 3, max: 12, step: 0.5, unit: "cm" },
      { key: "height", label: "高", min: 2, max: 9, step: 0.5, unit: "cm" },
    ],
    defaults: { base: 9, leg: 6, height: 5 },
  },
  rhombus: {
    id: "rhombus",
    name: "菱形",
    nickname: "菱菱",
    tagline: "四條邊都相等的平行四邊形",
    level: "小三開始",
    color: "var(--color-rhom)",
    ink: "var(--color-rhom-ink)",
    sides: "4 條邊，全部相等",
    angles: "對角相等，不一定是直角",
    properties: [
      "四條邊完全相等，對邊平行。",
      "對角線互相垂直平分，像一個十字。",
      "對角相等。如果有一個角是直角，菱形就變成正方形。",
      "菱形是『四邊相等的平行四邊形』。",
    ],
    lookFor: ["像推斜的正方形", "風箏的身體", "四邊一樣長"],
    perimeter: {
      formula: "周界 = 邊長 × 4",
      spoken: "菱形四條邊一樣長，周界等於邊長乘以四，和正方形一樣算法。",
      why: [
        "四邊相等，走一圈就是邊長加四次。",
        "即使被推斜了，邊的長度不變，所以周界也不變。",
      ],
      example: {
        given: "邊長 7 厘米",
        steps: ["周界 = 7 × 4", "7 × 4 = 28"],
        result: "28 厘米",
      },
    },
    area: {
      formula: "面積 = 底 × 高",
      formulaAlt: "面積 = 對角線① × 對角線② ÷ 2",
      spoken: "菱形面積可以用底乘高，也可以用兩條對角線相乘再除以二。",
      why: [
        "菱形也是平行四邊形，所以面積一樣可以用底 × 高。",
        "兩條對角線互相垂直，把菱形分成四個直角三角形。",
        "把這四個直角三角形重新拼，會得到一個長方形，長和闊正好是兩條對角線的一半。",
        "長方形面積 = (d1÷2) × d2 = d1 × d2 ÷ 2。這就是對角線公式。",
      ],
      example: {
        given: "對角線 6 厘米和 8 厘米",
        steps: ["面積 = 6 × 8 ÷ 2", "48 ÷ 2 = 24"],
        result: "24 平方厘米",
      },
    },
    mistakes: [
      "以為菱形四個角都是直角（那是正方形）。",
      "對角線公式忘記除以 2。",
    ],
    realWorld: ["風箏", "撲克牌的方塊圖案", "鐵絲網", "某些地磚"],
    funFact: "撲克牌裏的『方塊』其實比較像菱形。真正的正方形四個角都是直角。",
    lab: [
      { key: "side", label: "邊長", min: 3, max: 12, step: 0.5, unit: "cm" },
      { key: "height", label: "高", min: 2, max: 10, step: 0.5, unit: "cm" },
    ],
    defaults: { side: 6, height: 5 },
  },
  trapezoid: {
    id: "trapezoid",
    name: "梯形",
    nickname: "梯梯",
    tagline: "只有一對平行邊",
    level: "小四開始",
    color: "var(--color-trap)",
    ink: "var(--color-trap-ink)",
    sides: "4 條邊，其中一對平行",
    angles: "同一腰的鄰角加起來 180°",
    properties: [
      "只有一對邊平行。平行的兩邊叫上底、下底，通常一短一長。",
      "另外兩邊叫腰，可以一樣長（等腰梯形）也可以不一樣。",
      "等腰梯形的兩個底角相等，對角線也相等。",
      "高是兩條平行邊之間直直的距離。",
    ],
    lookFor: ["像小桌子、水壩截面、手提包"],
    perimeter: {
      formula: "周界 = 上底 + 下底 + 兩腰",
      spoken: "梯形的周界，就是四條邊全部加起來。兩條平行邊和兩條腰都要量。",
      why: [
        "走一圈經過四條邊各一次。",
        "上底和下底長度不同，兩腰也不一定相同，所以沒有『乘 2』的捷徑，老老實實四邊相加。",
      ],
      example: {
        given: "上底 5、下底 11、兩腰各 6 厘米",
        steps: ["周界 = 5 + 11 + 6 + 6", "5 + 11 = 16，6 + 6 = 12", "16 + 12 = 28"],
        result: "28 厘米",
      },
    },
    area: {
      formula: "面積 = (上底 + 下底) × 高 ÷ 2",
      spoken: "梯形的面積，等於上底加下底，乘以高，再除以二。可以想成『平均底』乘高。",
      why: [
        "把兩個完全一樣的梯形倒過來拼在一起，會得到一個平行四邊形。",
        "這個平行四邊形的底是『上底 + 下底』，高不變。",
        "平行四邊形面積 = (上底 + 下底) × 高，兩個梯形平分它，所以一個要除以 2。",
        "也可以想成：先把上底和下底平均，得到『中間那條』，再乘高。",
      ],
      example: {
        given: "上底 5 厘米，下底 9 厘米，高 4 厘米",
        steps: ["面積 = (5 + 9) × 4 ÷ 2", "14 × 4 = 56", "56 ÷ 2 = 28"],
        result: "28 平方厘米",
      },
    },
    mistakes: [
      "忘記除以 2。",
      "只用一條底去乘高。",
      "把腰當成高。",
    ],
    realWorld: ["水壩截面", "手提包", "燈罩", "某些桌子"],
    funFact: "水壩常常做成梯形：下面比較闊，才能穩穩擋住很大的水壓。",
    lab: [
      { key: "top", label: "上底", min: 2, max: 10, step: 0.5, unit: "cm" },
      { key: "bottom", label: "下底", min: 4, max: 14, step: 0.5, unit: "cm" },
      { key: "height", label: "高", min: 2, max: 9, step: 0.5, unit: "cm" },
      { key: "leg", label: "腰", min: 3, max: 12, step: 0.5, unit: "cm" },
    ],
    defaults: { top: 5, bottom: 10, height: 4, leg: 5 },
  },
  hexagon: {
    id: "hexagon",
    name: "正六邊形",
    nickname: "蜂蜂",
    tagline: "六條邊一樣長，像蜂巢",
    level: "小四開始",
    color: "var(--color-hex)",
    ink: "var(--color-hex-ink)",
    sides: "6 條邊，全部相等",
    angles: "6 個角，每個 120°",
    properties: [
      "正六邊形六條邊相等、六個角相等，每個內角 120°。",
      "可以從中心分成 6 個一樣的等邊三角形。",
      "對邊平行。",
      "最擅長把平面鋪滿，中間沒有空隙，蜂巢就是這樣。",
    ],
    lookFor: ["六個角", "像蜂巢、螺絲帽、雪花晶體"],
    perimeter: {
      formula: "周界 = 邊長 × 6",
      spoken: "正六邊形六條邊一樣長，周界等於邊長乘以六。",
      why: [
        "走一圈經過六條相同的邊。",
        "所以不用六條逐一加，直接邊長 × 6。",
      ],
      example: {
        given: "邊長 4 厘米",
        steps: ["周界 = 4 × 6", "4 × 6 = 24"],
        result: "24 厘米",
      },
    },
    area: {
      formula: "面積 = 6 個等邊三角形的面積",
      formulaAlt: "面積 ≈ 2.598 × 邊長 × 邊長",
      spoken: "正六邊形可以分成六個等邊三角形。先算一個等邊三角形的面積，再乘六。",
      why: [
        "從中心連到六個頂點，得到 6 個完全一樣的等邊三角形，邊長都等於六邊形的邊長。",
        "一個等邊三角形面積 = 底 × 高 ÷ 2。等邊三角形的高大約是邊長 × 0.866。",
        "六個加起來，大約是 2.598 × 邊長 × 邊長。",
        "重點先記：不是去死記小數，而是看見『六個三角形拼起來』。",
      ],
      example: {
        given: "邊長 4 厘米",
        steps: [
          "一個等邊三角形面積 ≈ 4 × 4 × 0.433 = 6.928",
          "六個：6.928 × 6 ≈ 41.57",
        ],
        result: "約 41.57 平方厘米",
      },
    },
    mistakes: [
      "周界乘 4（那是四邊形）。",
      "把六邊形當成圓來用 π。",
    ],
    realWorld: ["蜂巢", "螺絲帽", "地磚", "鉛筆橫切面"],
    funFact: "蜜蜂蓋六邊形房間，用最少的蠟圍出最大的空間，還能緊緊靠在一起。",
    lab: [{ key: "side", label: "邊長", min: 2, max: 8, step: 0.5, unit: "cm" }],
    defaults: { side: 4 },
  },
};

export const SHAPE_LIST = SHAPE_IDS.map((id) => SHAPES[id]);

export function perimeterOf(id: ShapeId, d: Dims): number {
  switch (id) {
    case "square":
      return (d.side ?? 0) * 4;
    case "rectangle":
      return ((d.length ?? 0) + (d.width ?? 0)) * 2;
    case "triangle": {
      if (d.sideA && d.sideB && d.sideC) {
        return d.sideA + d.sideB + d.sideC;
      }
      const b = d.base ?? 0;
      const h = d.height ?? 0;
      const leg = Math.sqrt((b / 2) ** 2 + h ** 2);
      return b + 2 * leg;
    }
    case "circle":
      return 2 * 3.14 * (d.radius ?? 0);
    case "parallelogram":
      return ((d.base ?? 0) + (d.leg ?? 0)) * 2;
    case "rhombus":
      return (d.side ?? 0) * 4;
    case "trapezoid":
      return (d.top ?? 0) + (d.bottom ?? 0) + (d.leg ?? 0) * 2;
    case "hexagon":
      return (d.side ?? 0) * 6;
  }
}

export function areaOf(id: ShapeId, d: Dims): number {
  switch (id) {
    case "square":
      return (d.side ?? 0) ** 2;
    case "rectangle":
      return (d.length ?? 0) * (d.width ?? 0);
    case "triangle":
      return ((d.base ?? 0) * (d.height ?? 0)) / 2;
    case "circle":
      return 3.14 * (d.radius ?? 0) ** 2;
    case "parallelogram":
      return (d.base ?? 0) * (d.height ?? 0);
    case "rhombus":
      return (d.side ?? 0) * (d.height ?? 0);
    case "trapezoid":
      return (((d.top ?? 0) + (d.bottom ?? 0)) * (d.height ?? 0)) / 2;
    case "hexagon":
      return (3 * Math.sqrt(3) / 2) * (d.side ?? 0) ** 2;
  }
}

export function pluggedFormula(id: ShapeId, d: Dims, kind: "perimeter" | "area"): string {
  const n = (k: DimKey) => d[k] ?? 0;
  if (kind === "perimeter") {
    switch (id) {
      case "square":
        return `${n("side")} × 4`;
      case "rectangle":
        return `(${n("length")} + ${n("width")}) × 2`;
      case "triangle": {
        if (d.sideA && d.sideB && d.sideC) {
          return `${n("sideA")} + ${n("sideB")} + ${n("sideC")}`;
        }
        return "底 + 兩腰（等腰）";
      }
      case "circle":
        return `2 × 3.14 × ${n("radius")}`;
      case "parallelogram":
        return `(${n("base")} + ${n("leg")}) × 2`;
      case "rhombus":
        return `${n("side")} × 4`;
      case "trapezoid":
        return `${n("top")} + ${n("bottom")} + ${n("leg")} + ${n("leg")}`;
      case "hexagon":
        return `${n("side")} × 6`;
    }
  }
  switch (id) {
    case "square":
      return `${n("side")} × ${n("side")}`;
    case "rectangle":
      return `${n("length")} × ${n("width")}`;
    case "triangle":
      return `${n("base")} × ${n("height")} ÷ 2`;
    case "circle":
      return `3.14 × ${n("radius")} × ${n("radius")}`;
    case "parallelogram":
      return `${n("base")} × ${n("height")}`;
    case "rhombus":
      return `${n("side")} × ${n("height")}`;
    case "trapezoid":
      return `(${n("top")} + ${n("bottom")}) × ${n("height")} ÷ 2`;
    case "hexagon":
      return `6 個邊長 ${n("side")} 的等邊三角形`;
  }
}
