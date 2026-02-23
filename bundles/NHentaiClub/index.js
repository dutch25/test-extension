(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeColor = void 0;
var BadgeColor;
(function (BadgeColor) {
    BadgeColor["BLUE"] = "default";
    BadgeColor["GREEN"] = "success";
    BadgeColor["GREY"] = "info";
    BadgeColor["YELLOW"] = "warning";
    BadgeColor["RED"] = "danger";
})(BadgeColor = exports.BadgeColor || (exports.BadgeColor = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],5:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
/**
* @deprecated Use {@link PaperbackExtensionBase}
*/
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * @deprecated use {@link Source.getSearchResults getSearchResults} instead
     */
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    /**
     * @deprecated use {@link Source.getSearchTags} instead
     */
    async getTags() {
        // @ts-ignore
        return this.getSearchTags?.();
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    let time;
    let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    }
    else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    }
    else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    }
    else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    }
    else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = exports.SourceIntents = void 0;
var SourceIntents;
(function (SourceIntents) {
    SourceIntents[SourceIntents["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
    SourceIntents[SourceIntents["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
    SourceIntents[SourceIntents["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
    SourceIntents[SourceIntents["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
    SourceIntents[SourceIntents["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
    SourceIntents[SourceIntents["SETTINGS_UI"] = 32] = "SETTINGS_UI";
})(SourceIntents = exports.SourceIntents || (exports.SourceIntents = {}));
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],7:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./ByteArray"), exports);
__exportStar(require("./Badge"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./HomeSectionType"), exports);
__exportStar(require("./PaperbackExtensionBase"), exports);

},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./PaperbackExtensionBase":4,"./Source":5,"./SourceInfo":6,"./interfaces":15}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./ChapterProviding"), exports);
__exportStar(require("./CloudflareBypassRequestProviding"), exports);
__exportStar(require("./HomePageSectionsProviding"), exports);
__exportStar(require("./MangaProgressProviding"), exports);
__exportStar(require("./MangaProviding"), exports);
__exportStar(require("./RequestManagerProviding"), exports);
__exportStar(require("./SearchResultsProviding"), exports);

},{"./ChapterProviding":8,"./CloudflareBypassRequestProviding":9,"./HomePageSectionsProviding":10,"./MangaProgressProviding":11,"./MangaProviding":12,"./RequestManagerProviding":13,"./SearchResultsProviding":14}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],60:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./DynamicUI/Exports/DUIBinding"), exports);
__exportStar(require("./DynamicUI/Exports/DUIForm"), exports);
__exportStar(require("./DynamicUI/Exports/DUIFormRow"), exports);
__exportStar(require("./DynamicUI/Exports/DUISection"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIHeader"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILink"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIMultilineLabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUINavigationButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIOAuthButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISecureInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISelect"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIStepper"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISwitch"), exports);
__exportStar(require("./Exports/ChapterDetails"), exports);
__exportStar(require("./Exports/Chapter"), exports);
__exportStar(require("./Exports/Cookie"), exports);
__exportStar(require("./Exports/HomeSection"), exports);
__exportStar(require("./Exports/IconText"), exports);
__exportStar(require("./Exports/MangaInfo"), exports);
__exportStar(require("./Exports/MangaProgress"), exports);
__exportStar(require("./Exports/PartialSourceManga"), exports);
__exportStar(require("./Exports/MangaUpdates"), exports);
__exportStar(require("./Exports/PBCanvas"), exports);
__exportStar(require("./Exports/PBImage"), exports);
__exportStar(require("./Exports/PagedResults"), exports);
__exportStar(require("./Exports/RawData"), exports);
__exportStar(require("./Exports/Request"), exports);
__exportStar(require("./Exports/SourceInterceptor"), exports);
__exportStar(require("./Exports/RequestManager"), exports);
__exportStar(require("./Exports/Response"), exports);
__exportStar(require("./Exports/SearchField"), exports);
__exportStar(require("./Exports/SearchRequest"), exports);
__exportStar(require("./Exports/SourceCookieStore"), exports);
__exportStar(require("./Exports/SourceManga"), exports);
__exportStar(require("./Exports/SecureStateManager"), exports);
__exportStar(require("./Exports/SourceStateManager"), exports);
__exportStar(require("./Exports/Tag"), exports);
__exportStar(require("./Exports/TagSection"), exports);
__exportStar(require("./Exports/TrackedMangaChapterReadAction"), exports);
__exportStar(require("./Exports/TrackerActionQueue"), exports);

},{"./DynamicUI/Exports/DUIBinding":17,"./DynamicUI/Exports/DUIForm":18,"./DynamicUI/Exports/DUIFormRow":19,"./DynamicUI/Exports/DUISection":20,"./DynamicUI/Rows/Exports/DUIButton":21,"./DynamicUI/Rows/Exports/DUIHeader":22,"./DynamicUI/Rows/Exports/DUIInputField":23,"./DynamicUI/Rows/Exports/DUILabel":24,"./DynamicUI/Rows/Exports/DUILink":25,"./DynamicUI/Rows/Exports/DUIMultilineLabel":26,"./DynamicUI/Rows/Exports/DUINavigationButton":27,"./DynamicUI/Rows/Exports/DUIOAuthButton":28,"./DynamicUI/Rows/Exports/DUISecureInputField":29,"./DynamicUI/Rows/Exports/DUISelect":30,"./DynamicUI/Rows/Exports/DUIStepper":31,"./DynamicUI/Rows/Exports/DUISwitch":32,"./Exports/Chapter":33,"./Exports/ChapterDetails":34,"./Exports/Cookie":35,"./Exports/HomeSection":36,"./Exports/IconText":37,"./Exports/MangaInfo":38,"./Exports/MangaProgress":39,"./Exports/MangaUpdates":40,"./Exports/PBCanvas":41,"./Exports/PBImage":42,"./Exports/PagedResults":43,"./Exports/PartialSourceManga":44,"./Exports/RawData":45,"./Exports/Request":46,"./Exports/RequestManager":47,"./Exports/Response":48,"./Exports/SearchField":49,"./Exports/SearchRequest":50,"./Exports/SecureStateManager":51,"./Exports/SourceCookieStore":52,"./Exports/SourceInterceptor":53,"./Exports/SourceManga":54,"./Exports/SourceStateManager":55,"./Exports/Tag":56,"./Exports/TagSection":57,"./Exports/TrackedMangaChapterReadAction":58,"./Exports/TrackerActionQueue":59}],61:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./generated/_exports"), exports);
__exportStar(require("./base/index"), exports);
__exportStar(require("./compat/DyamicUI"), exports);

},{"./base/index":7,"./compat/DyamicUI":16,"./generated/_exports":60}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NHentaiClub = exports.NHentaiClubInfo = void 0;
const types_1 = require("@paperback/types");
const NHentaiClubParser_1 = require("./NHentaiClubParser");
const BASE_URL = 'https://nhentaiclub.space';
const PROXY_URL = 'https://nhentai-club-proxy.feedandafk2018.workers.dev';
exports.NHentaiClubInfo = {
    version: '1.1.55',
    name: 'NHentaiClub',
    icon: 'icon.png',
    author: 'Dutch25',
    authorWebsite: 'https://github.com/Dutch25',
    description: 'Extension for nhentaiclub.space',
    contentRating: types_1.ContentRating.ADULT,
    websiteBaseURL: BASE_URL,
    sourceTags: [
        { text: 'Adult', type: types_1.BadgeColor.RED },
        { text: '18+', type: types_1.BadgeColor.YELLOW },
    ],
    intents: types_1.SourceIntents.MANGA_CHAPTERS |
        types_1.SourceIntents.HOMEPAGE_SECTIONS |
        types_1.SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
};
class NHentaiClub extends types_1.Source {
    constructor() {
        super(...arguments);
        this.parser = new NHentaiClubParser_1.Parser();
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 30000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        'referer': BASE_URL,
                        'user-agent': await this.requestManager.getDefaultUserAgent(),
                    };
                    return request;
                },
                interceptResponse: async (response) => response,
            }
        });
    }
    async getCloudflareBypassRequestAsync() {
        return App.createRequest({ url: BASE_URL, method: 'GET' });
    }
    async getHomePageSections(sectionCallback) {
        // Announce sections first so UI shows them immediately
        const sections = [
            { id: 'latest', title: 'Mới Cập Nhật', url: `${BASE_URL}/` },
            { id: 'all-time', title: 'Xếp Hạng Tất Cả', url: `${BASE_URL}/ranking/all-time` },
            { id: 'day', title: 'Xếp Hạng Ngày', url: `${BASE_URL}/ranking/day` },
            { id: 'week', title: 'Xếp Hạng Tuần', url: `${BASE_URL}/ranking/week` },
            { id: 'month', title: 'Xếp Hạng Tháng', url: `${BASE_URL}/ranking/month` },
        ];
        for (const section of sections) {
            sectionCallback(App.createHomeSection({
                id: section.id,
                title: section.title,
                containsMoreItems: true,
                type: types_1.HomeSectionType.singleRowNormal,
            }));
        }
        // Fetch each section and populate
        for (const section of sections) {
            try {
                const response = await this.requestManager.schedule(App.createRequest({ url: section.url, method: 'GET' }), 0);
                if (response.status === 403 || response.status === 503)
                    continue;
                const $ = this.cheerio.load(response.data);
                const manga = this.parser.parseHomePage($, PROXY_URL);
                sectionCallback(App.createHomeSection({
                    id: section.id,
                    title: section.title,
                    containsMoreItems: true,
                    type: types_1.HomeSectionType.singleRowNormal,
                    items: manga,
                }));
            }
            catch (e) {
                // Skip failed sections silently
            }
        }
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        const urlMap = {
            'latest': `${BASE_URL}/?page=${page}`,
            'all-time': `${BASE_URL}/ranking/all-time?page=${page}`,
            'day': `${BASE_URL}/ranking/day?page=${page}`,
            'week': `${BASE_URL}/ranking/week?page=${page}`,
            'month': `${BASE_URL}/ranking/month?page=${page}`,
        };
        // Genre sections use /genre/{id}
        const url = urlMap[homepageSectionId]
            ?? `${BASE_URL}/genre/${homepageSectionId}?page=${page}`;
        const response = await this.requestManager.schedule(App.createRequest({ url, method: 'GET' }), 0);
        const $ = this.cheerio.load(response.data);
        const manga = this.parser.parseHomePage($, PROXY_URL);
        return App.createPagedResults({ results: manga, metadata: { page: page + 1 } });
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        // If a genre or author tag is selected, browse that page
        const selectedTag = query.includedTags?.[0];
        let url;
        if (selectedTag) {
            if (selectedTag.id.startsWith('author:')) {
                const authorId = selectedTag.id.replace('author:', '').replace(/ /g, '+');
                url = `${BASE_URL}/author/${authorId}?page=${page}`;
            }
            else {
                url = `${BASE_URL}/genre/${selectedTag.id}?page=${page}`;
            }
        }
        else {
            const searchQuery = encodeURIComponent(query.title ?? '');
            url = `${BASE_URL}/search?keyword=${searchQuery}&page=${page}`;
        }
        const response = await this.requestManager.schedule(App.createRequest({ url, method: 'GET' }), 0);
        const $ = this.cheerio.load(response.data);
        return App.createPagedResults({ results: this.parser.parseHomePage($, PROXY_URL), metadata: { page: page + 1 } });
    }
    async getMangaDetails(mangaId) {
        const response = await this.requestManager.schedule(App.createRequest({ url: `${BASE_URL}/g/${mangaId}`, method: 'GET' }), 0);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseMangaDetails($, mangaId, PROXY_URL);
    }
    async getChapters(mangaId) {
        const response = await this.requestManager.schedule(App.createRequest({ url: `${BASE_URL}/g/${mangaId}`, method: 'GET' }), 0);
        return this.parser.parseChapters(response.data);
    }
    async getChapterDetails(mangaId, chapterId) {
        const response = await this.requestManager.schedule(App.createRequest({ url: `${BASE_URL}/g/${mangaId}`, method: 'GET' }), 1);
        const html = response.data;
        const $ = this.cheerio.load(html);
        const cdnBase = this.parser.getCdnBase($);
        const pageCount = this.parser.getPageCount(html, chapterId);
        if (!pageCount) {
            throw new Error(`Page count 0 for chapter ${chapterId} in manga ${mangaId}`);
        }
        const pages = [];
        for (let i = 1; i <= pageCount; i++) {
            const imgUrl = `${cdnBase}/${mangaId}/VI/${chapterId}/${i}.jpg`;
            pages.push(`${PROXY_URL}?url=${encodeURIComponent(imgUrl)}`);
        }
        return App.createChapterDetails({ id: chapterId, mangaId, pages });
    }
    getMangaShareUrl(mangaId) {
        return `${BASE_URL}/g/${mangaId}`;
    }
    async getSearchTags() {
        return this.parser.getSearchTags();
    }
}
exports.NHentaiClub = NHentaiClub;

},{"./NHentaiClubParser":63,"@paperback/types":61}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    // ─── Home Page ─────────────────────────────────────────────────────────────
    parseHomePage($, proxyUrl) {
        const results = [];
        $('a[href^="/g/"]').each((_, el) => {
            const href = $(el).attr('href') ?? '';
            const id = href.replace('/g/', '').replace(/\/$/, '');
            if (!id || isNaN(Number(id)))
                return;
            const img = $(el).find('img').first();
            const title = img.attr('alt')?.trim() ?? '';
            const rawImage = img.attr('src') ?? img.attr('data-src') ?? '';
            if (!title || title.length < 2 || !rawImage)
                return;
            const image = `${proxyUrl}?url=${encodeURIComponent(rawImage)}`;
            results.push(App.createPartialSourceManga({ mangaId: id, title, image }));
        });
        return this.deduplicate(results);
    }
    // ─── Manga Details ─────────────────────────────────────────────────────────
    parseMangaDetails($, mangaId, proxyUrl) {
        const title = $('meta[property="og:title"]').attr('content')?.trim()
            || $('h1').first().text().trim()
            || mangaId;
        const rawImage = $('meta[property="og:image"]').attr('content')?.trim() ?? '';
        const image = rawImage ? `${proxyUrl}?url=${encodeURIComponent(rawImage)}` : '';
        const desc = $('meta[property="og:description"]').attr('content')?.trim() ?? '';
        const authorLink = $('a[href^="/author/"]').first();
        const author = authorLink.text().trim() ?? '';
        const authorHref = authorLink.attr('href') ?? '';
        const authorId = authorHref.replace('/author/', '').replace(/\?.*/, '').replace(/\+/g, ' ').trim() ?? author;
        const statusText = $('a[href*="status="]').first().text().trim().toLowerCase() ?? '';
        const status = statusText.includes('hoàn thành') || statusText.includes('completed') ? 'Completed' : 'Ongoing';
        const genres = [];
        $('.flex.flex-wrap.gap-2 a[href^="/genre/"]').each((_, el) => {
            const href = $(el).attr('href') ?? '';
            const genreId = href.replace('/genre/', '').trim();
            const label = $(el).find('button').text().trim();
            if (genreId && label) {
                genres.push(App.createTag({ id: genreId, label }));
            }
        });
        const tagSections = [];
        if (author) {
            tagSections.push(App.createTagSection({ id: 'author', label: 'Tác Giả', tags: [App.createTag({ id: 'author:' + authorId, label: author })] }));
        }
        if (genres.length > 0) {
            tagSections.push(App.createTagSection({ id: 'genre', label: 'Thể Loại', tags: genres }));
        }
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({ titles: [title], image, desc, author, artist: author, status, tags: tagSections }),
        });
    }
    // ─── CDN base from og:image ────────────────────────────────────────────────
    // e.g. og:image = https://i3.nhentaiclub.shop/7054059/thumbnail.jpg
    //      returns   https://i3.nhentaiclub.shop
    getCdnBase($) {
        const ogImage = $('meta[property="og:image"]').attr('content')?.trim() ?? '';
        if (!ogImage)
            return 'https://i1.nhentaiclub.shop';
        try {
            return new URL(ogImage).origin;
        }
        catch {
            return 'https://i1.nhentaiclub.shop';
        }
    }
    // ─── Chapters ─────────────────────────────────────────────────────────────
    // Takes RAW HTML STRING — chapter list is JS-rendered.
    // Data lives in embedded Next.js JSON with escaped quotes:
    // \"data\":[{\"name\":\"2\",\"pictures\":25,\"createdAt\":\"2026-01-01\"},...]
    parseChapters(html) {
        const chapterData = this.extractDataArray(html);
        if (!chapterData || chapterData.length === 0)
            return [];
        chapterData.reverse(); // newest-first → oldest-first
        return chapterData.map((ch, i) => {
            const name = String(ch.name);
            const chapNum = parseFloat(name) || (i + 1);
            const date = ch.createdAt ? new Date(ch.createdAt) : new Date();
            return App.createChapter({
                id: name, chapNum,
                name: `Chapter ${name}`,
                time: isNaN(date.getTime()) ? new Date() : date,
            });
        });
    }
    // ─── Page count ───────────────────────────────────────────────────────────
    getPageCount(html, chapterId) {
        const chapterData = this.extractDataArray(html);
        if (!chapterData)
            return 0;
        return chapterData.find(ch => String(ch.name) === chapterId)?.pictures ?? 0;
    }
    // ─── Search Tags ──────────────────────────────────────────────────────────
    getSearchTags() {
        const genres = [
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
        ];
        const tags = genres.map(([id, label]) => App.createTag({ id, label }));
        return [App.createTagSection({ id: 'genre', label: 'Thể Loại', tags })];
    }
    // ─── Extract chapter JSON array from raw HTML ─────────────────────────────
    // Inside Next.js script tags quotes are escaped as \"
    // Actual bytes: \"data\":[{\"name\":\"2\",\"pictures\":33}]
    extractDataArray(html) {
        const escapedKey = '\\"data\\":[';
        const unescapedKey = '"data":[';
        let arrStart = -1;
        const escapedIdx = html.indexOf(escapedKey);
        const unescapedIdx = html.indexOf(unescapedKey);
        if (escapedIdx >= 0) {
            arrStart = escapedIdx + escapedKey.length - 1;
        }
        else if (unescapedIdx >= 0) {
            arrStart = unescapedIdx + unescapedKey.length - 1;
        }
        if (arrStart < 0)
            return null;
        let depth = 0, arrEnd = -1;
        for (let i = arrStart; i < html.length; i++) {
            if (html[i] === '[')
                depth++;
            if (html[i] === ']') {
                depth--;
                if (depth === 0) {
                    arrEnd = i;
                    break;
                }
            }
        }
        if (arrEnd < 0)
            return null;
        let raw = html.substring(arrStart, arrEnd + 1);
        if (escapedIdx >= 0)
            raw = raw.replace(/\\"/g, '"');
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : null;
        }
        catch {
            return null;
        }
    }
    // ─── Helpers ─────────────────────────────────────────────────────────────
    deduplicate(items) {
        const seen = new Set();
        return items.filter(item => {
            if (seen.has(item.mangaId))
                return false;
            seen.add(item.mangaId);
            return true;
        });
    }
}
exports.Parser = Parser;

},{}]},{},[62])(62)
});
