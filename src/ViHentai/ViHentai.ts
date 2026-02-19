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
    version: '1.1.11',
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

    async getCloudflareBypassRequestAsync() {
        return App.createRequest({
            url: BASE_URL,
            method: 'GET',
            headers: {
                'referer': `${BASE_URL}/`,
                'origin': BASE_URL,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
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
            // First get manga page to find series info
            const mangaUrl = `${BASE_URL}/truyen/${mangaId}`
            const mangaResponse = await this.requestManager.schedule(this.buildRequest(mangaUrl), 1)
            const $manga = this.cheerio.load(mangaResponse.data as string)
            
            // Find series code (Code: XXXXX)
            const bodyText = $manga('body').text()
            const codeMatch = bodyText.match(/Code:\s*(\d+)/)
            const seriesCode = codeMatch?.[1]
            
            // Get chapter page
            const url = `${BASE_URL}/truyen/${mangaId}/${chapterId}`
            const response = await this.requestManager.schedule(this.buildRequest(url), 1)
            
            if (response.status !== 200) {
                this.CloudFlareError(response.status)
            }
            
            const $ = this.cheerio.load(response.data as string)
            const pages: string[] = []

            // Try to find images directly in HTML
            $('img').each((_: number, el: any) => {
                let src = $(el).attr('data-src') ?? $(el).attr('src') ?? ''
                src = src.trim()
                if (!src || src.includes('data:image')) return
                if (src.startsWith('//')) src = 'https:' + src
                if (!src.includes('shousetsu.dev')) return
                if (!pages.includes(src)) pages.push(src)
            })

            // If no images found but we have seriesCode, try to construct URLs
            // Try using seriesCode with chapterId
            if (pages.length === 0 && seriesCode) {
                // Try multiple possible patterns
                const patterns = [
                    `https://img.shousetsu.dev/images/data/${seriesCode}/${chapterId}/`,
                    `https://img.shousetsu.dev/images/data/${seriesCode}/${chapterId.replace(/-/g, '')}/`,
                ]
                
                for (const baseUrl of patterns) {
                    for (let i = 1; i <= 30; i++) {
                        pages.push(`${baseUrl}${i}.jpg`)
                    }
                }
            }

            return App.createChapterDetails({
                id: chapterId,
                mangaId,
                pages: pages.length > 0 ? pages : [
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/1.jpg',
                ],
            })
        } catch (error) {
            return App.createChapterDetails({
                id: chapterId,
                mangaId,
                pages: [
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/1.jpg',
                ],
            })
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
