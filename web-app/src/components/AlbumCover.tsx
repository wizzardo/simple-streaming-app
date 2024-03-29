import {useImageBlobUrl, useIsShownOnScreen} from "../utils/Hooks";
import React, {useState} from "react";
import {css} from "goober";
import {classNames} from "react-ui-basics/Tools";
import MaterialIcon from "react-ui-basics/MaterialIcon";
import NetworkService, {AlbumDto} from "../services/NetworkService";

const AlbumCoverStyles = css`
  &.AlbumCover {
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity ease 200ms;
    
    &.shown {
      opacity: 1;
    }

    img {
      max-width: 100%;
      max-height: 150px;
      border-radius: 4px;
    }

    .MaterialIcon {
      font-size: 80px;
    }

    &.mobile {
      height: 300px;

      img {
        width: 100%;
        max-height: 300px;
        max-width: 300px;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 20px;
      }
    }

    &.small {
      height: 75px;

      img {
        border-radius: 0;
        max-width: 75px;
        max-height: 75px;
        min-width: 75px;
        min-height: 75px;
      }
    }
  }
`

type AlbumCoverProps = {
    artistId: number,
    album?: AlbumDto,
    className?: 'small' | 'mobile' | string
    forceShow?: boolean
};
const AlbumCover = ({artistId, album, className, forceShow}: AlbumCoverProps) => {
    const [ref, setRef] = useState<HTMLDivElement>(null)
    const isShown = useIsShownOnScreen(ref) || !!forceShow
    const src = album?.coverPath ? NetworkService.baseurl + '/artists/' + artistId + '/' + album.id + '/' + album.coverPath : null;
    const imageBlobUrl = useImageBlobUrl(src, isShown);

    return <div ref={setRef} className={classNames('AlbumCover', AlbumCoverStyles, imageBlobUrl && 'shown', className)}>
        {imageBlobUrl && <img src={imageBlobUrl} alt={album?.name}/>}
        {!src && <MaterialIcon icon={'album'}/>}
    </div>
}

export default AlbumCover