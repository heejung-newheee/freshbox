# 🥦 FreshBox

> 스마트 냉장고 관리 서비스 [Responsive Web App]

냉장고 속 식품을 한눈에 파악하고, 유통기한을 추적하며, 식단까지 계획하는\
냉장고 토탈 관리 플랫폼입니다.\
냉장 / 냉동 구역별 재고 시각화와 D-DAY 알림으로 식품 낭비를 줄이고 스마트하게 관리하세요.

---

### 목차

- [1. 프로젝트 소개](#1-프로젝트-소개)
- [2. 기술스택](#2-기술스택)
- [3. Service Architecture](#3-service-architecture)
- [4. 서비스 주요기능](#4-서비스-주요기능)
- [5. API Table](#5-api-table)

---

### 1. 프로젝트 소개

**FreshBox**는 냉장고 속 식품을 체계적으로 관리하기 위한 웹 애플리케이션입니다.

- 식품별 유통기한을 D-DAY로 추적해 임박 식품을 즉시 파악
- 냉장·냉동 구역(칸)별로 식품을 시각적으로 배치해 어디에 무엇이 있는지 한눈에 확인
- 주간 식단 플래너로 임박 재료를 우선 활용한 레시피 추천
- 멤버 초대 및 권한(소유자 / 편집자 / 열람자) 기반 공유 냉장고 관리
- 모바일(390px+) · 태블릿(768px+) · PC(1024px+) 완전 반응형 지원

---

### 2. 기술스택

<img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"><img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"><img src="https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"><img src="https://img.shields.io/badge/tailwindcss-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"><img src="https://img.shields.io/badge/reactquery-FF4154?style=for-the-badge&logo=reactquery&logoColor=white"><img src="https://img.shields.io/badge/reactrouterdom-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white"><img src="https://img.shields.io/badge/supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"><img src="https://img.shields.io/badge/zustand-F6A623?style=for-the-badge&logo=zustand&logoColor=white">

| 분류 | 기술 | 버전 |
|------|------|------|
| Language | TypeScript | ~5.9 |
| UI Framework | React | ^19.2 |
| Build Tool | Vite | ^7.3 |
| Styling | Tailwind CSS | ^4.2 |
| Server State | TanStack Query | ^5.90 |
| Routing | React Router DOM | ^7.13 |
| Backend / DB | Supabase (PostgreSQL) | ^2.98 |
| Global State | Zustand | ^5.0 |

---

### 3. Service Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client (Browser)                  │
│                                                     │
│  ┌──────────────┐   ┌──────────────────────────┐   │
│  │   Routing    │   │         Pages            │   │
│  │ React Router │──▶│  Dashboard / Inventory   │   │
│  │    DOM v7    │   │  FridgeMap / MealPlanner │   │
│  └──────────────┘   │  Share                   │   │
│                     └────────────┬─────────────┘   │
│                                  │                  │
│  ┌───────────────────────────────▼─────────────┐   │
│  │          Custom Hooks  (src/hooks/)          │   │
│  │  useFoodItems · useConsumeItem · useAddItem  │   │
│  │  useBreakpoint  (반응형 분기)                 │   │
│  └───────────────────────────────┬─────────────┘   │
│                                  │                  │
│  ┌───────────────────────────────▼─────────────┐   │
│  │       TanStack Query  (캐싱 · 동기화)         │   │
│  └───────────────────────────────┬─────────────┘   │
│                                  │                  │
│  ┌───────────────────────────────▼─────────────┐   │
│  │       services/api.ts  (API Layer)           │   │
│  │  getFoodItems · addFoodItem · markConsumed   │   │
│  └───────────────────────────────┬─────────────┘   │
└──────────────────────────────────┼─────────────────┘
                                   │ Supabase JS SDK
                    ┌──────────────▼──────────────┐
                    │          Supabase            │
                    │  PostgreSQL  (food_items)    │
                    │  Auth · RLS · REST API       │
                    └─────────────────────────────┘
```

**반응형 레이아웃 전략**

| 화면 | 범위 | 사이드바 | 하단 탭바 |
|------|------|----------|----------|
| Mobile | < 768px | 숨김 | 표시 |
| Tablet | 768px ~ 1023px | 아이콘 전용 compact 모드 | 숨김 |
| Desktop | ≥ 1024px | 전체 레이블 표시 | 숨김 |

---

### 4. 서비스 주요기능

**1. 대시보드**
- 전체 재고 수 · 임박 식품 수 · 냉장/냉동 현황 · 유통 만료 수 카드 요약
- 유통기한 3일 이내 임박 식품 목록 및 즉시 소비 처리
- 카테고리별 보관 현황 바 차트
- 공유 멤버 목록 표시

**2. 재고 목록**
- 전체 식품 테이블 조회 (유통기한 오름차순)
- 식품명 검색 · 위치(냉장/냉동) 필터 · 카테고리 필터
- D-DAY 상태 배지 (만료 / 위험 / 임박 / 여유)
- 소비 처리로 목록에서 제거

**3. 냉장고 맵**
- 냉장칸 (상단 · 중단 · 하단 · 야채 · 도어) / 냉동칸 (상단 · 중단 · 하단) 구역별 시각화
- 각 칸에 보관된 식품과 D-DAY 색상 코딩 표시
- 구역 미지정 식품 별도 그룹 처리

**4. 식단 플래너**
- 요일별(월~일) 아침 · 점심 · 저녁 식단 계획 표시
- 임박 재료 기반 레시피 추천
- 부족 재료 장보기 목록 자동 제공

**5. 공유 관리**
- 이메일로 멤버 초대
- 권한 단계: `소유자` (모든 권한) · `편집자` (재고 편집) · `열람자` (조회만)
- 현재 멤버 목록 조회 및 제거

**6. 재료 추가 모달**
- 식품명 · 카테고리 · 보관 위치 · 구역 · 구매일 · 유통기한 · 수량 · 단위 입력
- 등록 후 TanStack Query 캐시 무효화로 전체 목록 자동 갱신

---

### 5. API Table

API 관련 함수는 `src/services/api.ts`에 있으며, Supabase JS SDK를 통해 `food_items` 테이블과 통신합니다.

#### Supabase 테이블: `food_items`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | `uuid` | Primary Key (자동 생성) |
| `name` | `text` | 식품명 |
| `category` | `text` | 카테고리 (채소/과일, 육류/달걀 등 8종) |
| `location` | `text` | 보관 위치 (`냉장` / `냉동`) |
| `zone` | `text` | 구역 (`상단` / `중단` / `하단` / `야채` / `도어`) |
| `bought` | `date` | 구매일 |
| `expiry` | `date` | 유통기한 |
| `quantity` | `int4` | 수량 |
| `unit` | `text` | 단위 (개, 봉, 팩 등) |
| `consumed` | `bool` | 소비 여부 (false = 보관 중) |
| `created_at` | `timestamptz` | 등록 시각 |

#### API 함수 명세

| 함수명 | Supabase 연산 | 대상 테이블 | 설명 |
|--------|:------------:|------------|------|
| `getFoodItems()` | `SELECT` | `food_items` | 미소비(`consumed=false`) 식품을 유통기한 오름차순으로 전체 조회. 레거시 location·zone·category 값을 `normalizeItem`으로 정규화 |
| `addFoodItem(item)` | `INSERT` | `food_items` | 새 식품 등록. `consumed: false`, `created_at` 자동 설정 |
| `markFoodItemConsumed(id)` | `UPDATE` | `food_items` | 해당 id의 `consumed`를 `true`로 업데이트 (소비 처리) |
| `deleteFoodItem(id)` | `DELETE` | `food_items` | 해당 id의 식품 레코드 삭제 |

#### 카테고리 타입

```
채소/과일 | 육류/달걀 | 해산물 | 유제품 | 두부/콩류 | 양념 | 가공식품 | 기타
```
