import {
    Chapter,
    PartialSourceManga,
    SourceManga,
    Tag,
    TagSection,
} from '@paperback/types'

import { CheerioAPI } from 'cheerio'

export class Parser {
    // ─── Home Page ─────────────────────────────────────────────────────────────
    parseHomePage($: CheerioAPI): PartialSourceManga[] {
        const results: PartialSourceManga[] = []

        // href must start with /g/ and id must be numeric
        $('a[href^="/g/"]').each((_: any, el: any) => {
            const href = $(el).attr('href') ?? ''
            const id = href.replace('/g/', '').replace(/\/$/, '')
            if (!id || isNaN(Number(id))) return

            const img = $(el).find('img').first()
            const title = img.attr('alt')?.trim() ?? ''
            const image = img.attr('src') ?? img.attr('data-src') ?? ''

            if (!title || title.length < 2 || !image) return

            results.push(App.createPartialSourceManga({ mangaId: id, title, image }))
        })

        return this.deduplicate(results)
    }

    // ─── Manga Details ─────────────────────────────────────────────────────────
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
    // IMPORTANT: Chapter list is rendered by JS — it is NOT in the static HTML.
    // The only source of chapter data is the JSON embedded in the raw HTML string:
    // "data":[{"name":"2","pictures":33,"createdAt":"2026-01-01"},...]
    // We extract this with regex on the raw HTML, not cheerio.
    parseChapters(html: string, mangaId: string): Chapter[] {
        // Match the data array — it contains objects with "name" and "pictures"
        const match = html.match(/"data"\s*:\s*(\[\{"name":"[^"]+","pictures":\d+[^\]]*\])/)
        if (!match) return []

        let chapterData: Array<{ name: string; pictures: number; createdAt?: string }>
        try {
            chapterData = JSON.parse(match[1])
        } catch {
            return []
        }

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

    // ─── Extract page count for a specific chapter from raw HTML ──────────────
    getPageCount(html: string, chapterId: string): number {
        const match = html.match(/"data"\s*:\s*(\[\{"name":"[^"]+","pictures":\d+[^\]]*\])/)
        if (!match) return 0

        let chapterData: Array<{ name: string; pictures: number }>
        try {
            chapterData = JSON.parse(match[1])
        } catch {
            return 0
        }

        const chapter = chapterData.find(ch => String(ch.name) === chapterId)
        return chapter?.pictures ?? 0
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private deduplicate(items: PartialSourceManga[]): PartialSourceManga[] {
        const seen = new Set<string>()
        return items.filter(item => {
            if (seen.has(item.mangaId)) return false
            seen.add(item.mangaId)
            return true
        })
    }
}