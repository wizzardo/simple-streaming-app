import {useEffect, useMemo, useState, useReducer, useRef} from "react";
import {WINDOW} from "react-ui-basics/Tools";
import {useLocalCache, WebCacheEntry} from "../services/LocalCacheService";
import * as BlobStore from "../stores/BlobStore";
import {useStore} from "react-ui-basics/store/Store";

export const useWindowSize = () => {
    const [windowsSize, setWindowSize] = useState({width: WINDOW.innerWidth, height: WINDOW.innerHeight})

    useEffect(() => {
        const listener = () => {
            setWindowSize({width: WINDOW.innerWidth, height: WINDOW.innerHeight})
        }
        WINDOW.addEventListener('resize', listener)
        return () => WINDOW.removeEventListener('resize', listener)
    }, [])
    return windowsSize
}

export const useIsSafari = () => {
    const [isSafari] = useState(() => /^((?!chrome|android).)*safari/i.test(navigator.userAgent))
    return isSafari
}

export const useAsync = <R>(f: () => Promise<R>): R => {
    const [value, setValue] = useState<R>();
    useEffect(() => {
        f().then(setValue).catch(console.error)
    }, [f])
    return value
}

export const useWebCache = (url): ArrayBuffer => {
    const localCache = useLocalCache();
    const [_, forceUpdate] = useReducer(x => x + 1, 0);
    const valueRef = useRef<WebCacheEntry>(null)

    useEffect(() => {
        valueRef.current = null
        let canceled = false;
        (async () => {
            if (!localCache)
                return;
            if (!url)
                return;

            let cacheEntry = await localCache.getWebCacheEntry(url);
            if (canceled)
                return
            if (cacheEntry) {
                valueRef.current = cacheEntry
                forceUpdate()
            }

            try {
                const response = await fetch(url, {
                    credentials: 'include',
                    headers: {
                        'If-None-Match': cacheEntry?.etag || '',
                    }
                });

                if (response.status == 200) {
                    const etag = response.headers.get("ETag");
                    const blob = await response.blob();
                    const data = await blob.arrayBuffer();
                    cacheEntry = {
                        url,
                        etag,
                        data
                    }
                    if (etag)
                        localCache.addWebCacheEntry(cacheEntry)
                    if (canceled)
                        return

                    valueRef.current = cacheEntry
                    forceUpdate()
                } else if (response.status == 304) {
                    return
                } else {
                    console.log("unexpected response", url, response.status, response.text())
                }
            } catch (e) {
                console.error(`Failed to load ${url}`, e)
            }
        })()
        return () => {
            canceled = true
        }
    }, [url, localCache])

    return valueRef.current?.data
}

export const useIsShownOnScreen = (element: Element) => {
    const [isShown, setIsShown] = useState(false);

    const observer = useMemo(() => new IntersectionObserver(
        ([entry]) => {
            setIsShown(entry.isIntersecting);
        },
    ), []);

    useEffect(() => {
        if (!element)
            return;

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [element, observer]);

    return isShown;
};

export const useBlobUrl = (buffer: ArrayBuffer) => {
    const [url, setUrl] = useState<string>()

    useEffect(() => {
        if (!buffer)
            return;

        const blob = new Blob([buffer]);
        const blobUrl = URL.createObjectURL(blob);
        setUrl(blobUrl);
        return () => URL.revokeObjectURL(blobUrl);
    }, [buffer])

    return url
}

export const useImageBlobUrl = (src: string, doLoad: boolean = true): string => {
    const blobUrl = useStore(BlobStore.store, it => it[src])
    const buffer = useWebCache(!blobUrl && doLoad ? src : null);
    useEffect(() => {
        if (!buffer || !src) return

        const blob = new Blob([buffer]);
        let objectURL = URL.createObjectURL(blob);
        BlobStore.add(src, objectURL)
    }, [buffer, src])
    return blobUrl
}