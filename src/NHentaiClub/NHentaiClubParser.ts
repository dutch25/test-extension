import {
    Chapter,
    PartialSourceManga,
    SourceManga,
    Tag,
    TagSection,
} from '@paperback/types'

import { CheerioAPI } from 'cheerio'

export class Parser {
    // Use i3 subdomain which is what the site actually uses
    private readonly IMAGE_BASE_URL = 'https://i3.nhentaiclub.shop'

    // ─── Home Page ─────────────────────────────────────────────────────────────
    parseHomePage($: CheerioAPI): PartialSourceManga[] {
        const results: PartialSourceManga[] = []

        $('a[href^="/g/"]').each((_: any, el: any) => {
            const href = $(el).attr('href') ?? ''
            const id = href.split('/g/').pop() ?? ''

            if (!id) return

            const img = $(el).find('img').first()
            const title = img.attr('alt')?.trim() || ''
            let image = img.attr('src') ?? ''

            if (!title || title.length < 2) return

            // Use direct image URL - rely on Paperback's cloudflare bypass

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
        const tags: Tag[] = []

        $('a[href*="/tag/"], a[href*="/genre/"]').each((_: any, el: any) => {
            const href = $(el).attr('href') ?? ''
            const label = $(el).text().trim()
            const id = href.split('/').pop() ?? label
            if (label) tags.push(App.createTag({ label, id }))
        })

        const title = $('h1, [class*="title"], [class*="name"]').first().text().trim()

        const img = $('img[class*="cover"], img[class*="thumbnail"]').first()
        let image = img.attr('src') ?? ''

        const description = $('[class*="description"], [class*="summary"], [class*="content"]').first().text().trim()

        let author = ''
        $('div:contains("Tác giả"), div:contains("Author"), span:contains("Tác giả")').each((_: any, el: any) => {
            const text = $(el).text()
            const match = text.match(/(?:Tác giả|Author)[:\s]*(.+)/i)
            if (match) author = match[1].trim()
        })

        let status = 'Ongoing'
        const statusText = $('div:contains("Trạng thái"), div:contains("Status")').text().toLowerCase()
        if (statusText.includes('hoàn thành') || statusText.includes('complete')) {
            status = 'Completed'
        }

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [title],
                image: image,
                author: author,
                status: status,
                desc: description,
                tags: [App.createTagSection({ id: 'genres', label: 'Genres', tags: tags })],
            }),
        })
    }

    // ─── Chapters ─────────────────────────────────────────────────────────────
    parseChapters($: CheerioAPI, mangaId: string): Chapter[] {
        const chapters: Chapter[] = []

        $('a[href^="/read/"]').each((_: any, el: any) => {
            const href = $(el).attr('href') ?? ''
            // Match chapter number
            const match = href.match(/\/read\/\d+\/(\d+)/)
            if (!match) return

            const chapterId = match[1]
            const chapterTitle = $(el).text().trim() || `Chapter ${chapterId}`

            chapters.push(App.createChapter({
                id: chapterId,
                chapNum: parseFloat(chapterId),
                name: chapterTitle,
            }))
        })

        return chapters.reverse()
    }

    // ─── Chapter Pages ─────────────────────────────────────────────────────────
    parseChapterPages($: CheerioAPI, mangaId: string, chapterId: string): string[] {
        const pages: string[] = []

        // Try to find images directly from HTML - these have working Cloudflare cookies
        $('img').each((_: any, el: any) => {
            const src = $(el).attr('src') ?? ''
            const dataSrc = $(el).attr('data-src') ?? ''
            const dataLazySrc = $(el).attr('data-lazy-src') ?? ''
            const dataOriginal = $(el).attr('data-original') ?? ''

            // Check all possible attributes
            const pageUrl = dataOriginal || dataLazySrc || dataSrc || src

            // Must be a valid image URL
            if (pageUrl && pageUrl.length > 10) {
                const isImage = pageUrl.includes('.jpg') || pageUrl.includes('.png') || pageUrl.includes('.webp') || pageUrl.includes('.jpeg')
                const isNotThumbnail = !pageUrl.includes('thumbnail') && !pageUrl.includes('icon') && !pageUrl.includes('logo') && !pageUrl.includes('loading') && !pageUrl.includes('svg')

                if (isImage && isNotThumbnail && pageUrl.startsWith('http')) {
                    // Use worker proxy for CDN images
                    if (pageUrl.includes('nhentaiclub.shop')) {
                        pages.push(`https://nhentai-club-proxy.feedandafk2018.workers.dev?url=${encodeURIComponent(pageUrl)}`)
                    } else {
                        pages.push(pageUrl)
                    }
                }
            }
        })

        // Fallback: construct URLs with worker proxy
        if (pages.length === 0) {
            for (let i = 1; i <= 30; i++) {
                const imageUrl = `https://i3.nhentaiclub.shop/${mangaId}/VI/${chapterId}/${i}.jpg`
                pages.push(`https://nhentai-club-proxy.feedandafk2018.workers.dev?url=${encodeURIComponent(imageUrl)}`)
            }
        }

        return pages
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
