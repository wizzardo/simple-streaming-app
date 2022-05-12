import React, {useEffect, useState} from "react";
import {useStore} from "react-ui-basics/store/Store";
import * as DownloadQueueStore from "../stores/DownloadQueueStore";
import {SongLocalCacheDB, useLocalCache} from "../services/LocalCacheService";

const load = (url, setAudio, localCache: SongLocalCacheDB, artist: string, album: string, name: string, isRetrying?: boolean) => {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = () => {
        let audioData = request.response;
        if (request.status != 200) {
            console.error(url, request.status, request.responseText)
            if (!isRetrying) {
                load(url, setAudio, localCache, artist, album, name, true)
            }
            return
        }

        const contentType = request.getResponseHeader('Content-Type');
        const data = audioData.slice();

        let song = {
            url,
            name,
            album,
            artist,
            type: contentType,
            size: data.byteLength,
            dataId: 0,
            timesPlayed: 0,
            dateAdded: new Date().getTime(),
        };
        localCache.add(song, data)
        setAudio(song, data)
    }
    request.send();
};

const DownloadQueue = ({}) => {
    const localCache = useLocalCache();
    const {queue} = useStore(DownloadQueueStore.store)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        if (!localCache)
            return
        if (downloading)
            return;
        if (!queue.length)
            return;

        const task = queue[0];
        setDownloading(true)
        load(task.url, (song, data) => {
            setDownloading(false)
            DownloadQueueStore.pop()

        }, localCache, task.artist, task.album, task.song)

    }, [localCache, queue, downloading])


    return null
}

export default DownloadQueue