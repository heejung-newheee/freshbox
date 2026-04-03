# FreshBox 데이터 저장소 구조

## 📊 현재 데이터 저장 방식

### 1. **로컬 스토리지 (localStorage)**

- **저장 위치**: 브라우저의 `localStorage`
- **키**: `freshbox_items`
- **용량**: 약 5-10MB (브라우저마다 상이)
- **특징**:
  - ✅ 브라우저 종료해도 데이터 유지
  - ✅ 새로고침해도 데이터 유지
  - ❌ 다른 기기에서는 동기화 안 됨
  - ❌ 백업 없음

### 2. **메모리 (RAM)**

- React의 `useState`로 관리
- 앱이 실행되는 동안만 유지

## 🔄 데이터 흐름

```
사용자 입력
    ↓
App.tsx (useState 관리)
    ↓
localStorage (자동 저장)
    ↓
새로고침 시 localStorage에서 복원
```

## 📝 App.tsx의 데이터 동기화

```tsx
// 초기 로드 (마운트 시)
useEffect(() => {
  const stored = localStorage.getItem("freshbox_items");
  if (stored) {
    setItems(JSON.parse(stored));
  }
}, []);

// 자동 저장 (items 변경 시)
useEffect(() => {
  localStorage.setItem("freshbox_items", JSON.stringify(items));
}, [items]);
```

## 🚀 향후 개선 사항

### 1. **백엔드 데이터베이스 연동**

- Firebase Firestore (권장)
- MongoDB
- PostgreSQL

### 2. **클라우드 동기화**

- 여러 기기에서 실시간 데이터 공유
- 사용자별 계정 관리
- 데이터 백업

### 3. **IndexedDB**

- localStorage보다 큰 용량 지원
- 복잡한 쿼리 지원

## 💾 저장되는 데이터 구조

```typescript
interface FoodItem {
  id: number; // 고유 ID (타임스탬프)
  name: string; // 식품명
  cat: Category; // 카테고리
  loc: Location; // 위치 (냉장/냉동)
  zone: Zone; // 구역 (상단/중단/하단/야채/도어)
  bought: string; // 구매일 (YYYY-MM-DD)
  expiry: string; // 유통기한 (YYYY-MM-DD)
  qty: number; // 수량
  unit: string; // 단위 (개/봉/통/묶음 등)
  consumed: boolean; // 소비 여부
}
```

## 🔧 localStorage 사용 예시

```typescript
// 데이터 저장
const items = [...];
localStorage.setItem("freshbox_items", JSON.stringify(items));

// 데이터 로드
const stored = localStorage.getItem("freshbox_items");
const items = JSON.parse(stored);

// 데이터 삭제
localStorage.removeItem("freshbox_items");

// 모든 데이터 삭제
localStorage.clear();
```

## ⚠️ 주의사항

1. **용량 초과**: localStorage 초과 시 오류 발생
   - 정기적으로 소비된 항목 정리 필요

2. **보안**: 민감한 정보 저장 금지
   - 개발 단계에서는 localStorage 사용 가능
   - 프로덕션에서는 백엔드 DB 권장

3. **브라우저 호환성**: 모든 모던 브라우저 지원
   - IE 8 이상, 모든 모던 브라우저

## 📱 개발자 도구에서 확인하기

1. Chrome DevTools 열기 (F12)
2. Application 탭 클릭
3. Storage > Local Storage 클릭
4. http://localhost:5173 선택
5. `freshbox_items` 키 확인
