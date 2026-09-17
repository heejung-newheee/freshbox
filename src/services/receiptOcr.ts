import type { Category } from "@/@types";

export interface ScannedItem {
  name: string;
  quantity: number;
  unit: string;
  category: Category;
}

const VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";

// 영수증 머리말·꼬리말 등 품목이 아닌 줄
const SKIP_KEYWORDS = [
  "합계", "소계", "총액", "총 금액", "받을금액", "부가세", "과세", "면세", "공급가",
  "결제", "카드", "현금", "승인", "거래", "일시", "영수증", "매장", "지점", "전화",
  "사업자", "대표", "주소", "포인트", "적립", "할인", "잔액", "거스름", "품명", "상품명",
  "단가", "수량", "금액", "판매", "구매", "고객", "감사", "교환", "환불", "반품",
  "영업", "계산", "회원", "누적", "유효", "발행", "봉투", "쇼핑백", "tel", "pos", "no.",
];

// 긴 키워드가 먼저 매칭되도록 길이순 비교, 동점이면 아래 배열 순서
const CATEGORY_KEYWORDS: [Category, string[]][] = [
  ["김치/반찬", ["김치", "깍두기", "단무지", "장아찌", "젓갈", "반찬", "나물", "무침", "조림", "겉절이"]],
  ["양념", ["간장", "고추장", "된장", "쌈장", "설탕", "소금", "식초", "참기름", "들기름", "식용유",
    "올리브유", "후추", "고춧가루", "다시다", "마요네즈", "케첩", "소스", "맛술", "물엿",
    "올리고당", "카레", "춘장", "액젓", "미림"]],
  ["유제품", ["우유", "요거트", "요구르트", "치즈", "버터", "생크림", "휘핑", "연유", "락토프리"]],
  ["두부/콩류", ["두부", "순두부", "유부", "두유", "낫토", "청국장", "도토리묵", "검은콩", "렌틸"]],
  ["해산물", ["고등어", "갈치", "삼치", "연어", "참치", "오징어", "낙지", "문어", "새우", "꽃게",
    "바지락", "홍합", "전복", "멸치", "미역", "다시마", "명태", "동태", "코다리", "어묵",
    "맛살", "생선", "조개", "굴"]],
  ["육류/달걀", ["삼겹살", "목살", "항정살", "한우", "소고기", "쇠고기", "돼지고기", "돈육", "우육",
    "닭가슴살", "닭다리", "닭볶음탕", "닭고기", "오리고기", "양고기", "베이컨", "소시지",
    "등심", "안심", "갈비", "불고기", "차돌박이", "달걀", "계란", "구운란", "훈제란", "햄"]],
  ["가공식품", ["김치만두", "냉동만두", "물만두", "라면", "국수", "파스타", "스파게티", "만두", "피자",
    "돈까스", "통조림", "참치캔", "스팸", "즉석", "레토르트", "시리얼", "식빵", "과자",
    "떡볶이", "가래떡", "햇반", "치킨", "너겟", "튀김", "핫도그", "치킨너겟"]],
  ["채소/과일", ["양파", "대파", "쪽파", "마늘", "생강", "감자", "고구마", "당근", "오이", "애호박",
    "단호박", "배추", "무", "상추", "깻잎", "시금치", "브로콜리", "버섯", "토마토", "가지",
    "피망", "파프리카", "고추", "콩나물", "숙주", "사과", "바나나", "포도", "딸기", "귤",
    "오렌지", "수박", "참외", "복숭아", "자두", "키위", "레몬", "블루베리", "망고",
    "파인애플", "아보카도", "샐러드", "채소", "야채", "과일", "옥수수", "부추", "미나리"]],
];

// 긴 표기가 먼저 매칭되도록 정렬 ("3개입"이 "3개"로 잘리지 않게)
const COUNT_UNITS = ["개입", "봉지", "묶음", "박스", "입", "개", "팩", "봉", "병", "캔", "매", "장", "줄", "포", "통", "속", "단"];

// 품목 표의 머리글 줄 (예: "NO. 상품명 단가 수량 금액", "상 품 명  단가 수량 금액")
const TABLE_HEADER = /(상품명|품명)/;
const TABLE_COLUMNS = /(단가|수량|금액)/;
// 품목 표가 끝나고 정산이 시작되는 줄
const TABLE_END = /^(과세물품|면세물품|비과세|합계|소계|총계|총액|총구매|부가세|금액계|판매금액|구매금액|결제금액|받을금액|할인금액|신용카드|카드결제)/;

const compact = (s: string) => s.replace(/\s/g, "");

interface Vertex {
  x?: number;
  y?: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("이미지를 읽지 못했습니다"));
    reader.readAsDataURL(file);
  });
}

const mean = (ns: number[]) => ns.reduce((a, b) => a + b, 0) / ns.length;

/**
 * Vision이 주는 줄바꿈은 영수증의 시각적 가로줄과 다르다. 컬럼 간격이 넓으면
 * "상품명 / 단가 / 수량 / 금액"이 따로 끊기고, 사진이 돌아가 있으면 순서도 흐트러진다.
 * 그래서 단어 상자 좌표로 가로줄을 직접 복원한다.
 */
function buildLines(words: { text: string; vertices: Vertex[] }[]): string[] {
  if (words.length === 0) return [];

  // 읽기 방향 = 각 단어 상자의 윗변(좌상→우상) 평균. 사진이 돌아가 있어도 따라간다
  let ux = 0;
  let uy = 0;
  for (const { vertices } of words) {
    ux += (vertices[1]?.x ?? 0) - (vertices[0]?.x ?? 0);
    uy += (vertices[1]?.y ?? 0) - (vertices[0]?.y ?? 0);
  }
  const norm = Math.hypot(ux, uy) || 1;
  ux /= norm;
  uy /= norm;
  const [vx, vy] = [-uy, ux]; // 줄이 쌓이는 방향

  const placed = words.map(({ text, vertices }) => {
    const across = vertices.map((v) => (v.x ?? 0) * vx + (v.y ?? 0) * vy);
    return {
      text,
      along: mean(vertices.map((v) => (v.x ?? 0) * ux + (v.y ?? 0) * uy)),
      across: mean(across),
      height: Math.max(...across) - Math.min(...across),
    };
  });

  const heights = placed.map((w) => w.height).sort((a, b) => a - b);
  const tolerance = heights[Math.floor(heights.length / 2)] * 0.6;

  placed.sort((a, b) => a.across - b.across);
  const rows: (typeof placed)[] = [];
  for (const word of placed) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(word.across - mean(row.map((w) => w.across))) <= tolerance) row.push(word);
    else rows.push([word]);
  }

  return rows.map((row) =>
    row
      .sort((a, b) => a.along - b.along)
      .map((w) => w.text)
      .join(" "),
  );
}

async function detectLines(file: File): Promise<string[]> {
  const key = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
  if (!key) throw new Error("Vision API 키가 설정되지 않았습니다");

  const res = await fetch(`${VISION_ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: await fileToBase64(file) },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          imageContext: { languageHints: ["ko"] },
        },
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "글자 인식에 실패했습니다");

  // [0]은 전체 텍스트, [1]부터가 단어별 상자
  const annotations = data.responses?.[0]?.textAnnotations ?? [];
  const words = annotations.slice(1).map((a: { description: string; boundingPoly?: { vertices?: Vertex[] } }) => ({
    text: a.description,
    vertices: a.boundingPoly?.vertices ?? [],
  }));

  const lines = buildLines(words.filter((w: { vertices: Vertex[] }) => w.vertices.length === 4));
  if (lines.length > 0) return lines;
  return (data.responses?.[0]?.fullTextAnnotation?.text ?? "").split(/\r?\n/);
}

export function guessCategory(name: string): Category {
  let best: { category: Category; length: number } | null = null;
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    for (const keyword of keywords) {
      if (name.includes(keyword) && keyword.length > (best?.length ?? 0)) {
        best = { category, length: keyword.length };
      }
    }
  }
  return best?.category ?? "기타";
}

function cleanName(raw: string): string {
  return raw
    .replace(/\d{8,}/g, "") // 바코드
    .replace(/^[^()[\]]{1,10}[)\]]/, "") // 롯데) 같은 브랜드 머리말
    .replace(/[[\](){}*#]/g, "")
    .replace(/\d+(\.\d+)?\s*(kg|g|ml|l|리터|호)\b/gi, "") // 500g, 1.8L 같은 중량 표기
    .replace(/\s+\d+$/, "") // 이름 뒤에 떨어져 붙은 숫자 (용량 표기 등)
    .replace(/\s+/g, " ")
    .trim();
}

/** 품목 표 영역만 잘라낸다. 머리글을 못 찾으면 null */
function sliceItemLines(lines: string[]): string[] | null {
  const start = lines.findIndex((l) => {
    const c = compact(l);
    return TABLE_HEADER.test(c) && TABLE_COLUMNS.test(c);
  });
  if (start < 0) return null;

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => TABLE_END.test(compact(l)));
  return end < 0 ? rest : rest.slice(0, end);
}

const numericTokens = (line: string): string[] => line.match(/\d[\d,]*/g) ?? [];

/** 끝 세 컬럼이 단가 × 수량 = 금액 을 만족할 때만 수량으로 인정한다 */
function quantityFromColumns(tokens: string[]): number | null {
  if (tokens.length < 3) return null;
  const [price, qty, amount] = tokens.slice(-3).map((t) => Number(t.replace(/,/g, "")));
  if (!qty || qty > 99 || price * qty !== amount) return null;
  return qty;
}

function parseItemLines(lines: string[], strict: boolean): ScannedItem[] {
  const items: ScannedItem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 2) continue;
    if (!/[가-힣]/.test(line)) continue; // 바코드·상품코드만 있는 줄
    if (SKIP_KEYWORDS.some((k) => compact(line).toLowerCase().includes(k))) continue;
    if (strict && !/\d/.test(line)) continue; // 표를 못 찾았을 땐 금액 없는 줄을 버린다

    const body = line.replace(/^\d{1,3}[.)]?\s+/, ""); // 품목 번호

    // 구매 개수: 금액 컬럼이 같은 줄에 있으면 거기서, 없으면 다음 숫자 줄에서 읽는다
    let bought = quantityFromColumns(numericTokens(body));
    if (bought === null && !/[가-힣]/.test(lines[i + 1] ?? "")) {
      const next = quantityFromColumns(numericTokens(lines[i + 1] ?? ""));
      if (next !== null) {
        bought = next;
        i++; // 숫자 줄 소비
      }
    }

    // 묶음 크기: 이름에 붙은 "5입", "3개입" 표기. 실제 개수는 묶음 크기 × 구매 개수
    let packSize = 1;
    let unit = "개";
    let nameSource = body.split(/\s+\d[\d,]*/)[0] ?? body;
    const inline = body.match(new RegExp(`(\\d{1,2})\\s*(${COUNT_UNITS.join("|")})(?![가-힣])`));
    if (inline) {
      packSize = Number(inline[1]);
      unit = inline[2] === "입" || inline[2] === "개입" ? "개" : inline[2];
      nameSource = nameSource.replace(inline[0], " ");
    }

    const name = cleanName(nameSource);
    if (name.length < 2 || !/[가-힣]/.test(name) || seen.has(name)) continue;

    seen.add(name);
    items.push({
      name,
      quantity: packSize * (bought ?? 1),
      unit,
      category: guessCategory(name),
    });
  }

  return items;
}

export function parseReceiptLines(lines: string[]): ScannedItem[] {
  if (import.meta.env?.DEV) console.debug("[영수증 인식]\n" + lines.join("\n"));
  const region = sliceItemLines(lines);
  return region ? parseItemLines(region, false) : parseItemLines(lines, true);
}

export const parseReceiptText = (text: string): ScannedItem[] =>
  parseReceiptLines(text.split(/\r?\n/));

export async function scanReceipt(file: File): Promise<ScannedItem[]> {
  return parseReceiptLines(await detectLines(file));
}
