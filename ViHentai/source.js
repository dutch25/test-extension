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
exports.ViHentai = exports.ViHentaiInfo = void 0;
const types_1 = require("@paperback/types");
const ViHentaiParser_1 = require("./ViHentaiParser");
const BASE_URL = 'https://vi-hentai.pro';
exports.ViHentaiInfo = {
    version: '1.1.15',
    name: 'Vi-Hentai',
    icon: 'icon.png',
    author: 'Dutch25',
    authorWebsite: 'https://github.com/Dutch25',
    description: 'Extension for vi-hentai.pro',
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
class ViHentai extends types_1.Source {
    constructor() {
        super(...arguments);
        this.parser = new ViHentaiParser_1.Parser();
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 30000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        'referer': `${BASE_URL}/`,
                        'user-agent': await this.requestManager.getDefaultUserAgent(),
                    };
                    return request;
                },
                interceptResponse: async (response) => {
                    return response;
                }
            }
        });
    }
    buildRequest(url) {
        return App.createRequest({
            url,
            method: 'GET',
        });
    }
    async getCloudflareBypassRequestAsync() {
        return this.buildRequest(BASE_URL);
    }
    slugFromUrl(url) {
        return url.replace(/\/$/, '').split('/').pop() ?? url;
    }
    async DOMHTML(url) {
        const response = await this.requestManager.schedule(this.buildRequest(url), 1);
        this.CloudFlareError(response.status);
        return this.cheerio.load(response.data);
    }
    CloudFlareError(status) {
        if (status === 503 || status === 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the home page of Vi-Hentai source and press the cloud icon.`);
        }
    }
    async getMangaDetails(mangaId) {
        const $ = await this.DOMHTML(`${BASE_URL}/truyen/${mangaId}`);
        return this.parser.parseMangaDetails($, mangaId);
    }
    async getChapters(mangaId) {
        const mangaUrl = `${BASE_URL}/truyen/${mangaId}`;
        const mangaRes = await this.requestManager.schedule(this.buildRequest(mangaUrl), 1);
        this.CloudFlareError(mangaRes.status);
        const $manga = this.cheerio.load(mangaRes.data);
        const firstHref = $manga(`a[href*="/truyen/${mangaId}/"]`).first().attr('href') ?? '';
        if (!firstHref)
            return [];
        const readerUrl = firstHref.startsWith('http')
            ? firstHref
            : `${BASE_URL}${firstHref}`;
        const readerRes = await this.requestManager.schedule(this.buildRequest(readerUrl), 1);
        this.CloudFlareError(readerRes.status);
        const $ = this.cheerio.load(readerRes.data);
        const options = [];
        $('#chapter-selector option').each((_, el) => {
            const value = $(el).attr('value') ?? '';
            const name = $(el).text().trim();
            const chapterId = this.slugFromUrl(value);
            if (chapterId && chapterId !== mangaId) {
                options.push({ id: chapterId, name });
            }
        });
        options.reverse();
        return options.map((opt, i) => {
            const numMatch = opt.name.match(/([\d.]+)/) ?? opt.id.match(/([\d.]+)/);
            const chapNum = numMatch ? parseFloat(numMatch[1]) : (i + 1);
            return App.createChapter({
                id: opt.id,
                name: opt.name,
                chapNum,
                time: new Date(),
            });
        });
    }
    async getChapterDetails(mangaId, chapterId) {
        try {
            const url = `${BASE_URL}/truyen/${mangaId}/${chapterId}`;
            const response = await this.requestManager.schedule(this.buildRequest(url), 1);
            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status}`);
            }
            const html = response.data;
            const $ = this.cheerio.load(html);
            const pages = [];
            // Try multiple selectors
            const selectors = [
                'img.lazy-image',
                'img[src*="shousetsu"]',
                'img[data-src*="shousetsu"]',
                'div.image-container img',
                'img'
            ];
            for (const selector of selectors) {
                $(selector).each((_, el) => {
                    const src = $(el).attr('src') ?? $(el).attr('data-src') ?? '';
                    if (src.includes('shousetsu.dev') && !src.includes('data:image')) {
                        const cleanSrc = src.startsWith('//') ? 'https:' + src : src.trim();
                        if (!pages.includes(cleanSrc))
                            pages.push(cleanSrc);
                    }
                });
                if (pages.length >= 3)
                    break;
            }
            // Check page content length to see if we got real HTML or blocked
            const pageLength = html.length;
            const hasImageContainer = html.includes('image-container');
            const hasLazyImage = html.includes('lazy-image');
            // If pages found, return them
            if (pages.length >= 3) {
                return App.createChapterDetails({ id: chapterId, mangaId, pages });
            }
            // Otherwise return test images
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
            });
        }
        catch (error) {
            return App.createChapterDetails({
                id: chapterId,
                mangaId,
                pages: [
                    'https://img.shousetsu.dev/images/data/3761d3c1-9696-48ed-832d-46f4b64d9fc4/0a5202db-69e4-4da5-a1fb-9f2a1ee9ebbf/1.jpg',
                ],
            });
        }
    }
    async getHomePageSections(sectionCallback) {
        const sections = [
            { id: 'latest', title: 'Mới Cập Nhật', url: `${BASE_URL}/` },
            { id: 'popular', title: 'Phổ Biến Nhất', url: `${BASE_URL}/?sort=-views` },
            { id: 'new', title: 'Truyện Mới', url: `${BASE_URL}/?sort=-created_at` },
        ];
        for (const section of sections) {
            sectionCallback(App.createHomeSection({
                id: section.id,
                title: section.title,
                containsMoreItems: true,
                type: types_1.HomeSectionType.singleRowNormal,
            }));
            const response = await this.requestManager.schedule(this.buildRequest(section.url), 1);
            const $ = this.cheerio.load(response.data);
            const items = this.parser.parseSearchResults($);
            sectionCallback(App.createHomeSection({
                id: section.id,
                title: section.title,
                containsMoreItems: true,
                type: types_1.HomeSectionType.singleRowNormal,
                items,
            }));
        }
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        const tags = query.includedTags?.map(tag => tag.id) ?? [];
        const genreTag = tags.find(t => t.startsWith('genre.'));
        let url;
        if (genreTag) {
            const slug = genreTag.replace('genre.', '');
            url = `${BASE_URL}/the-loai/${slug}?page=${page}`;
        }
        else {
            const search = encodeURIComponent(query.title ?? '');
            url = `${BASE_URL}/danh-sach?page=${page}&keyword=${search}`;
        }
        const response = await this.requestManager.schedule(this.buildRequest(url), 1);
        const $ = this.cheerio.load(response.data);
        const items = this.parser.parseSearchResults($);
        const hasNextPage = $('a[rel="next"], .page-next').length > 0;
        return App.createPagedResults({
            results: items,
            metadata: hasNextPage ? { page: page + 1 } : undefined,
        });
    }
    async getSearchTags() {
        return this.parser.getStaticTags();
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        let url;
        switch (homepageSectionId) {
            case 'latest':
            case 'popular':
                url = `${BASE_URL}/the-loai/all?sort=${homepageSectionId === 'popular' ? 'views' : 'created_at'}&page=${page}`;
                break;
            case 'new':
                url = `${BASE_URL}/?page=${page}`;
                break;
            default:
                throw new Error(`Unknown section: ${homepageSectionId}`);
        }
        const response = await this.requestManager.schedule(this.buildRequest(url), 1);
        const $ = this.cheerio.load(response.data);
        const items = this.parser.parseSearchResults($);
        const hasNextPage = $('a[rel="next"], .page-next').length > 0;
        return App.createPagedResults({
            results: items,
            metadata: hasNextPage ? { page: page + 1 } : undefined,
        });
    }
    getMangaShareUrl(mangaId) {
        return `${BASE_URL}/truyen/${mangaId}`;
    }
}
exports.ViHentai = ViHentai;

},{"./ViHentaiParser":63,"@paperback/types":61}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    // ─── Time helpers ─────────────────────────────────────────────────────────
    convertTime(timeStr) {
        const parsed = new Date(timeStr);
        if (!isNaN(parsed.getTime()))
            return parsed;
        // Vietnamese relative time strings
        let time;
        const n = Number((/\d*/.exec(timeStr) ?? [])[0]) || 1;
        if (timeStr.includes('giây'))
            time = new Date(Date.now() - n * 1000);
        else if (timeStr.includes('phút'))
            time = new Date(Date.now() - n * 60000);
        else if (timeStr.includes('giờ'))
            time = new Date(Date.now() - n * 3600000);
        else if (timeStr.includes('ngày'))
            time = new Date(Date.now() - n * 86400000);
        else if (timeStr.includes('tuần'))
            time = new Date(Date.now() - n * 604800000);
        else if (timeStr.includes('tháng'))
            time = new Date(Date.now() - n * 2592000000);
        else if (timeStr.includes('năm'))
            time = new Date(Date.now() - n * 31536000000);
        else {
            // Try dd/mm/yyyy
            const parts = timeStr.split('/');
            if (parts.length === 3) {
                time = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
            else {
                time = new Date();
            }
        }
        return time;
    }
    // ─── Manga Details ────────────────────────────────────────────────────────
    parseMangaDetails($, mangaId) {
        const tags = [];
        $('.bg-gray-500 a[href*="/the-loai/"]').each((_, el) => {
            const href = $(el).attr('href') ?? '';
            const label = $(el).text().trim();
            const id = 'genre.' + (href.split('/the-loai/').pop() ?? label);
            if (label)
                tags.push(App.createTag({ label, id }));
        });
        const title = $('h1.series-name, h1.manga-title, h1.title, .series-title h1').first().text().trim()
            || $('h1').first().text().trim();
        const coverEl = $('.cover-frame').first();
        let image = '';
        const style = coverEl.attr('style') ?? '';
        const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
        if (match)
            image = match[1];
        if (image.startsWith('//'))
            image = 'https:' + image;
        const author = $('.text-gray-500:contains("Tác giả")').next('a').text().trim()
            || $('a[href*="/tac-gia/"]').first().text().trim();
        const statusEl = $('.text-gray-500:contains("Tình trạng")').next('a').first();
        const status = statusEl.text().trim();
        const desc = $('.line-clamp-6, .series-description, .summary-content').first().text().trim();
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [title],
                image,
                author,
                artist: author,
                status,
                desc,
                tags: tags.length > 0
                    ? [App.createTagSection({ id: '0', label: 'Thể Loại', tags })]
                    : []
            })
        });
    }
    // ─── Chapter List ─────────────────────────────────────────────────────────
    parseChapterList($, mangaId) {
        const chapters = [];
        $('.overflow-y-auto a[href*="/truyen/"]').each((_, el) => {
            const href = $(el).attr('href') ?? '';
            const hrefParts = href.split('/truyen/').pop() ?? '';
            if (!hrefParts)
                return;
            const chapterName = $('span.text-ellipsis', el).text().trim()
                || $(el).text().trim();
            const numMatch = chapterName.match(/(\d+(?:\.\d+)?)/);
            const chapNum = numMatch ? parseFloat(numMatch[1]) : 0;
            const timeEl = $('.timeago', el);
            const timeStr = timeEl.attr('datetime') ?? timeEl.text().trim();
            const time = this.convertTime(timeStr);
            chapters.push(App.createChapter({
                id: hrefParts,
                chapNum,
                name: chapterName,
                langCode: '🇻🇳',
                time,
            }));
        });
        return chapters;
    }
    // ─── Chapter Details (images) ─────────────────────────────────────────────
    parseChapterDetails($) {
        const pages = [];
        // Try multiple selectors to find images
        const selectors = ['img.lazy-image', 'img[data-src]', 'div.image-container img', 'img[src*="shousetsu"]'];
        for (const selector of selectors) {
            $(selector).each((_, el) => {
                let src = $(el).attr('data-src') ?? $(el).attr('src') ?? '';
                src = src.trim();
                if (!src || src.includes('data:image'))
                    return;
                if (src.startsWith('//'))
                    src = 'https:' + src;
                if (src.includes('emoji') || src.includes('avatar') || src.includes('storage/images/default'))
                    return;
                if (!src.includes('shousetsu.dev'))
                    return;
                if (!pages.includes(src))
                    pages.push(src);
            });
            if (pages.length > 0)
                break;
        }
        return pages;
    }
    // ─── Search Results ───────────────────────────────────────────────────────
    parseSearchResults($) {
        const results = [];
        $('.manga-vertical').each((_, el) => {
            const mangaLink = $('a[href*="/truyen/"]', el).first();
            const href = mangaLink.attr('href') ?? '';
            const mangaId = href.split('/truyen/').pop()?.replace(/\/$/, '') ?? '';
            if (!mangaId)
                return;
            const title = $('.text-ellipsis', el).last().text().trim();
            if (!title)
                return;
            const imgEl = $('.cover', el);
            let image = '';
            const style = imgEl.attr('style') ?? '';
            const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match)
                image = match[1];
            if (image.startsWith('//'))
                image = 'https:' + image;
            const subtitleEl = $('.latest-chapter a', el).first();
            const subtitle = subtitleEl.text().trim();
            results.push(App.createPartialSourceManga({
                mangaId,
                title,
                image,
                subtitle: subtitle || undefined,
            }));
        });
        return results;
    }
    // ─── Homepage: Hot section ────────────────────────────────────────────────
    parseHotSection($) {
        return this.parseSearchResults($);
    }
    // ─── Homepage: New section ───────────────────────────────────────────────
    parseNewSection($) {
        return this.parseSearchResults($);
    }
    // ─── Static Genre Tags ────────────────────────────────────────────────────
    // Built from the site's genre list (extracted from homepage nav)
    getStaticTags() {
        const genres = [
            { id: 'genre.3d-hentai', label: '3D Hentai' },
            { id: 'genre.action', label: 'Action' },
            { id: 'genre.adult', label: 'Adult' },
            { id: 'genre.ahegao', label: 'Ahegao' },
            { id: 'genre.anal', label: 'Anal' },
            { id: 'genre.big-boobs', label: 'Big Boobs' },
            { id: 'genre.bdsm', label: 'BDSM' },
            { id: 'genre.blowjobs', label: 'BlowJobs' },
            { id: 'genre.cheating', label: 'Cheating' },
            { id: 'genre.comedy', label: 'Comedy' },
            { id: 'genre.creampie', label: 'Creampie' },
            { id: 'genre.doujinshi', label: 'Doujinshi' },
            { id: 'genre.ecchi', label: 'Ecchi' },
            { id: 'genre.elf', label: 'Elf' },
            { id: 'genre.fantasy', label: 'Fantasy' },
            { id: 'genre.femdom', label: 'Femdom' },
            { id: 'genre.full-color', label: 'Full Color' },
            { id: 'genre.futanari', label: 'Futanari' },
            { id: 'genre.gangbang', label: 'GangBang' },
            { id: 'genre.group', label: 'Group' },
            { id: 'genre.harem', label: 'Harem' },
            { id: 'genre.housewife', label: 'Housewife' },
            { id: 'genre.incest', label: 'Incest' },
            { id: 'genre.khong-che', label: 'Không che' },
            { id: 'genre.co-che', label: 'Có che' },
            { id: 'genre.lolicon', label: 'Lolicon' },
            { id: 'genre.maids', label: 'Maids' },
            { id: 'genre.manhua', label: 'Manhua' },
            { id: 'genre.manhwa', label: 'Manhwa' },
            { id: 'genre.milf', label: 'Milf' },
            { id: 'genre.mind-control', label: 'Mind Control' },
            { id: 'genre.monster', label: 'Monster' },
            { id: 'genre.nakadashi', label: 'Nakadashi' },
            { id: 'genre.ntr', label: 'NTR' },
            { id: 'genre.nurse', label: 'Nurse' },
            { id: 'genre.oral', label: 'Oral' },
            { id: 'genre.paizuri', label: 'Paizuri' },
            { id: 'genre.rape', label: 'Rape' },
            { id: 'genre.romance', label: 'Romance' },
            { id: 'genre.school-uniform', label: 'School Uniform' },
            { id: 'genre.schoolgirl', label: 'SchoolGirl' },
            { id: 'genre.series', label: 'Series' },
            { id: 'genre.shota', label: 'Shota' },
            { id: 'genre.sister', label: 'Sister' },
            { id: 'genre.stockings', label: 'Stockings' },
            { id: 'genre.tentacles', label: 'Tentacles' },
            { id: 'genre.vanilla', label: 'Vanilla' },
            { id: 'genre.virgin', label: 'Virgin' },
            { id: 'genre.webtoon', label: 'Webtoon' },
            { id: 'genre.yaoi', label: 'Yaoi' },
            { id: 'genre.yuri', label: 'Yuri' },
        ];
        return [
            App.createTagSection({
                id: '0',
                label: 'Thể Loại',
                tags: genres.map(g => App.createTag(g))
            })
        ];
    }
}
exports.Parser = Parser;

},{}]},{},[62])(62)
});
