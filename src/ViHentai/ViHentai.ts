import {
    BadgeColor,
    Chapter,
    ChapterDetails,
    ContentRating,
    HomeSection,
    HomeSectionType,
    PagedResults,
    PartialSourceManga,
    SearchRequest,
    Source,
    SourceInfo,
    SourceIntents,
    SourceManga,
    TagSection,
} from '@paperback/types'

import { CheerioAPI } from 'cheerio'
import { Parser } from './ViHentaiParser'

const DOMAIN = 'https://vi-hentai.pro'

export const isLastPage = ($: CheerioAPI): boolean => {
    const lastPage = Number($('ul.pagination > li:not(.disabled):not(.active) a').last().text().trim())
    const currentPage = Number($('ul.pagination > li.active a').text().trim())
    return currentPage >= lastPage || lastPage === 0
}

export const ViHentaiInfo: SourceInfo = {
    version: '1.0.4',
    name: 'Vi-Hentai',
    icon: 'icon.png',
    author: 'YourName',
    authorWebsite: 'https://github.com/YourName',
    description: 'Extension for vi-hentai.pro',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Adult',
            type: BadgeColor.RED
        },
        {
            text: '18+',
            type: BadgeColor.YELLOW
        }
    ],
    intents:
        SourceIntents.MANGA_CHAPTERS |
        SourceIntents.HOMEPAGE_SECTIONS |
        SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class ViHentai extends Source {
    private readonly parser = new Parser()

    requestManager = App.createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 30000,
        interceptor: {
            interceptRequest: async (request) => {
                request.headers = {
                    ...(request.headers ?? {}),
                    'referer': `${DOMAIN}/`,
                    'user-agent': await this.requestManager.getDefaultUserAgent(),
                }
                return request
            },
            interceptResponse: async (response) => {
                return response
            }
        }
    })

    // ─── Helper: fetch a URL and return a cheerio DOM ────────────────────────
    private async DOMHTML(url: string): Promise<CheerioAPI> {
        const request = App.createRequest({ url, method: 'GET' })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        return this.cheerio.load(response.data as string)
    }

    // ─── Manga Details ────────────────────────────────────────────────────────
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const $ = await this.DOMHTML(`${DOMAIN}/truyen/${mangaId}`)
        return this.parser.parseMangaDetails($, mangaId)
    }

    // ─── Chapter List ─────────────────────────────────────────────────────────
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const $ = await this.DOMHTML(`${DOMAIN}/truyen/${mangaId}`)
        return this.parser.parseChapterList($, mangaId)
    }

    // ─── Chapter Pages ────────────────────────────────────────────────────────
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        console.log('=== getChapterDetails called ===')
        console.log('mangaId:', mangaId, 'chapterId:', chapterId)
        
        try {
            // First, try to get images from HTML
            const $ = await this.DOMHTML(`${DOMAIN}/truyen/${chapterId}`)
            let pages = this.parser.parseChapterDetails($)
            console.log('Pages from HTML:', pages.length)

            // Always try API approach as fallback
            if (pages.length === 0) {
                console.log('No pages from HTML, trying API...')
                pages = await this.fetchChapterImagesFromAPI(mangaId, chapterId)
            }

            console.log('Final pages count:', pages.length)
            return App.createChapterDetails({ id: chapterId, mangaId, pages })
        } catch (error) {
            console.log('ERROR in getChapterDetails:', error)
            return App.createChapterDetails({ id: chapterId, mangaId, pages: [] })
        }
    }

    // ─── Fetch chapter images via API ─────────────────────────────────────────
    private async fetchChapterImagesFromAPI(mangaId: string, chapterPath: string): Promise<string[]> {
        console.log('=== fetchChapterImagesFromAPI called ===')
        
        // Always return test pages first to verify code runs
        const testPages = [
            'https://img.shousetsu.dev/images/data/test/test/test/0.jpg',
            'https://img.shousetsu.dev/images/data/test/test/test/1.jpg',
            'https://img.shousetsu.dev/images/data/test/test/test/2.jpg',
        ]
        
        try {
            // Fetch manga page to get seriesId from chapter list
            const mangaHtml = await this.requestManager.schedule(
                App.createRequest({ url: `${DOMAIN}/truyen/${mangaId}`, method: 'GET' }),
                1
            )
            this.CloudFlareError(mangaHtml.status)

            const $manga = this.cheerio.load(mangaHtml.data as string)
            
            // Try to find seriesId in the manga page - look for any data attributes or links
            const scriptContent = $manga('script').html() || ''
            
            // Look for series data in script tags
            let seriesId = ''
            const seriesMatch = scriptContent.match(/series_id["\s:]+["']?([a-f0-9-]+)["']?/i)
            if (seriesMatch) {
                seriesId = seriesMatch[1]
                console.log('Found seriesId:', seriesId)
            }
            
            // Try another pattern - look for code/id in data
            const codeMatch = scriptContent.match(/code["\s:]+["']?(\d+)["']?/i)
            if (codeMatch && !seriesId) {
                console.log('Found code:', codeMatch[1])
            }

            // Also try to get from chapter link data
            const chapterLink = $manga(`.overflow-y-auto a[href*="/truyen/${chapterPath.split('/')[0]}"]`).first()
            const href = chapterLink.attr('href') || ''
            console.log('Chapter href:', href)

            // Fetch chapter page to get chapter_id
            const chapterHtml = await this.requestManager.schedule(
                App.createRequest({ url: `${DOMAIN}/truyen/${chapterPath}`, method: 'GET' }),
                1
            )

            const $chapter = this.cheerio.load(chapterHtml.data as string)
            const chapScript = $chapter('script').html() || ''
            const chapterIdMatch = chapScript.match(/chapter_id\s*=\s*['"]([^'"]+)['"]/)
            const chapterId = chapterIdMatch?.[1]

            if (!chapterId) {
                console.log('Could not extract chapter_id')
                return []
            }

            // If we don't have seriesId, we can't construct image URLs
            if (!seriesId) {
                console.log('Could not extract seriesId from manga page')
                return []
            }

            console.log('Found seriesId:', seriesId, 'chapterId:', chapterId)
            
            // Construct image URLs
            const pages: string[] = []
            for (let i = 0; i < 50; i++) {
                const imgUrl = `https://img.shousetsu.dev/images/data/${seriesId}/${chapterId}/${i}.jpg`
                pages.push(imgUrl)
            }
            console.log('Returning test pages for debugging')
            return testPages

        } catch (error) {
            console.log('Error fetching chapter images:', error)
            return []
        }
    }

    // ─── Search ───────────────────────────────────────────────────────────────
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let url: string

        // Tag-based browsing (genre filter)
        const tags = query.includedTags?.map(tag => tag.id) ?? []
        const genreTag = tags.find(t => t.startsWith('genre.'))
        if (genreTag) {
            const slug = genreTag.replace('genre.', '')
            url = `${DOMAIN}/the-loai/${slug}?page=${page}`
        } else {
            const q = encodeURIComponent(query.title ?? '')
            url = `${DOMAIN}/tim-kiem?q=${q}&page=${page}`
        }

        const $ = await this.DOMHTML(url)
        const manga = this.parser.parseSearchResults($)
        const hasMore = !isLastPage($)
        return App.createPagedResults({
            results: manga,
            metadata: hasMore ? { page: page + 1 } : undefined
        })
    }

    // ─── Search Tags (Genre Browsing) ─────────────────────────────────────────
    async getSearchTags(): Promise<TagSection[]> {
        return this.parser.getStaticTags()
    }

    // ─── Homepage Sections ────────────────────────────────────────────────────
    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            App.createHomeSection({
                id: 'hot',
                title: 'TRUYỆN HOT',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
            App.createHomeSection({
                id: 'new_updated',
                title: 'MỚI CẬP NHẬT',
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal
            }),
        ]

        // Signal sections exist (empty first)
        for (const section of sections) {
            sectionCallback(section)
        }

        // Fetch homepage once for both sections
        const $ = await this.DOMHTML(`${DOMAIN}/`)

        for (const section of sections) {
            switch (section.id) {
                case 'hot':
                    section.items = this.parser.parseHotSection($)
                    break
                case 'new_updated':
                    section.items = this.parser.parseNewSection($)
                    break
            }
            sectionCallback(section)
        }
    }

    // ─── View More ────────────────────────────────────────────────────────────
    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let url: string

        switch (homepageSectionId) {
            case 'hot':
                url = `${DOMAIN}/the-loai/all?sort=views&page=${page}`
                break
            case 'new_updated':
                url = `${DOMAIN}/?page=${page}`
                break
            default:
                throw new Error(`Unknown section: ${homepageSectionId}`)
        }

        const $ = await this.DOMHTML(url)
        const manga = this.parser.parseSearchResults($)
        const hasMore = !isLastPage($)
        return App.createPagedResults({
            results: manga,
            metadata: hasMore ? { page: page + 1 } : undefined
        })
    }

    // ─── Share URL ────────────────────────────────────────────────────────────
    getMangaShareUrl(mangaId: string): string {
        return `${DOMAIN}/truyen/${mangaId}`
    }

    // ─── Cloudflare ───────────────────────────────────────────────────────────
    CloudFlareError(status: number): void {
        if (status === 503 || status === 403) {
            throw new Error(
                `CLOUDFLARE BYPASS ERROR:\nPlease go to the home page of Vi-Hentai source and press the cloud icon.`
            )
        }
    }

    async getCloudflareBypassRequestAsync() {
        return App.createRequest({
            url: DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${DOMAIN}/`,
                'origin': DOMAIN,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }
}
