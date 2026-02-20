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

        $('a[href*="/comic/"]').each((_: any, el: any) => {
            const href = $(el).attr('href') ?? ''
            const id = href.split('/comic/').pop() ?? ''

            if (!id) return

            const img = $(el).find('img').first()
            const title = img.attr('alt')?.trim() || $(el).text().trim() || ''
            let image = img.attr('src') ?? img.attr('data-src') ?? ''

            if (!title || title.length < 2) return

            results.push(App.createPartialSourceManga({
                mangaId: id,
                title: title,
                image: image,
            }))
        })

        return this.deduplicate(results)
    }

    // ─── Manga Details ─────────────────────────────────────────────────────────
    parseMangaDetails($: CheerioAPI, mangaId: string): SourceManga {
        const title = $('meta[property="og:title"]').attr('content')?.trim()
                   || $('h1').first().text().trim()
                   || mangaId

        const image = $('meta[property="og:image"]').attr('content')?.trim() ?? ''

        const desc = $('meta[property="og:description"]').attr('content')?.trim()
                  || $('div.description, div.summary').first().text().trim()
                  || ''

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [title],
                image: image,
                desc: desc,
                status: 'Ongoing',
            }),
        })
    }

    // ─── Chapters ─────────────────────────────────────────────────────────────
    parseChapters($: CheerioAPI, mangaId: string): Chapter[] {
        const chapters: Chapter[] = []

        $(`a[href*="/read/${mangaId}/"]`).each((_: any, el: any) => {
            const href = $(el).attr('href') ?? ''
            const chapterNum = href.split('/read/').pop()?.split('/').pop() ?? ''
            const name = $(el).text().trim() || `Chapter ${chapterNum}`
            const num = parseFloat(chapterNum) || 0

            if (chapterNum && !isNaN(num)) {
                chapters.push(App.createChapter({
                    id: chapterNum,
                    chapNum: num,
                    name: name,
                    time: new Date(),
                }))
            }
        })

        // Deduplicate and sort ascending
        const seen = new Set<string>()
        return chapters
            .filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true })
            .sort((a, b) => a.chapNum - b.chapNum)
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
