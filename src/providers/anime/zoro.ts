import { CheerioAPI, load } from 'cheerio';

import {
  AnimeParser,
  IAnimeEpisode,
  IAnimeInfo,
  IAnimeResult,
  IEpisodeServer,
  ISearch,
  ISource,
  MediaFormat,
  StreamingServers,
  SubOrSub,
} from '../../models';

import { MegaCloud, StreamSB, StreamTape, USER_AGENT } from '../../utils';

// At the top of the file, update the import statement:

// Then, somewhere in the file (preferably near other interface definitions), add:
interface IExtendedSource extends ISource {
  server?: string;
  quality?: string;
  intro?: any;
  outro?: any;
  category?: CategoryType; // Add this line
}

interface IExtendedEpisodeServer extends IEpisodeServer {
  category?: CategoryType;
}

type CategoryType = 'sub' | 'raw' | 'dub' | 'both';

class Zoro extends AnimeParser {
  override readonly name = 'Zoro';
  protected override baseUrl = 'https://hianime.to';
  protected override logo =
    'https://is3-ssl.mzstatic.com/image/thumb/Purple112/v4/7e/91/00/7e9100ee-2b62-0942-4cdc-e9b93252ce1c/source/512x512bb.jpg';
  protected override classPath = 'ANIME.Zoro';

  constructor(customBaseURL?: string) {
    super(...arguments);
    if (customBaseURL) {
      if (customBaseURL.startsWith('http://') || customBaseURL.startsWith('https://')) {
        this.baseUrl = customBaseURL;
      } else {
        this.baseUrl = `http://${customBaseURL}`;
      }
    } else {
      this.baseUrl = this.baseUrl;
    }
  }

  /**
   * @param query Search query
   * @param page Page number (optional)
   */
  override search(query: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/search?keyword=${decodeURIComponent(query)}&page=${page}`);
  }

  /**
   * @param page number
   */
  fetchTopAiring(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/top-airing?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchMostPopular(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/most-popular?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchMostFavorite(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/most-favorite?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchLatestCompleted(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/completed?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchRecentlyUpdated(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/recently-updated?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchRecentlyAdded(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/recently-added?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchTopUpcoming(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/top-upcoming?page=${page}`);
  }
  /**
   * @param studio Studio id, e.g. "toei-animation"
   * @param page page number (optional) `default 1`
   */
  fetchStudio(studio: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/producer/${studio}?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchSubbedAnime(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/subbed-anime?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchDubbedAnime(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/dubbed-anime?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchMovie(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/movie?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchTV(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/tv?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchOVA(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/ova?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchONA(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/ona?page=${page}`);
  }
  /**
   * @param page number
   */
  fetchSpecial(page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/special?page=${page}`);
  }

  async fetchGenres(): Promise<string[]> {
    try {
      const res: string[] = [];
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      const sideBar = $('#main-sidebar');
      sideBar.find('ul.sb-genre-list li a').each((i, ele) => {
        const genres = $(ele);
        res.push(genres.text().toLowerCase());
      });

      return res;
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  }
  /**
   * @param page number
   */
  genreSearch(genre: string, page: number = 1): Promise<ISearch<IAnimeResult>> {
    if (genre == '') {
      throw new Error('genre is empty');
    }
    if (0 >= page) {
      page = 1;
    }
    return this.scrapeCardPage(`${this.baseUrl}/genre/${genre}?page=${page}`);
  }

  /**
   * Fetches the schedule for a given date.
   * @param date The date in format 'YYYY-MM-DD'. Defaults to the current date.
   * @returns A promise that resolves to an object containing the search results.
   */
  async fetchSchedule(date: string = new Date().toISOString().slice(0, 10)): Promise<ISearch<IAnimeResult>> {
    try {
      const res: ISearch<IAnimeResult> = {
        results: [],
      };
      const {
        data: { html },
      } = await this.client.get(`${this.baseUrl}/ajax/schedule/list?tzOffset=360&date=${date}`);
      const $ = load(html);

      $('li').each((i, ele) => {
        const card = $(ele);
        const title = card.find('.film-name');

        const id = card.find('a.tsl-link').attr('href')?.split('/')[1].split('?')[0];
        const airingTime = card.find('div.time').text().replace('\n', '').trim();
        const airingEpisode = card.find('div.film-detail div.fd-play button').text().replace('\n', '').trim();
        res.results.push({
          id: id!,
          title: title.text(),
          japaneseTitle: title.attr('data-jname'),
          url: `${this.baseUrl}/${id}`,
          airingEpisode: airingEpisode,
          airingTime: airingTime,
        });
      });

      return res;
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  }

  async fetchSpotlight(): Promise<ISearch<IAnimeResult>> {
    try {
      const res: ISearch<IAnimeResult> = { results: [] };
      const { data } = await this.client.get(`${this.baseUrl}/home`);
      const $ = load(data);

      $('#slider div.swiper-wrapper div.swiper-slide').each((i, el) => {
        const card = $(el);
        const titleElement = card.find('div.desi-head-title');
        const id =
          card
            .find('div.desi-buttons .btn-secondary')
            .attr('href')
            ?.match(/\/([^/]+)$/)?.[1] || null;
        const img = card.find('img.film-poster-img');
        res.results.push({
          id: id!,
          title: titleElement.text(),
          japaneseTitle: titleElement.attr('data-jname'),
          banner: img.attr('data-src') || img.attr('src') || null,
          rank: parseInt(card.find('.desi-sub-text').text().match(/(\d+)/g)?.[0]!),
          url: `${this.baseUrl}/${id}`,
          type: card.find('div.sc-detail .scd-item:nth-child(1)').text().trim() as MediaFormat,
          duration: card.find('div.sc-detail > div:nth-child(2)').text().trim(),
          releaseDate: card.find('div.sc-detail > div:nth-child(3)').text().trim(),
          quality: card.find('div.sc-detail > div:nth-child(4)').text().trim(),
          sub: parseInt(card.find('div.sc-detail div.tick-sub').text().trim()) || 0,
          dub: parseInt(card.find('div.sc-detail div.tick-dub').text().trim()) || 0,
          episodes: parseInt(card.find('div.sc-detail div.tick-eps').text()) || 0,
          description: card.find('div.desi-description').text().trim(),
        });
      });

      return res;
    } catch (error) {
      throw new Error('Something went wrong. Please try again later.');
    }
  }

  async fetchSearchSuggestions(query: string): Promise<ISearch<IAnimeResult>> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const { data } = await this.client.get(`${this.baseUrl}/ajax/search/suggest?keyword=${encodedQuery}`);
      const $ = load(data.html);
      const res: ISearch<IAnimeResult> = {
        results: [],
      };

      $('.nav-item').each((i, el) => {
        const card = $(el);
        if (!card.hasClass('nav-bottom')) {
          const image = card.find('.film-poster img').attr('data-src');
          const title = card.find('.film-name');
          const id = card.attr('href')?.split('/')[1].split('?')[0];

          const duration = card.find('.film-infor span').last().text().trim();
          const releaseDate = card.find('.film-infor span:nth-child(1)').text().trim();
          const type = card.find('.film-infor').find('span, i').remove().end().text().trim();
          res.results.push({
            image: image,
            id: id!,
            title: title.text(),
            japaneseTitle: title.attr('data-jname'),
            aliasTitle: card.find('.alias-name').text(),
            releaseDate: releaseDate,
            type: type as MediaFormat,
            duration: duration,
            url: `${this.baseUrl}/${id}`,
          });
        }
      });

      return res;
    } catch (error) {
      throw new Error('Something went wrong. Please try again later.');
    }
  }

  /**
   * Fetches the list of episodes that the user is currently watching.
   * @param connectSid The session ID of the user. Note: This can be obtained from the browser cookies (needs to be signed in)
   * @returns A promise that resolves to an array of anime episodes.
   */
  async fetchContinueWatching(connectSid: string): Promise<IAnimeEpisode[]> {
    try {
      if (!(await this.verifyLoginState(connectSid))) {
        throw new Error('Invalid session ID');
      }
      const res: IAnimeEpisode[] = [];
      const { data } = await this.client.get(`${this.baseUrl}/user/continue-watching`, {
        headers: {
          Cookie: `connect.sid=${connectSid}`,
        },
      });
      const $ = load(data);
      $('.flw-item').each((i, ele) => {
        const card = $(ele);
        const atag = card.find('.film-name a');
        const id = atag.attr('href')?.replace('/watch/', '')?.replace('?ep=', '$episode$');
        const timeText = card.find('.fdb-time')?.text()?.split('/') ?? [];
        const duration = timeText.pop()?.trim() ?? '';
        const watchedTime = timeText.length > 0 ? timeText[0].trim() : '';
        res.push({
          id: id!,
          title: atag.text(),
          number: parseInt(card.find('.fdb-type').text().replace('EP', '').trim()),
          duration: duration,
          watchedTime: watchedTime,
          url: `${this.baseUrl}${atag.attr('href')}`,
          image: card.find('img')?.attr('data-src'),
          japaneseTitle: atag.attr('data-jname'),
          nsfw: card.find('.tick-rate')?.text() === '18+' ? true : false,
          sub: parseInt(card.find('.tick-item.tick-sub')?.text()) || 0,
          dub: parseInt(card.find('.tick-item.tick-dub')?.text()) || 0,
          episodes: parseInt(card.find('.tick-item.tick-eps')?.text()) || 0,
        });
      });

      return res;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  /**
   * @param id Anime id
   */
  override fetchAnimeInfo = async (id: string): Promise<IAnimeInfo> => {
    const info: IAnimeInfo = {
      id: id,
      title: '',
    };
    try {
      const { data } = await this.client.get(`${this.baseUrl}/watch/${id}`);
      const $ = load(data);

      const { mal_id, anilist_id } = JSON.parse($('#syncData').text());
      info.malID = Number(mal_id);
      info.alID = Number(anilist_id);
      info.title = $('h2.film-name > a.text-white').text();
      info.japaneseTitle = $('div.anisc-info div:nth-child(2) span.name').text();
      info.image = $('img.film-poster-img').attr('src');
      info.description = $('div.film-description').text().trim();
      // Movie, TV, OVA, ONA, Special, Music
      info.type = $('span.item').last().prev().prev().text().toUpperCase() as MediaFormat;
      info.url = `${this.baseUrl}/${id}`;
      info.recommendations = await this.scrapeCard($);
      info.relatedAnime = [];
      $('#main-sidebar section:nth-child(1) div.anif-block-ul li').each((i, ele) => {
        const card = $(ele);
        const aTag = card.find('.film-name a');
        const id = aTag.attr('href')?.split('/')[1].split('?')[0];
        info.relatedAnime.push({
          id: id!,
          title: aTag.text(),
          url: `${this.baseUrl}${aTag.attr('href')}`,
          image: card.find('img')?.attr('data-src'),
          japaneseTitle: aTag.attr('data-jname'),
          type: card.find('.tick').contents().last()?.text()?.trim() as MediaFormat,
          sub: parseInt(card.find('.tick-item.tick-sub')?.text()) || 0,
          dub: parseInt(card.find('.tick-item.tick-dub')?.text()) || 0,
          episodes: parseInt(card.find('.tick-item.tick-eps')?.text()) || 0,
        });
      });
      const hasSub: boolean = $('div.film-stats div.tick div.tick-item.tick-sub').length > 0;
      const hasDub: boolean = $('div.film-stats div.tick div.tick-item.tick-dub').length > 0;

      if (hasSub) {
        info.subOrDub = SubOrSub.SUB;
        info.hasSub = hasSub;
      }
      if (hasDub) {
        info.subOrDub = SubOrSub.DUB;
        info.hasDub = hasDub;
      }
      if (hasSub && hasDub) {
        info.subOrDub = SubOrSub.BOTH;
      }

      const episodesAjax = await this.client.get(
        `${this.baseUrl}/ajax/v2/episode/list/${id.split('-').pop()}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Referer: `${this.baseUrl}/watch/${id}`,
          },
        }
      );

      const $$ = load(episodesAjax.data.html);

      info.totalEpisodes = $$('div.detail-infor-content > div > a').length;
      info.episodes = [];
      $$('div.detail-infor-content > div > a').each((i, el) => {
        const episodeId = $$(el)
          .attr('href')
          ?.split('/')[2]
          ?.replace('?ep=', '$episode$')
          ?.concat(`$${info.subOrDub}`)!;
        const number = parseInt($$(el).attr('data-number')!);
        const title = $$(el).attr('title');
        const url = this.baseUrl + $$(el).attr('href');
        const isFiller = $$(el).hasClass('ssl-item-filler');

        info.episodes?.push({
          id: episodeId,
          number: number,
          title: title,
          isFiller: isFiller,
          url: url,
        });
      });

      return info;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  isFullZoroEpisodeId = (id: string) => /.*\$episode\$[0-9]+\$[a-z]+/.test(id);

  parseZoroEpisodeId = (id: string): { id: string; type?: CategoryType } => {
    if (!isNaN(parseInt(id))) {
      return { id };
    }

    if (this.isFullZoroEpisodeId(id)) {
      const data = id.split('$');
      return { id: data[2], type: data[3] as CategoryType };
    }

    return { id };
  };

  private verifyLoginState = async (connectSid: string): Promise<boolean> => {
    try {
      const { data } = await this.client.get(`${this.baseUrl}/ajax/login-state`, {
        headers: {
          Cookie: `connect.sid=${connectSid}`,
        },
      });
      return data.is_login;
    } catch (err) {
      return false;
    }
  };

  private retrieveServerId = ($: any, index: number, subOrDub: 'sub' | 'dub') => {
    const rawOrSubOrDub = (raw: boolean) =>
      $(`.ps_-block.ps_-block-sub.servers-${raw ? 'raw' : subOrDub} > .ps__-list .server-item`)
        .map((i: any, el: any) => ($(el).attr('data-server-id') == `${index}` ? $(el) : null))
        .get()[0]
        .attr('data-id');
    try {
      // Attempt to get the subOrDub ID
      return rawOrSubOrDub(false);
    } catch (error) {
      // If an error is thrown, attempt to get the raw ID (The raw is the newest episode uploaded to zoro)
      return rawOrSubOrDub(true);
    }
  };

  /**
   * @param url string
   */
  private scrapeCardPage = async (url: string): Promise<ISearch<IAnimeResult>> => {
    try {
      const res: ISearch<IAnimeResult> = {
        currentPage: 0,
        hasNextPage: false,
        totalPages: 0,
        results: [],
      };
      const { data } = await this.client.get(url);
      const $ = load(data);

      const pagination = $('ul.pagination');
      res.currentPage = parseInt(pagination.find('.page-item.active')?.text());
      const nextPage = pagination.find('a[title=Next]')?.attr('href');
      if (nextPage != undefined && nextPage != '') {
        res.hasNextPage = true;
      }
      const totalPages = pagination.find('a[title=Last]').attr('href')?.split('=').pop();
      if (totalPages === undefined || totalPages === '') {
        res.totalPages = res.currentPage;
      } else {
        res.totalPages = parseInt(totalPages);
      }

      res.results = await this.scrapeCard($);
      if (res.results.length === 0) {
        res.currentPage = 0;
        res.hasNextPage = false;
        res.totalPages = 0;
      }
      return res;
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };

  /**
   * @param $ cheerio instance
   */
  private scrapeCard = async ($: CheerioAPI): Promise<IAnimeResult[]> => {
    try {
      const results: IAnimeResult[] = [];

      $('.flw-item').each((i, ele) => {
        const card = $(ele);
        const atag = card.find('.film-name a');
        const id = atag.attr('href')?.split('/')[1].split('?')[0];
        const type = card
          .find('.fdi-item')
          ?.first()
          ?.text()
          .replace(' (? eps)', '')
          .replace(/\s\(\d+ eps\)/g, '');
        results.push({
          id: id!,
          title: atag.text(),
          url: `${this.baseUrl}${atag.attr('href')}`,
          image: card.find('img')?.attr('data-src'),
          duration: card.find('.fdi-duration')?.text(),
          japaneseTitle: atag.attr('data-jname'),
          type: type as MediaFormat,
          nsfw: card.find('.tick-rate')?.text() === '18+' ? true : false,
          sub: parseInt(card.find('.tick-item.tick-sub')?.text()) || 0,
          dub: parseInt(card.find('.tick-item.tick-dub')?.text()) || 0,
          episodes: parseInt(card.find('.tick-item.tick-eps')?.text()) || 0,
        });
      });
      return results;
    } catch (err) {
      throw new Error('Something went wrong. Please try again later.');
    }
  };
  /**
   * @param episodeId Episode id
   */
  override fetchEpisodeServers(
    episodeId: string,
    category: 'sub' | 'raw' | 'dub' = 'sub'
  ): Promise<IExtendedEpisodeServer[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const { id, type } = this.parseZoroEpisodeId(episodeId);
        const servers: IExtendedEpisodeServer[] = [];
        const response = await this.client.get(`${this.baseUrl}/ajax/v2/episode/servers?episodeId=${id}`);

        if (typeof response.data === 'object' && response.data.html) {
          const $ = load(response.data.html);

          $(`.servers-${category} .server-item`).each((_, el) => {
            const server = $(el);
            servers.push({
              name: server.find('a').text().trim(),
              url: `${this.baseUrl}/ajax/v2/episode/sources?id=${server.attr('data-id')}`,
              category: category,
            });
          });
        } else {
          throw new Error('Unexpected response format');
        }

        if (servers.length === 0) {
          throw new Error(`No servers found for episode ${id} with category ${category}`);
        }

        resolve(servers);
      } catch (err) {
        reject(err);
      }
    });
  }

  override fetchEpisodeSources(
    episodeId: string,
    server: StreamingServers | string = StreamingServers.VidStreaming,
    category?: 'sub' | 'dub' | 'raw' | 'both'
  ): Promise<ISource> {
    return new Promise(async (resolve, reject) => {
      const { id, type = category } = this.parseZoroEpisodeId(episodeId);

      const categoriesToTry = type && type != 'both' ? [type] : ['sub', 'raw', 'dub'];

      for (const cat of categoriesToTry) {
        try {
          const servers = await this.fetchEpisodeServers(id, cat as 'sub' | 'raw' | 'dub');

          if (servers.length === 0) {
            console.log(`No servers found for category: ${cat}`);
            if (!type) {
              continue; // Try next category if no specific category was requested
            } else {
              throw new Error(`No servers found for category: ${cat}`);
            }
          }

          // Fetch source for a specific server
          let selectedServer = this.selectServer(servers, server);
          if (!selectedServer) {
            selectedServer = servers[0];
          }

          const { data } = await this.client.get(selectedServer.url);
          if (!data.link) {
            throw new Error(`No episode sources found for category: ${cat}`);
          }

          const source = await this.extractSource(data.link, selectedServer.name);
          source.server = selectedServer.name;
          source.category = cat as 'sub' | 'raw' | 'dub';
          if (data.quality) source.quality = data.quality;
          if (data.intro) source.intro = data.intro;
          if (data.outro) source.outro = data.outro;

          return resolve(source as ISource);
        } catch (err) {
          if (type) {
            return reject(err);
          }
          // If no specific category was requested, the loop will continue to try the next category
        }
      }

      reject(new Error('No episode sources found'));
    });
  }

  private mapServerName(server: string): string {
    const serverMap: { [key: string]: string } = {
      [StreamingServers.VidStreaming]: 'hd-1',
      [StreamingServers.VidCloud]: 'hd-2',
    };

    const normalizedServer = server.toLowerCase();
    return serverMap[normalizedServer] || normalizedServer;
  }

  private selectServer(
    servers: IExtendedEpisodeServer[],
    preferredServer: StreamingServers | string
  ): IExtendedEpisodeServer | undefined {
    const mappedServer = this.mapServerName(preferredServer) || preferredServer.toLowerCase();

    return servers.find(s => s.name.toLowerCase() === mappedServer) || servers[0];
  }

  private async extractSource(url: string, server: StreamingServers | string): Promise<IExtendedSource> {
    const serverUrl = new URL(url);
    switch (server) {
      case StreamingServers.VidStreaming:
      case StreamingServers.VidCloud:
      case 'HD-1':
      case 'HD-2':
        return {
          ...(await new MegaCloud().extract(serverUrl)),
        };
      case StreamingServers.StreamSB:
      case 'StreamSB':
        return {
          headers: {
            Referer: serverUrl.href,
            watchsb: 'streamsb',
            'User-Agent': USER_AGENT,
          },
          sources: await new StreamSB(this.proxyConfig, this.adapter).extract(serverUrl, true),
        };
      case StreamingServers.StreamTape:
      case 'StreamTape':
        return {
          headers: { Referer: serverUrl.href, 'User-Agent': USER_AGENT },
          sources: await new StreamTape(this.proxyConfig, this.adapter).extract(serverUrl),
        };
      default:
        throw new Error('Invalid server specified');
    }
  }
}

// Test function
//command: npx ts-node src/providers/anime/zoro.ts
// (async () => {
//   try {
//     const zoro = new Zoro();
//     const episodeId = 'kamikatsu-working-for-god-in-a-godless-world-18361$episode$100032$both';
//     const category = 'sub';

//     console.log(`\nParsed episode id: ${JSON.stringify(zoro.parseZoroEpisodeId(episodeId), null, 2)}`)
//     console.log(`\nFetching sources for episode ID: ${episodeId}`);
//     const sources = await zoro.fetchEpisodeSources(episodeId, "hd-1", category);
//     console.log('Episode sources:', JSON.stringify(sources, null, 2));
//     console.log(`\nFetching servers for episode ID: ${episodeId}`);
//     const servers = await zoro.fetchEpisodeServers(episodeId, category)
//     console.log('Episode servers:', JSON.stringify(servers, null, 2));
//   } catch (error) {
//     console.error('Error:', (error as Error).message);
//   }
// })();

export default Zoro;
