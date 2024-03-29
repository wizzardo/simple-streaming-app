import {fetch, FetchOptions, toRequestParams} from "./HttpClient";

const origin = window.location.origin;
const baseurl = origin.indexOf('localhost') !== -1 ? 'http://localhost:8080' :
    (origin.indexOf('192.168.0.147') !== -1 ? 'http://192.168.0.147:8080' : origin);

type Params = { [id: string]: any };
type UrlMaker = (params: Params) => string;

const variablePatter = /\{(\w+)\}/g;
const createUrlMaker = (template: string, deleteVars: boolean = false): UrlMaker => {
    let parts = [];
    let variables = [];

    let find;
    let prevIndex = 0;
    while ((find = variablePatter.exec(template)) !== null) {
        variables.push(find[1]);
        parts.push(template.substring(prevIndex, find.index));
        prevIndex = find.index + find[0].length;
    }
    if (prevIndex === 0)
        return () => template;

    parts.push(template.substring(prevIndex, template.length));

    const m = parts;
    const v = variables;
    return function (params: any) {
        const length = Math.max(m.length, v.length);
        let s = '';
        for (let i = 0; i < length; i++) {
            if (m[i] !== null)
                s += m[i];
            let param = params[v[i]];
            if (params && v[i] !== null && param != null) {
                s += encodeURIComponent(param);
                if (deleteVars)
                    delete params[v[i]]
            }
        }
        return s;
    };
}

const lazy = <T extends Function>(f: ((...any) => T), ...args): any => {
    let result: T;
    return function (): any {
        if (!result)
            result = f.apply(null, args) as T

        return result.apply(null, arguments)
    };
}

const createGET = <R>(template: string) => {
    let urlMaker: (UrlMaker) = lazy(createUrlMaker, template, true);
    return async (params?: Params,) => fetch<R>(`${baseurl}${urlMaker(params)}`, {params});
};


const createPOST = <R, P extends Params>(template: string) => {
    let urlMaker: (UrlMaker) = lazy(createUrlMaker, template);
    return async (params?: P,) => fetch<R>(`${baseurl}${urlMaker(params)}`, {params, method: "POST"});
};

const createBinaryPOST = <R>(template: string) => {
    let urlMaker: (UrlMaker) = lazy(createUrlMaker, template, true);
    return async (pathVariables: Params, options: FetchOptions) => {
        let url = `${baseurl}${urlMaker(pathVariables)}`;
        if (Object.keys(pathVariables).length > 0) {
            url += '?' + toRequestParams(pathVariables)
        }
        return fetch<R>(url, options);
    };
};

const createDELETE = <R>(template: string) => {
    let urlMaker: (UrlMaker) = lazy(createUrlMaker, template, true);
    return async (params?: Params,) => fetch<R>(`${baseurl}${urlMaker(params)}`, {params, method: "DELETE"});
};

export interface MultipartOptions {
    onProgress?: ((ev: ProgressEvent) => any)
    provideCancel?: ((cancelFunction: () => void) => void)
}

const createMultipart = <R>(template: string) => {
    let urlMaker: (UrlMaker) = lazy(createUrlMaker, template);
    return async (params: any, options?: MultipartOptions) => {
        let url = `${baseurl}${urlMaker(params)}`;
        return fetch<R>(url, {params, method: "POST", multipart: true, ...options});
    };
};

export default {
    baseurl,
    //generated endpoints start
    getAlbumCover: createGET('/artists/{artistIdOrPath}/{albumIdOrPath}/cover.jpg'),
    getArtist: createGET<ArtistDto>('/artists/{id}'),
    getArtists: createGET<Array<ArtistDto>>('/artists'),
    getSong: createGET('/artists/{artistId}/{albumName}/{trackNumber}'),
    getSongConverted: createGET('/artists/{artistId}/{albumIdOrName}/{songIdOrTrackNumber}/{format}/{bitrate}'),
    getSongConvertedStreamed: createGET('/artists/{artistId}/{albumIdOrName}/{songIdOrTrackNumber}/{format}/{bitrate}/stream'),
    createAlbum: createPOST<ArtistDto, CreateAlbumRequest>('/artists/{artistId}/album'),
    createArtist: createPOST<ArtistDto, CreateArtistRequest>('/artists/'),
    mergeAlbums: createPOST<ArtistDto, MergeAlbumsRequest>('/artists/{artistId}/{intoAlbumId}'),
    moveAlbum: createPOST('/artists/{artistId}/{albumId}/moveTo/{toArtistId}'),
    updateArtist: createPOST<ArtistDto, ArtistDto>('/artists/{id}'),
    uploadCoverArt: createMultipart<ArtistDto>('/artists/{artistId}/{albumId}/cover'),
    deleteAlbum: createDELETE<ArtistDto>('/artists/{artistId}/{albumId}'),
    deleteArtist: createDELETE<ArtistDto>('/artists/{id}'),
    deleteSong: createDELETE<ArtistDto>('/artists/{artistId}/{albumId}/{songId}'),

    isLoginRequired: createGET<LoginRequiredResponse>('/login/required'),
    login: createPOST<LoginResponse, LoginRequest>('/login'),




    upload: createMultipart<ArtistDto>('/upload'),
//generated endpoints end
}

//generated types start
export interface CreateAlbumRequest {
	artistId: number,
	name: string,
}

export interface CreateArtistRequest {
	name: string,
}

export interface MergeAlbumsRequest {
	artistId: number,
	intoAlbumId: string,
	albums: Array<string>,
}

export interface LoginRequest {
	username: string,
	password: string,
}

export interface LoginRequiredResponse {
	required: boolean,
    tokenValid: boolean,
}

export interface LoginResponse {
	validUntil: number,
}

export interface ArtistDto {
	id: number,
	created: string,
	updated: string,
	name: string,
	path: string,
	albums: Array<AlbumDto>,
}

export interface AlbumDto {
	id: string,
	path: string,
	date: string,
	name: string,
	songs: Array<AlbumDtoSong>,
	coverPath: string | null,
	coverHash: string | null,
	coverEncryptionKey: string | null,
}

export interface AlbumDtoSong {
	id: string,
	track: number,
	title: string,
	comment: string,
	duration: number,
	streams: Array<string>,
	path: string,
	format: AudioFormat,
	encryptionKey: string,
}

export enum AudioFormat {
	MP3 = 'MP3',
	AAC = 'AAC',
	OGG = 'OGG',
	OPUS = 'OPUS',
	FLAC = 'FLAC',
	WAV = 'WAV',
}
//generated types end