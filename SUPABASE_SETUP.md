# 🚀 Supabase 설정 가이드

## 1️⃣ Supabase 프로젝트 생성

### 1단계: Supabase 계정 가입

- [supabase.com](https://supabase.com)에서 무료 계정 생성
- GitHub로 간편하게 가입 가능

### 2단계: 새 프로젝트 생성

1. "Create a new project" 클릭
2. 프로젝트 이름: `freshbox`
3. 데이터베이스 비밀번호 설정 (안전한 비밀번호)
4. 리전 선택: `Asia Pacific (Singapore)` 또는 가장 가까운 리전
5. 프로젝트 생성 완료 대기 (1-2분)

### 3단계: API 키 복사

1. Supabase 대시보드 > 좌측 "Project Settings"
2. "API" 섹션으로 이동
3. 다음 정보 복사:
   - **URL**: `https://xxxx.supabase.co`
   - **anon key**: `eyJhbGc...` (공개 키)

---

## 2️⃣ 데이터베이스 테이블 생성

### SQL 에디터에서 실행:

```sql
-- food_items 테이블 생성
CREATE TABLE IF NOT EXISTS food_items (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  cat TEXT NOT NULL,
  loc TEXT NOT NULL,
  zone TEXT NOT NULL,
  bought TEXT NOT NULL,
  expiry TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit TEXT NOT NULL,
  consumed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS (Row Level Security) 비활성화 (개발 환경용)
ALTER TABLE food_items DISABLE ROW LEVEL SECURITY;

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_food_items_created_at ON food_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_items_consumed ON food_items(consumed);
```

### Supabase UI에서 생성:

1. "Table Editor" > "+ New Table"
2. 테이블 이름: `food_items`
3. 다음 컬럼 추가:
   - `id` (bigint, primary key)
   - `name` (text)
   - `cat` (text)
   - `loc` (text)
   - `zone` (text)
   - `bought` (text)
   - `expiry` (text)
   - `qty` (bigint)
   - `unit` (text)
   - `consumed` (boolean, default: false)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

---

## 3️⃣ 환경 변수 설정

### .env 파일 생성

프로젝트 루트에 `.env.local` 파일 생성:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 4️⃣ 개발 환경에서 테스트

```bash
# 앱 시작
pnpm dev

# 데이터 추가/수정 시 Supabase에 자동 동기화
# Chrome DevTools > Application > Supabase 확인 가능
```

---

## 5️⃣ 기능별 동작

### ✅ 온라인 상태

- 모든 데이터가 Supabase에 저장됨
- 다른 기기에서도 실시간 동기화 가능

### ✅ 오프라인 상태

- 로컬 localStorage에 자동 저장
- 온라인 복구 시 자동 동기화

### ✅ 에러 발생

- localStorage 폴백으로 안전하게 데이터 보존
- 에러 메시지 표시

---

## 🔐 보안 설정 (프로덕션용)

### RLS (Row Level Security) 활성화

```sql
-- RLS 활성화
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 데이터 조회
CREATE POLICY "Users can view their own items"
ON food_items FOR SELECT
USING (auth.uid() = user_id);

-- 인증된 사용자만 데이터 삽입
CREATE POLICY "Users can insert their own items"
ON food_items FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 필수 설정

- `.env` 파일을 `.gitignore`에 추가
- 본 환경에서만 실제 키 사용
- 개발/프로덕션 환경 분리

---

## 📊 데이터 구조

```typescript
interface FoodItem {
  id: number; // 고유 ID (타임스탐프)
  name: string; // 식품명
  cat: Category; // 카테고리
  loc: Location; // 위치 (냉장/냉동)
  zone: Zone; // 구역
  bought: string; // 구매일
  expiry: string; // 유통기한
  qty: number; // 수량
  unit: string; // 단위
  consumed: boolean; // 소비 여부
  created_at: string; // 생성 시간
}
```

---

## 🆘 문제 해결

### Q: "테이블이 없습니다" 에러

**A:** SQL 에디터에서 위의 SQL 스크립트를 실행하세요.

### Q: "API 키가 잘못되었습니다" 에러

**A:**

1. Supabase 대시보드에서 URL과 키 재확인
2. .env 파일 경로 확인 (`프로젝트_루트/.env.local`)
3. 앱 재시작

### Q: "권한 거부" 에러

**A:** RLS가 활성화되어 있으면 비활성화하세요 (개발 환경용).

### Q: 데이터가 동기화되지 않음

**A:**

1. Chrome DevTools > Network 탭에서 요청 확인
2. Supabase 대시보드에서 테이블 직접 확인
3. localStorage에서 폴백 데이터 확인

---

## 🎉 다음 단계

1. **회원가입/로그인 기능** (Supabase Auth)
2. **사용자별 데이터 분리** (user_id 추가)
3. **실시간 동기화** (Supabase Realtime)
4. **멤버 공유 기능** (공유 초대 시스템)

---

## 📚 유용한 링크

- [Supabase 공식 문서](https://supabase.com/docs)
- [JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- [React 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
