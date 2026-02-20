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

import { Parser } from './NHentaiClubParser'

const BASE_URL = 'https://nhentaiclub.space'
const CDN_URL = 'https://i1.nhentaiclub.shop'
const PROXY_URL = 'https://nhentai-club-proxy.feedandafk2018.workers.dev'

export const NHentaiClubInfo: SourceInfo = {
    version: '1.1.36',
    name: 'NHentaiClub',
    icon: 'icon.png',
    author: 'Dutch25',
    authorWebsite: 'https://github.com/Dutch25',
    description: 'Extension for nhentaiclub.space',
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

export class NHentaiClub extends Source {
    private readonly parser = new Parser()

    requestManager = App.createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 30000,
        interceptor: {
            interceptRequest: async (request) => {
                request.headers = {
                    ...(request.headers ?? {}),
                    'referer': BASE_URL,
                    'user-agent': await this.requestManager.getDefaultUserAgent(),
                }
                return request
            },
            interceptResponse: async (response) => response,
        }
    })

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: BASE_URL + '/',
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 0)

        // Debug: log response info
        console.log('Status:', response.status)
        console.log('Data length:', response.data?.length ?? 0)

        // Check for Cloudflare block
        if (response.status === 403 || response.status === 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR: Please visit the homepage first')
        }

        const $ = this.cheerio.load(response.data as string)

        const manga = this.parser.parseHomePage($)

        // Debug: log manga count
        console.log('Manga found:', manga.length)

        sectionCallback(App.createHomeSection({
            id: 'latest',
            title: 'Mới Cập Nhật',
            containsMoreItems: true,
            type: HomeSectionType.singleRowNormal,
        }))

        sectionCallback(App.createHomeSection({
            id: 'latest',
            title: 'Mới Cập Nhật',
            containsMoreItems: true,
            type: HomeSectionType.singleRowNormal,
            items: manga,
        }))
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1

        const request = App.createRequest({
            url: `${BASE_URL}/?page=${page}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 0)
        const $ = this.cheerio.load(response.data as string)

        const manga = this.parser.parseHomePage($)

        return {
            results: manga,
            metadata: { page: page + 1 },
        }
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1
        const searchQuery = encodeURIComponent(query.title ?? '')

        const request = App.createRequest({
            url: `${BASE_URL}/search?keyword=${searchQuery}&page=${page}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 0)
        const $ = this.cheerio.load(response.data as string)

        const manga = this.parser.parseHomePage($)

        return {
            results: manga,
            metadata: { page: page + 1 },
        }
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${BASE_URL}/g/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 0)
        const $ = this.cheerio.load(response.data as string)

        return this.parser.parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const response = await this.requestManager.schedule(
            App.createRequest({ url: `${BASE_URL}/g/${mangaId}`, method: 'GET' }), 0
        )
        const html = response.data as string
        console.log('HTML length:', html.length)
        // Pass raw HTML string — chapter list is NOT in static HTML, only in embedded JSON
        const chapters = this.parser.parseChapters(html, mangaId)
        console.log('Parsed chapters:', chapters.map(c => c.id))
        return chapters
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        console.log('getChapterDetails:', mangaId, chapterId)

        const response = await this.requestManager.schedule(
            App.createRequest({ url: `${BASE_URL}/g/${mangaId}`, method: 'GET' }), 1
        )
        const html = response.data as string

        const pageCount = this.parser.getPageCount(html, chapterId)
        if (!pageCount) {
            throw new Error(`Could not find page count for chapter ${chapterId} in manga ${mangaId}`)
        }

        const pages: string[] = []
        for (let i = 1; i <= pageCount; i++) {
            const imgUrl = `${CDN_URL}/${mangaId}/VI/${chapterId}/${i}.jpg`
            pages.push(`${PROXY_URL}?url=${encodeURIComponent(imgUrl)}`)
        }

        return App.createChapterDetails({ id: chapterId, mangaId, pages })
    }

    getMangaShareUrl(mangaId: string): string {
        return `${BASE_URL}/g/${mangaId}`
    }

    async getCloudflareBypassRequestAsync(): Promise<any> {
        return App.createRequest({
            url: BASE_URL,
            method: 'GET',
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        return []
    }
}