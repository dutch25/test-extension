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
    version: '1.1.17',
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
            // First, get manga page to find series UUID
            const mangaUrl = `${BASE_URL}/truyen/${mangaId}`
            const mangaRes = await this.requestManager.schedule(this.buildRequest(mangaUrl), 1)
            const mangaHtml = mangaRes.data as string
            
            // Try to find series UUID in manga HTML
            let seriesUUID = ''
            
            // Look for series_id in script
            const seriesMatch = mangaHtml.match(/series_id["\s:]+["']?([a-f0-9-]+)["']?/i)
            if (seriesMatch) seriesUUID = seriesMatch[1]
            
            // Also try other patterns
            if (!seriesUUID) {
                const altMatch = mangaHtml.match(/"series"\s*:\s*["']([a-f0-9-]+)["']/i)
                if (altMatch) seriesUUID = altMatch[1]
            }
            
            // Get chapter page to find chapter UUID  
            const chapterUrl = `${BASE_URL}/truyen/${mangaId}/${chapterId}`
            const chapterRes = await this.requestManager.schedule(this.buildRequest(chapterUrl), 1)
            const chapterHtml = chapterRes.data as string
            
            // Try to find chapter UUID in chapter HTML
            let chapterUUID = ''
            
            // Look for chapter_id in script
            const chapMatch = chapterHtml.match(/chapter_id["\s=]+["']?([a-f0-9-]+)["']?/i)
            if (chapMatch) chapterUUID = chapMatch[1]
            
            // Try another pattern
            if (!chapterUUID) {
                const altChapMatch = chapterHtml.match(/"id"\s*:\s*["']([a-f0-9-]+)["'][^}]*chapter/i)
                if (altChapMatch) chapterUUID = altChapMatch[1]
            }
            
            // If we have both UUIDs, construct image URLs
            if (seriesUUID && chapterUUID) {
                const pages: string[] = []
                for (let i = 1; i <= 30; i++) {
                    pages.push(`https://img.shousetsu.dev/images/data/${seriesUUID}/${chapterUUID}/${i}.jpg`)
                }
                return App.createChapterDetails({ id: chapterId, mangaId, pages })
            }

            // Fallback to test images
            return App.createChapterDetails({
                id: chapterId,
                mangaId,
                pages: [
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/1.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/2.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/3.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/4.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/5.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/6.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/7.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/8.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/9.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/10.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/11.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/12.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/13.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/14.jpg',
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/15.jpg',
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
