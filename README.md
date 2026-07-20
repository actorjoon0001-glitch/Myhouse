# 마이하우스 — 온라인 3D 모듈러주택 박람회 (MVP)

모듈러 주택을 온라인에서 3D로 둘러보고, 규격 유닛을 조합해 내 집을 구성한 뒤
시공 견적을 문의하는 웹 플랫폼입니다. 여러 브랜드가 입점하는 "온라인 박람회"
컨셉의 마켓플레이스입니다.

## 주요 기능

- **박람회 홈** (`/`) — 입점 브랜드/모델 카드 그리드, 검색·브랜드·평수 필터
- **모델 상세** (`/models/[id]`) — R3F 기반 3D 외관 뷰어, 실내 투어(Matterport
  임베드 슬롯, placeholder), 평수/방/가격대/특징, 견적 문의 CTA
- **모듈러 컨피규레이터** (`/configurator`) — 규격 유닛(거실동·침실동·주방동 등)을
  추가/이동/회전/삭제하며 실시간 3D 배치, 총면적·예상가격 실시간 계산
- **견적 문의** (`/inquiry`) — 구성한 집 정보 + 연락처 제출
  (MVP: 콘솔 출력 + localStorage 저장, 백엔드 없음)

## 기술 스택

- Next.js (App Router) + TypeScript
- 3D: React Three Fiber + @react-three/drei
- 스타일: Tailwind CSS v4
- 데이터: `/data` 폴더의 mock JSON (브랜드/모델/유닛)
- 상태: React state (외부 상태 라이브러리 없음)

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
npm run build # 프로덕션 빌드
```

## 구조

```
app/                # 페이지 (App Router)
  page.tsx          # 박람회 홈
  models/[id]/      # 모델 상세
  configurator/     # 유닛 조합 컨피규레이터
  inquiry/          # 견적 문의 폼
components/         # UI 컴포넌트 (viewer/, configurator/ 포함)
data/               # mock JSON: brands / models / units
lib/                # 타입, 데이터 접근, 포맷 유틸
```

## 다음 단계 (MVP 이후)

- 실제 쇼룸 촬영본(Matterport) URL 연동
- 문의 제출 API + 관리자 페이지
- 유닛 드래그 앤 드롭 배치, 2층 적층
