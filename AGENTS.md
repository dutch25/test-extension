# AGENTS.md

## Project Overview

This is a **Paperback** iOS extension supporting **two Vietnamese hentai manga sources**:
- **vi-hentai.pro** - Built-in source `ViHentai`
- **nhentaiclub.space** - Built-in source `NHentaiClub`

Users can browse, search, and read manga from both sites through the Paperback app.

## Tech Stack

- **TypeScript** - Language used for the extension
- **@paperback/types** (v0.8.0-alpha.47) - Paperback SDK
- **@paperback/toolchain** (v0.8.0-alpha.47) - Build tools

## Project Structure

```
vi-hentai/
├── src/
│   ├── ViHentai/
│   │   ├── ViHentai.ts           ← Main source implementation
│   │   ├── ViHentaiParser.ts     ← HTML parsing logic
│   │   └── includes/icon.png     ← Extension icon
│   └── NHentaiClub/
│       ├── NHentaiClub.ts        ← Main source implementation
│       ├── NHentaiClubParser.ts  ← HTML parsing logic
│       └── includes/icon.png     ← Extension icon
├── bundles/                      ← Built extension (auto-generated)
├── package.json                  ← Dependencies and scripts
├── tsconfig.json                  ← TypeScript config
├── README.md                      ← Setup instructions
└── .gitignore
```

## Key Commands

- `npm run bundle` - Build the extension
- `npm run serve` - Start local server for Paperback to connect
- `npm run dev` - Auto-rebuild on changes

---

# Source 1: ViHentai

**Website**: https://vi-hentai.pro

### SourceInfo
- **Version**: 1.1.29
- **Author**: Dutch25
- **Content Rating**: ADULT (18+)
- **Tags**: "Adult" (RED), "18+" (YELLOW)
- **Intents**: MANGA_CHAPTERS | HOMEPAGE_SECTIONS | CLOUDFLARE_BYPASS_REQUIRED

### URL Patterns
- Homepage: `https://vi-hentai.pro/`
- Manga: `https://vi-hentai.pro/truyen/{mangaId}`
- Chapter: `https://vi-hentai.pro/truyen/{mangaId}/{chapterId}`
- Search: `https://vi-hentai.pro/danh-sach?page={page}&keyword={search}`
- Genre: `https://vi-hentai.pro/the-loai/{genre}?page={page}`

### Homepage Sections
1. **Mới Cập Nhật** (Latest) - `/`
2. **Phổ Biến Nhất** (Popular) - `/?sort=-views`
3. **Truuyện Mới** (New) - `/?sort=-created_at`

### How It Works

1. **getHomePageSections** - Fetches homepage and parses `.manga-vertical` elements
2. **getSearchResults** - Searches via `/danh-sach` or filters by genre
3. **getMangaDetails** - Parses manga info from `/truyen/{mangaId}`: title, cover, author, status, description, genres
4. **getChapters** - Fetches reader page and parses `#chapter-selector` dropdown options
5. **getChapterDetails** - Returns page images from chapter page
   - ⚠️ **BROKEN**: Site uses Livewire - images load dynamically via AJAX, not in initial HTML
   - Has fallbacks that don't work properly

### Image CDN
- `img.shousetsu.dev` - Behind Cloudflare protection
- Requires cloudflare bypass headers

### Known Issues
- Chapter images don't load - Livewire renders content after page load
- The extension can't extract images properly (shows same test images for all chapters)

---

# Source 2: NHentaiClub

**Website**: https://nhentaiclub.space

### SourceInfo
- **Version**: 1.1.50
- **Author**: Dutch25
- **Content Rating**: ADULT (18+)
- **Tags**: "Adult" (RED), "18+" (YELLOW)
- **Intents**: MANGA_CHAPTERS | HOMEPAGE_SECTIONS | CLOUDFLARE_BYPASS_REQUIRED

### URL Patterns
- Homepage: `https://nhentaiclub.space/`
- Manga: `https://nhentaiclub.space/g/{mangaId}`
- Search: `https://nhentaiclub.space/search?keyword={search}&page={page}`
- Genre: `https://nhentaiclub.space/genre/{genreId}?page={page}`
- Ranking: `/ranking/{all-time|day|week|month}?page={page}`
- Images: `https://i{n}.nhentaiclub.shop/{mangaId}/VI/{chapterId}/{page}.jpg`

### Homepage Sections
1. **Mới Cập Nhật** (Latest) - `/`
2. **Xếp Hạng Tất Cả** (All-Time) - `/ranking/all-time`
3. **Xếp Hạng Ngày** (Day) - `/ranking/day`
4. **Xếp Hạng Tuần** (Week) - `/ranking/week`
5. **Xếp Hạng Tháng** (Month) - `/ranking/month`

### How It Works

1. **getHomePageSections** - Fetches each section URL and parses `a[href^="/g/"]` links
2. **getSearchResults** - Searches via `/search` or filters by genre
3. **getMangaDetails** - Parses `/g/{mangaId}` page: extracts title from `og:title`, cover from `og:image`, description from `og:description`
4. **getChapters** - Extracts chapter list from embedded Next.js JSON in HTML
   - Chapter data stored in script tag as: `\"data\":[{\"name\":\"1\",\"pictures\":25,...}]`
   - Parser unescapes quotes and extracts JSON array
5. **getChapterDetails** - Builds image URLs using:
   - CDN base from `og:image` meta tag (e.g., `https://i3.nhentaiclub.shop`)
   - Page count from chapter JSON (`pictures` field)
   - Format: `{cdnBase}/{mangaId}/VI/{chapterId}/{page}.jpg`
   - All image URLs go through worker proxy

### Proxy
- Worker proxy: `https://nhentai-club-proxy.feedandafk2018.workers.dev`
- Used for both cover images and chapter pages
- ⚠️ CDN images still return 403 (proxy can't bypass CDN Cloudflare)

### Search Tags
- 130+ genres defined in `NHentaiClubParser.getSearchTags()`
- Tags: ahegao, anal, bdsm, big-ass, big-boobs, blowjobs, cosplay, doujinshi, ecchi, futanari, harem, incest, milf, netorare, ntr, oral, rape, tentacles, threesome, virgin, yaoi, yuri, and more

### Known Issues
- CDN images (`i*.nhentaiclub.shop`) are behind Cloudflare - proxy can't bypass
- Shows 403 when loading chapter images

---

# Release Checklist

**Important:** Only update the version for the source you're modifying.

### 1. Update Version Numbers

**If working on ViHentai:** Update `src/ViHentai/ViHentai.ts` - `version: 'x.x.x'`

**If working on NHentaiClub:** Update `src/NHentaiClub/NHentaiClub.ts` - `version: 'x.x.x'`

Optionally update `package.json` version to match.

### 2. Build and Push

```bash
npm run bundle
git add bundles/ src/ package.json
git commit -m "Version x.x.x - description"
git push
```

GitHub Actions auto-deploys to GitHub Pages.

### 3. Quick Release Command

```bash
npm version patch && npm run bundle && git add bundles/ package.json && git commit -m "Version x.x.x" && git push
```

---

# Deployment

- Push to main branch triggers auto-deploy to GitHub Pages
- Users add via: `https://<username>.github.io/vi-hentai/`
