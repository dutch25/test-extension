import {
    BadgeColor,
    Chapter,
    ChapterDetails,
    ContentRating,
    HomeSection,
    HomeSectionType,
    PagedResults,
    SearchRequest,
    Source,
    SourceInfo,
    SourceIntents,
    SourceManga,
    TagSection,
} from '@paperback/types'

import { CheerioAPI } from 'cheerio'
import { Parser } from './ViHentaiParser'

const BASE_URL = 'https://vi-hentai.pro'

export const ViHentaiInfo: SourceInfo = {
    version: '1.1.22',
    name: 'Vi-Hentai',
    icon: 'icon.png',
    author: 'Dutch25',
    authorWebsite: 'https://github.com/Dutch25',
    description: 'Extension for vi-hentai.pro',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: BASE_URL,
    sourceTags: [
        { text: 'Adult', type: BadgeColor.RED },
        { text: '18+', type: BadgeColor.YELLOW },
    ],
    intents:
        SourceIntents.MANGA_CHAPTERS |
        SourceIntents.HOMEPAGE_SECTIONS |
        SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
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
                    'referer': `${BASE_URL}/`,
                    'user-agent': await this.requestManager.getDefaultUserAgent(),
                }
                return request
            },
            interceptResponse: async (response) => {
                return response
            }
        }
    })

    private buildRequest(url: string) {
        return App.createRequest({
            url,
            method: 'GET',
        })
    }

    async getCloudflareBypassRequestAsync(): Promise<any> {
        return this.buildRequest(BASE_URL)
    }

    private slugFromUrl(url: string): string {
        return url.replace(/\/$/, '').split('/').pop() ?? url
    }

    private async DOMHTML(url: string): Promise<CheerioAPI> {
        const response = await this.requestManager.schedule(this.buildRequest(url), 1)
        this.CloudFlareError(response.status)
        return this.cheerio.load(response.data as string)
    }

    CloudFlareError(status: number): void {
        if (status === 503 || status === 403) {
            throw new Error(
                `CLOUDFLARE BYPASS ERROR:\nPlease go to the home page of Vi-Hentai source and press the cloud icon.`
            )
        }
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const $ = await this.DOMHTML(`${BASE_URL}/truyen/${mangaId}`)
        return this.parser.parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const mangaUrl = `${BASE_URL}/truyen/${mangaId}`
        const mangaRes = await this.requestManager.schedule(this.buildRequest(mangaUrl), 1)
        this.CloudFlareError(mangaRes.status)
        const $manga = this.cheerio.load(mangaRes.data as string)

        const firstHref = $manga(`a[href*="/truyen/${mangaId}/"]`).first().attr('href') ?? ''

        if (!firstHref) return []

        const readerUrl = firstHref.startsWith('http')
            ? firstHref
            : `${BASE_URL}${firstHref}`

        const readerRes = await this.requestManager.schedule(this.buildRequest(readerUrl), 1)
        this.CloudFlareError(readerRes.status)
        const $ = this.cheerio.load(readerRes.data as string)

        const options: Array<{ id: string; name: string }> = []

        $('#chapter-selector option').each((_: number, el: any) => {
            const value = $(el).attr('value') ?? ''
            const name = $(el).text().trim()
            const chapterId = this.slugFromUrl(value)

            if (chapterId && chapterId !== mangaId) {
                options.push({ id: chapterId, name })
            }
        })

        options.reverse()

        return options.map((opt, i) => {
            const numMatch = opt.name.match(/([\d.]+)/) ?? opt.id.match(/([\d.]+)/)
            const chapNum = numMatch ? parseFloat(numMatch[1]) : (i + 1)

            return App.createChapter({
                id: opt.id,
                name: opt.name,
                chapNum,
                time: new Date(),
            })
        })
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        try {
            const url = `${BASE_URL}/truyen/${mangaId}/${chapterId}`
            const response = await this.requestManager.schedule(this.buildRequest(url), 1)
            
            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status}`)
            }
            
            const html = response.data as string
            
            // Try Cheerio first
            const $ = this.cheerio.load(html)
            const pages: string[] = []

            $('img.lazy-image').each((_: number, el: any) => {
                let src = $(el).attr('data-src') ?? $(el).attr('src') ?? ''
                src = src.trim()
                if (!src) return
                if (src.startsWith('//')) src = 'https:' + src
                if (src.includes('shousetsu.dev') && !pages.includes(src)) {
                    pages.push(src)
                }
            })

            if (pages.length >= 3) {
                return App.createChapterDetails({ id: chapterId, mangaId, pages })
            }

            // Try to extract chapter_id from script if no images found
            const chapterIdMatch = html.match(/chapter_id\s*=\s*['"]([a-f0-9-]+)['"]/i)
            const extractedChapterId = chapterIdMatch?.[1]
            
            // Get series_id from manga page
            const mangaUrl = `${BASE_URL}/truyen/${mangaId}`
            const mangaRes = await this.requestManager.schedule(this.buildRequest(mangaUrl), 1)
            const mangaHtml = mangaRes.data as string
            const seriesIdMatch = mangaHtml.match(/series_id\s*=\s*['"]([a-f0-9-]+)['"]/i)
            const seriesId = seriesIdMatch?.[1]

            if (extractedChapterId && seriesId) {
                const constructedPages: string[] = []
                for (let i = 1; i <= 50; i++) {
                    constructedPages.push(`https://img.shousetsu.dev/images/data/${seriesId}/${extractedChapterId}/${i}.jpg`)
                }
                return App.createChapterDetails({ id: chapterId, mangaId, pages: constructedPages })
            }

            throw new Error(`No images found. Cheerio: ${pages.length}, chapterId: ${extractedChapterId}, seriesId: ${seriesId}`)
            
        } catch (error: any) {
            throw new Error(`Chapter parse failed: ${error.message}`)
        }
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            { id: 'latest', title: 'Mới Cập Nhật', url: `${BASE_URL}/` },
            { id: 'popular', title: 'Phổ Biến Nhất', url: `${BASE_URL}/?sort=-views` },
            { id: 'new', title: 'Truyện Mới', url: `${BASE_URL}/?sort=-created_at` },
        ]

        for (const section of sections) {
            sectionCallback(App.createHomeSection({
                id: section.id,
                title: section.title,
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal,
            }))

            const response = await this.requestManager.schedule(this.buildRequest(section.url), 1)
            const $ = this.cheerio.load(response.data as string)
            const items = this.parser.parseSearchResults($)

            sectionCallback(App.createHomeSection({
                id: section.id,
                title: section.title,
                containsMoreItems: true,
                type: HomeSectionType.singleRowNormal,
                items,
            }))
        }
    }

    async getSearchResults(
        query: SearchRequest,
        metadata: { page?: number } | undefined
    ): Promise<PagedResults> {
        const page = metadata?.page ?? 1

        const tags = query.includedTags?.map(tag => tag.id) ?? []
        const genreTag = tags.find(t => t.startsWith('genre.'))
        
        let url: string
        if (genreTag) {
            const slug = genreTag.replace('genre.', '')
            url = `${BASE_URL}/the-loai/${slug}?page=${page}`
        } else {
            const search = encodeURIComponent(query.title ?? '')
            url = `${BASE_URL}/danh-sach?page=${page}&keyword=${search}`
        }

        const response = await this.requestManager.schedule(this.buildRequest(url), 1)
        const $ = this.cheerio.load(response.data as string)

        const items = this.parser.parseSearchResults($)
        const hasNextPage = $('a[rel="next"], .page-next').length > 0

        return App.createPagedResults({
            results: items,
            metadata: hasNextPage ? { page: page + 1 } : undefined,
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        return this.parser.getStaticTags()
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let url: string

        switch (homepageSectionId) {
            case 'latest':
            case 'popular':
                url = `${BASE_URL}/the-loai/all?sort=${homepageSectionId === 'popular' ? 'views' : 'created_at'}&page=${page}`
                break
            case 'new':
                url = `${BASE_URL}/?page=${page}`
                break
            default:
                throw new Error(`Unknown section: ${homepageSectionId}`)
        }

        const response = await this.requestManager.schedule(this.buildRequest(url), 1)
        const $ = this.cheerio.load(response.data as string)

        const items = this.parser.parseSearchResults($)
        const hasNextPage = $('a[rel="next"], .page-next').length > 0

        return App.createPagedResults({
            results: items,
            metadata: hasNextPage ? { page: page + 1 } : undefined,
        })
    }

    getMangaShareUrl(mangaId: string): string {
        return `${BASE_URL}/truyen/${mangaId}`
    }
}
