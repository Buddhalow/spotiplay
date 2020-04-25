import React from 'react';
import { connect } from 'react-redux';
import * as actionTypes from '../../store/actions/actionTypes';
import { Switch, Route } from 'react-router-dom';
import { UserTracks, UserAlbums, UserPlaylists } from 'react-spotify-api';
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Navigation from '../Navigation/Navigation';
import MediaCard from '../MediaCard/MediaCard';

const NavigationItems = [
  {
    link: '/library/playlists',
    text: 'Playlists',
  },
  {
    link: '/library/albums',
    text: 'Albums',
  },
  {
    link: '/library/tracks',
    text: 'Tracks',
  },
];

const Library = props => {
  React.useEffect(() => {
    document.title = 'Spotiplay | Library';
  }, []);
  let savedPlaylists = (
    <UserPlaylists>
      {({ data: playlists }) =>
        playlists ? (
          <Grid container spacing={2} style={{ margin: 0, width: '100%' }}>
            {playlists.items.map(playlist => (
              <MediaCard
                key={playlist.id}
                link={`/playlist/${playlist.id}`}
                img={playlist.images.length > 0 ? playlist.images[0].url : null}
                primaryText={playlist.name}
                secondaryText={
                  playlist.description ||
                  (playlist.owner.display_name
                    ? `By ${playlist.owner.display_name}`
                    : null) ||
                  ''
                } // Playlist description is optional
                playSong={() =>
                  props.playSong(
                    JSON.stringify({
                      context_uri: playlist.uri,
                    })
                  )
                }
              />
            ))}
          </Grid>
        ) : null
      }
    </UserPlaylists>
  );

  let savedAlbums = (
    <UserAlbums>
      {({ data: albums }) =>
        albums ? (
          <Grid container spacing={2} style={{ margin: 0, width: '100%' }}>
            {albums.items.map(album => (
              <MediaCard
                key={album.album.id}
                link={`/album/${album.album.id}`}
                img={album.album.images[0].url}
                content={album.album.name}
                primaryText={album.album.name}
                secondaryText={album.album.artists.map(a => a.name).join(', ')}
                playSong={() =>
                  props.playSong(
                    JSON.stringify({
                      context_uri: album.album.uri,
                    })
                  )
                }
              />
            ))}
          </Grid>
        ) : null
      }
    </UserAlbums>
  );

  let savedTracks = (
    <UserTracks>
      {tracks =>
        ({ data: tracks } ? (
          <List>
            {tracks.items.map(track => (
              <ListItem
                key={track.track.id}
                style={
                  props.currentlyPlaying === track.track.name && props.isPlaying
                    ? { background: '#1db954' }
                    : null
                }
              >
                <ListItemIcon style={{ cursor: 'pointer' }}>
                  {props.currentlyPlaying === track.track.name &&
                  props.isPlaying ? (
                    <PauseIcon
                      style={{ color: 'green' }}
                      onClick={props.pauseSong}
                    />
                  ) : (
                    <PlayArrowIcon
                      onClick={() =>
                        props.playSong(
                          JSON.stringify({
                            context_uri: track.track.album.uri,
                            offset: {
                              uri: track.track.ui,
                            },
                          })
                        )
                      }
                    />
                  )}
                </ListItemIcon>
                <ListItemText>{track.track.name}</ListItemText>
              </ListItem>
            ))}
          </List>
        ) : null)
      }
    </UserTracks>
  );

  return (
    <Grid container>
      <Navigation items={NavigationItems} />
      <Grid item xs={12}>
        <Switch>
          <Route path="/library/playlists" render={() => savedPlaylists} />
          <Route path="/library/albums" render={() => savedAlbums} />
          <Route path="/library/tracks" render={() => savedTracks} />
        </Switch>
      </Grid>
    </Grid>
  );
};

const mapStateToProps = state => {
  return {
    user: state.current_user,
    currentlyPlaying: state.currently_playing,
    isPlaying: state.isPlaying,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    playSong: uris => dispatch(actionTypes.playSong(uris)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Library);
