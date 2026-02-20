import {
    Chapter,
    PartialSourceManga,
    SourceManga,
} from '@paperback/types'

import { CheerioAPI } from 'cheerio'

export class Parser {

    // ─── Home Page ────────────────────────────────────────────────────────────
    parseHomePage($: CheerioAPI): PartialSourceManga[] {
        const results: PartialSourceManga[] = []

        // href must START with /g/ and id must be purely numeric
        $('a[href^="/g/"]').each((_: any, el: any) => {
            const href = $(el).attr('href') ?? ''
            const id = href.replace('/g/', '').replace(/\/$/, '').split('?')[0]
            if (!id || isNaN(Number(id))) return

            const img = $(el).find('img').first()
            const title = img.attr('alt')?.trim() ?? ''
            const image = img.attr('src') ?? img.attr('data-src') ?? ''

            if (!title || title.length < 2 || !image) return

            results.push(App.createPartialSourceManga({ mangaId: id, title, image }))
        })

        return this.deduplicate(results)
    }

    // ─── Manga Details ────────────────────────────────────────────────────────
    parseMangaDetails($: CheerioAPI, mangaId: string): SourceManga {
        const title = $('meta[property="og:title"]').attr('content')?.trim()
            || $('h1').first().text().trim()
            || mangaId
        const image = $('meta[property="og:image"]').attr('content')?.trim() ?? ''
        const desc = $('meta[property="og:description"]').attr('content')?.trim() ?? ''

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [title],
                image,
                desc,
                status: 'Ongoing',
            }),
        })
    }

    // ─── Chapters ─────────────────────────────────────────────────────────────
    // The chapter list is JS-rendered and NOT in static HTML.
    // Chapter data is only available in the JSON blob embedded in the raw HTML:
    //   "data":[{"name":"2","pictures":33,"createdAt":"2026-01-01"},...]
    // We extract it with regex on the raw HTML string.
    parseChapters(html: string): Chapter[] {
        const chapterData = this.extractChapterData(html)
        if (!chapterData) return []

        // JSON is newest-first — reverse for oldest-first display
        chapterData.reverse()

        return chapterData.map((ch, i) => {
            const name = String(ch.name)
            const chapNum = parseFloat(name) || (i + 1)
            const date = ch.createdAt ? new Date(ch.createdAt) : new Date()

            return App.createChapter({
                id: name,
                chapNum,
                name: `Chapter ${name}`,
                time: isNaN(date.getTime()) ? new Date() : date,
            })
        })
    }

    // ─── Page Count ───────────────────────────────────────────────────────────
    getPageCount(html: string, chapterId: string): number {
        const chapterData = this.extractChapterData(html)
        if (!chapterData) return 0
        const chapter = chapterData.find(ch => String(ch.name) === chapterId)
        return chapter?.pictures ?? 0
    }

    // ─── Private: extract chapter JSON from raw HTML ──────────────────────────
    private extractChapterData(html: string): Array<{ name: string; pictures: number; createdAt?: string }> | null {
        // The JSON is inside a <script> tag and looks like:
        // "data":[{"name":"2","pictures":33,"createdAt":"2026-01-01"},{"name":"1.0","pictures":30,...}]
        //
        // We try multiple regex patterns in case the exact format varies slightly
        const patterns = [
            /"data"\s*:\s*(\[\{"name":"[^"]+","pictures":\d+[^\]]*\])/,
            /"data"\s*:\s*(\[.*?"pictures":\d+.*?\])/s,
            /"data"\s*:\s*(\[[^\]]+\])/,
        ]

        for (const pattern of patterns) {
            const match = html.match(pattern)
            if (!match) continue
            try {
                const parsed = JSON.parse(match[1])
                // Validate it looks like chapter data
                if (Array.isArray(parsed) && parsed.length > 0 && 'name' in parsed[0] && 'pictures' in parsed[0]) {
                    return parsed
                }
            } catch {
                continue
            }
        }
        return null
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────
    private deduplicate(items: PartialSourceManga[]): PartialSourceManga[] {
        const seen = new Set<string>()
        return items.filter(item => {
            if (seen.has(item.mangaId)) return false
            seen.add(item.mangaId)
            return true
        })
    }
}