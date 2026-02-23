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
    parseHomePage($: CheerioAPI, proxyUrl: string): PartialSourceManga[] {
        const results: PartialSourceManga[] = []

        $('a[href^="/g/"]').each((_: any, el: any) => {
            const href = $(el).attr('href') ?? ''
            const id = href.replace('/g/', '').replace(/\/$/, '')
            if (!id || isNaN(Number(id))) return

            const img = $(el).find('img').first()
            const title = img.attr('alt')?.trim() ?? ''
            const rawImage = img.attr('src') ?? img.attr('data-src') ?? ''

            if (!title || title.length < 2 || !rawImage) return

            const image = `${proxyUrl}?url=${encodeURIComponent(rawImage)}`
            results.push(App.createPartialSourceManga({ mangaId: id, title, image }))
        })

        return this.deduplicate(results)
    }

    // ─── Manga Details ─────────────────────────────────────────────────────────
    parseMangaDetails($: CheerioAPI, mangaId: string, proxyUrl: string): SourceManga {
        const title = $('meta[property="og:title"]').attr('content')?.trim()
            || $('h1').first().text().trim()
            || mangaId
        const rawImage = $('meta[property="og:image"]').attr('content')?.trim() ?? ''
        const image = rawImage ? `${proxyUrl}?url=${encodeURIComponent(rawImage)}` : ''
        const desc = $('meta[property="og:description"]').attr('content')?.trim() ?? ''

        const authorLink = $('a[href^="/author/"]').first()
        const author = authorLink.text().trim() ?? ''
        const authorHref = authorLink.attr('href') ?? ''
        const authorId = authorHref.replace('/author/', '').replace(/\?.*/, '').replace(/\+/g, ' ').trim() ?? author

        const statusText = $('a[href*="status="]').first().text().trim().toLowerCase() ?? ''
        const status = statusText.includes('hoàn thành') || statusText.includes('completed') ? 'Completed' : 'Ongoing'

        const genres: Tag[] = []
        $('.flex.flex-wrap.gap-2 a[href^="/genre/"]').each((_: any, el: any) => {
            const href = $(el).attr('href') ?? ''
            const genreId = href.replace('/genre/', '').trim()
            const label = $(el).find('button').text().trim()
            if (genreId && label) {
                genres.push(App.createTag({ id: genreId, label }))
            }
        })

        const tagSections: TagSection[] = []
        if (author) {
            tagSections.push(App.createTagSection({ id: 'author', label: 'A - Tác Giả', tags: [App.createTag({ id: 'author:' + authorId, label: author })] }))
        }
        if (genres.length > 0) {
            tagSections.push(App.createTagSection({ id: 'genres', label: 'Thể Loại', tags: genres }))
        }

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({ titles: [title], image, desc, author, artist: author, status, tags: tagSections }),
        })
    }

    // ─── CDN base from og:image ────────────────────────────────────────────────
    // e.g. og:image = https://i3.nhentaiclub.shop/7054059/thumbnail.jpg
    //      returns   https://i3.nhentaiclub.shop
    getCdnBase($: CheerioAPI): string {
        const ogImage = $('meta[property="og:image"]').attr('content')?.trim() ?? ''
        if (!ogImage) return 'https://i1.nhentaiclub.shop'
        try { return new URL(ogImage).origin } catch { return 'https://i1.nhentaiclub.shop' }
    }

    // ─── Chapters ─────────────────────────────────────────────────────────────
    // Takes RAW HTML STRING — chapter list is JS-rendered.
    // Data lives in embedded Next.js JSON with escaped quotes:
    // \"data\":[{\"name\":\"2\",\"pictures\":25,\"createdAt\":\"2026-01-01\"},...]
    parseChapters(html: string): Chapter[] {
        const chapterData = this.extractDataArray(html)
        if (!chapterData || chapterData.length === 0) return []

        chapterData.reverse() // newest-first → oldest-first

        return chapterData.map((ch, i) => {
            const name = String(ch.name)
            const chapNum = parseFloat(name) || (i + 1)
            const date = ch.createdAt ? new Date(ch.createdAt) : new Date()
            return App.createChapter({
                id: name, chapNum,
                name: `Chapter ${name}`,
                time: isNaN(date.getTime()) ? new Date() : date,
            })
        })
    }

    // ─── Page count ───────────────────────────────────────────────────────────
    getPageCount(html: string, chapterId: string): number {
        const chapterData = this.extractDataArray(html)
        if (!chapterData) return 0
        return chapterData.find(ch => String(ch.name) === chapterId)?.pictures ?? 0
    }

    // ─── Search Tags ──────────────────────────────────────────────────────────
    getSearchTags(): TagSection[] {
        const genres: Array<[string, string]> = [
            ['ahegao', 'Ahegao'], ['anal', 'Anal'], ['bdsm', 'BDSM'],
            ['big-ass', 'Big Ass'], ['big-boobs', 'Big Boobs'], ['big-penis', 'Big Penis'],
            ['bikini', 'Bikini'], ['black-mail', 'Blackmail'], ['blowjobs', 'Blowjobs'],
            ['body-swap', 'Body Swap'], ['breast-sucking', 'Breast Sucking'], ['bunny-girl', 'Bunny Girl'],
            ['catgirl', 'Catgirl'], ['cheating', 'Cheating'], ['chikan', 'Chikan'],
            ['collar', 'Collar'], ['condom', 'Condom'], ['cosplay', 'Cosplay'],
            ['dark-skin', 'Dark Skin'], ['daughter', 'Daughter'], ['deep-throat', 'Deepthroat'],
            ['defloration', 'Defloration'], ['demon-girl', 'Demon Girl'], ['double-penetration', 'Double Penetration'],
            ['doujinshi', 'Doujinshi'], ['drugs', 'Drugs'], ['drunk', 'Drunk'],
            ['elf', 'Elf'], ['exhibitionism', 'Exhibitionism'], ['father', 'Father'],
            ['femdom', 'Femdom'], ['fingering', 'Fingering'], ['footjob', 'Footjob'],
            ['fox-girl', 'Fox Girl'], ['full-color', 'Full Color'], ['futanari', 'Futanari'],
            ['glasses', 'Glasses'], ['group', 'Group'], ['hairy', 'Hairy'],
            ['handjob', 'Handjob'], ['harem', 'Harem'], ['humiliation', 'Humiliation'],
            ['impregnation', 'Impregnation'], ['incest', 'Incest'], ['kimono', 'Kimono'],
            ['kissing', 'Kissing'], ['lactation', 'Lactation'], ['maid', 'Maid'],
            ['manhwa', 'Manhwa'], ['masturbation', 'Masturbation'], ['milf', 'Milf'],
            ['mind-break', 'Mind Break'], ['mind-control', 'Mind Control'], ['monster', 'Monster'],
            ['monster-girl', 'Monster Girl'], ['mother', 'Mother'], ['muscle', 'Muscle'],
            ['nakadashi', 'Nakadashi'], ['netorare', 'NTR (Netorare)'], ['netori', 'Netori'],
            ['nurse', 'Nurse'], ['old-man', 'Old Man'], ['oneshot', 'Oneshot'],
            ['orc', 'Orc'], ['paizuri', 'Paizuri'], ['pantyhose', 'Pantyhose'],
            ['pregnant', 'Pregnant'], ['rape', 'Rape'], ['rimjob', 'Rimjob'],
            ['school-girl-uniform', 'Schoolgirl Uniform'], ['series', 'Series'], ['sex-toys', 'Sex Toys'],
            ['sister', 'Sister'], ['slave', 'Slave'], ['sleeping', 'Sleeping'],
            ['small-boobs', 'Small Boobs'], ['shotacon', 'Shotacon'], ['stockings', 'Stockings'],
            ['swimsuit', 'Swimsuit'], ['teacher', 'Teacher'], ['tentacles', 'Tentacles'],
            ['three-some', 'Threesome'], ['time-stop', 'Time Stop'], ['tomboy', 'Tomboy'],
            ['twins', 'Twins'], ['twintails', 'Twintails'], ['vampire', 'Vampire'],
            ['virgin', 'Virgin'], ['x-ray', 'X-ray'], ['yaoi', 'Yaoi'],
            ['yuri', 'Yuri'], ['3d', '3D'],
        ]

        const tags = genres.map(([id, label]) => App.createTag({ id, label }))
        return [App.createTagSection({ id: 'genre', label: 'Thể Loại', tags })]
    }

    // ─── Extract chapter JSON array from raw HTML ─────────────────────────────
    // Inside Next.js script tags quotes are escaped as \"
    // Actual bytes: \"data\":[{\"name\":\"2\",\"pictures\":33}]
    private extractDataArray(html: string): Array<{ name: string; pictures: number; createdAt?: string }> | null {
        const escapedKey = '\\"data\\":['
        const unescapedKey = '"data":['

        let arrStart = -1
        const escapedIdx = html.indexOf(escapedKey)
        const unescapedIdx = html.indexOf(unescapedKey)

        if (escapedIdx >= 0) {
            arrStart = escapedIdx + escapedKey.length - 1
        } else if (unescapedIdx >= 0) {
            arrStart = unescapedIdx + unescapedKey.length - 1
        }

        if (arrStart < 0) return null

        let depth = 0, arrEnd = -1
        for (let i = arrStart; i < html.length; i++) {
            if (html[i] === '[') depth++
            if (html[i] === ']') { depth--; if (depth === 0) { arrEnd = i; break } }
        }

        if (arrEnd < 0) return null

        let raw = html.substring(arrStart, arrEnd + 1)
        if (escapedIdx >= 0) raw = raw.replace(/\\"/g, '"')

        try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : null
        } catch {
            return null
        }
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