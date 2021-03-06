import React, {useEffect} from 'react';
import {classNames} from "react-ui-basics/Tools";
import Route from "react-ui-basics/router/Route";
import LibraryEditor from "./LibraryEditor";
import Dialog from "./Dialog";
import Library from "./Library";
import Player from "./Player";
import {useStore} from "react-ui-basics/store/Store";
import * as ArtistsStore from "../stores/ArtistsStore";
import * as PlayerStore from "../stores/PlayerStore";
import * as AuthenticationStore from "../stores/AuthenticationStore";
import {css} from "goober";
import NetworkService from "../services/NetworkService";
import CacheStats from "./CacheStats";
import Settings from "./Settings";
import MoreMenu from "./MoreMenu";
import DownloadQueue from "./DownloadQueue";
import Button from "react-ui-basics/Button";
import {pushLocation} from "react-ui-basics/router/HistoryTools";
import MaterialIcon from "react-ui-basics/MaterialIcon";
import {useWindowSize} from "../utils/Hooks";
import {useLocalCache} from "../services/LocalCacheService";
import LoginForm from "./LoginForm";

export default () => {
    const artistsStore = useStore(ArtistsStore.store)
    const {playing, position, queue} = useStore(PlayerStore.store)

    const queuedSong = queue[position]
    const artist = artistsStore.map[queuedSong?.artistId];
    const album = artist?.albums?.find(it => it.id === queuedSong?.albumId);
    const coverBackground = playing && album && css`
      background-image: url('${NetworkService.baseurl}/artists/${artist.id}/${album.id}/${album.coverPath}');
    `;

    const windowSize = useWindowSize();

    const localCacheDB = useLocalCache();
    useEffect(() => {
        localCacheDB && localCacheDB.deleteUnusedSongData()
    }, [localCacheDB])

    useEffect(() => {
        navigator.serviceWorker.onmessage = (event) => {
            console.log(event)
            const data = event.data;
            if (data.type === 'FETCH') {
                let url = new URL(data.url);
                if (url.pathname === '/artists') {
                    ArtistsStore.setAll(data.data)
                } else if (/\/artists\/([0-9]+)/.exec(url.pathname)) {
                    ArtistsStore.set(data.data)
                }
            }
        };
    }, [])

    const authenticationState = useStore(AuthenticationStore.store);
    if(authenticationState.loginRequired === null)
        return null

    if (authenticationState.loginRequired && authenticationState.tokenValidUntil < new Date().getTime())
        return <LoginForm/>

    return (
        <div className={classNames("App", css`
          background: white;
          background-size: cover;
          background-position-x: center;
          background-position-y: center;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        `, coverBackground)}>
            <div className={css`
              box-sizing: border-box;
              min-height: ${windowSize.height}px;

              background: rgba(255, 255, 255, 0.45);
              backdrop-filter: blur(40px);
              -webkit-backdrop-filter: blur(40px);
            `}>
                <Route path={'/*'}>
                    {window.location.pathname.length > 1 && <Button className={classNames('', css`
                      position: absolute;
                      top: 10px;
                      left: 10px;
                      z-index: 1;

                      .MaterialIcon {
                        font-size: 20px;
                        color: gray;
                      }
                    `)} flat round onClick={e => {
                        window.history.back()
                        // let pathname = window.location.pathname;
                        // let i = pathname.lastIndexOf('/');
                        // if (i === pathname.length - 1)
                        //     i = pathname.lastIndexOf('/', i - 1)
                        // pathname = pathname.substring(0, i + 1)
                        // if (!pathname)
                        //     pathname = '/'
                        // pushLocation(pathname)
                    }}>
                        <MaterialIcon icon={'chevron_left'}/>
                    </Button>}
                </Route>

                <MoreMenu className={css`
                  position: absolute;
                  z-index: 1;
                  right: 10px;
                  top: 10px;`}
                />

                <Route path={["/edit/artists/:artistId?/:album?", "/edit/albums"]}>
                    <LibraryEditor album={null} artistId={null}/>
                </Route>

                <Route path={"/cache"}>
                    <CacheStats/>
                </Route>

                <Route path={"/settings"}>
                    <Settings/>
                </Route>

                <Route path={"/:artistId(^[0-9]+$)?/:album?"}>
                    <Library artistId={null} album={null}/>
                </Route>

                {queue.length > 0 && <Player/>}

                <Dialog/>
                <DownloadQueue/>
            </div>
        </div>
    );
}

