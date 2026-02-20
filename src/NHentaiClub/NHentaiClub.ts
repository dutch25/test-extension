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

export const NHentaiClubInfo: SourceInfo = {
    version: '1.0.5',
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
        const $ = this.cheerio.load(response.data as string)

        const manga = this.parser.parseHomePage($)

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
        const request = App.createRequest({
            url: `${BASE_URL}/g/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 0)
        const $ = this.cheerio.load(response.data as string)

        return this.parser.parseChapters($, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${BASE_URL}/read/${mangaId}/${chapterId}?lang=VI`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 0)
        const $ = this.cheerio.load(response.data as string)

        const pages = this.parser.parseChapterPages($, mangaId, chapterId)

        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        })
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
