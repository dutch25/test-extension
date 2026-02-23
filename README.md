# Vietnamese Source for Paperback

A **Paperback 0.8** extension supporting **two Vietnamese manga sources**:

| Source | Website | Status |
|--------|---------|--------|
| **ViHentai** | vi-hentai.pro | ⚠️ Broken (Livewire/AJAX) |
| **NHentaiClub** | nhentaiclub.space | ✅ Working |

## Add to Paperback


1. Go to **Settings → External Sources**
2. Add this URL: `https://dutch25.github.io/VietSource/`
3. Install **VietSource** extensions

## Features

### ViHentai
- Browse: Latest, Popular, New manga
- Search with genre filtering
- Manga details with chapter list
- ⚠️ Chapter images not loading (site uses Livewire - AJAX rendering)

### NHentaiClub
- Browse: Latest, All-Time/Day/Week/Month rankings
- Search with 130+ genre tags
- Manga details with chapter list
- Chapter reading with page images

## Development

```bash
# Install dependencies
npm install

# Build
npm run bundle

# Serve locally
npm run serve
```

## Deploy

Push to main branch to auto-deploy to GitHub Pages.
