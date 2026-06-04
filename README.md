# GOMSOFT 공식 홈페이지

곰소프트(GOMSOFT) 회사 소개·포트폴리오·정부지원사업 제출용 정적 홈페이지입니다.

- **배포**: GitHub Pages (`gomsoft.kr`)
- **스택**: HTML / CSS / JavaScript (빌드 도구 없음)
- **CMS**: Git 저장소 기반 — `/admin`에서 Markdown 게시글 관리

## 사이트 구조

| 경로 | 설명 |
|------|------|
| `/` | Home — Hero, Company Profile, Projects 미리보기 |
| `/about/` | 회사·대표·역량·비전 |
| `/projects/` | 4개 프로젝트 포트폴리오 |
| `/media/` | Media 게시판 (CMS) |
| `/post.html` | 게시글 상세 |
| `/contact/` | 문의 |
| `/admin/` | CMS 관리자 |

## 콘텐츠 저장

```
content/apps/*.md
content/media/*.md
content/welding/*.md
data/posts.json   ← 목록 인덱스 (관리자 저장 시 자동 갱신)
```

## 관리자 사용법

1. [Fine-grained Token](https://github.com/settings/tokens?type=beta) 발급 — `gomsoft-homepage` 저장소, **Contents** Read & Write
2. `https://gomsoft.kr/admin/` 접속 후 Token 입력
3. **7일간 기억하기** 체크 시 `localStorage`, 미체크 시 `sessionStorage`(탭/브라우저 종료 시 해제)
4. GitHub API로 저장소 권한 확인 후 CMS 표시 (로그인 계정명 표시)
5. 저장 시 GitHub에 자동 커밋 → Pages 재배포 (1~2분)

## 설정 변경

`assets/js/config.js`에서 연락처, 네이버 폼 URL, GitHub 저장소 정보, 관리자 암호를 수정합니다.

## 폰트

- **Pretendard** 9웨이트 (Thin 100 ~ Black 900)
- 원본: `Pretendard_alternative.zip` (OFL)
- 웹 배포: `assets/fonts/pretendard/*.subset.woff2` (한글 서브셋, 용량 최적화)
- 라이선스: `assets/fonts/LICENSE-Pretendard.txt`

## 로컬 미리보기

```bash
npx serve .
```

또는 VS Code Live Server 확장 사용.

## SEO

- 페이지별 meta / OpenGraph (`components.js`)
- `sitemap.xml`, `robots.txt` (admin은 noindex)
