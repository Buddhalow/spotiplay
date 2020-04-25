import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import axios from 'axios';
import { Grid, Typography } from '@material-ui/core';
import MediaCard from '../MediaCard/MediaCard';
import { BrowseFeatured, BrowseCategories, BrowseNew } from 'react-spotify-api';
import * as actionTypes from '../../store/actions/actionTypes';
import Navigation from '../Navigation/Navigation';
import styled from 'styled-components';

const TypographyHeader = styled(Typography).attrs({
  variant: 'h3',
  align: 'center',
  color: 'secondary',
})`
  padding: 10px;
  font-weight: 800;
  font-size: 72px;
`;

class HomePage extends Component {
  state = {
    forYou: [],
  };

  componentDidMount() {
    this.props.setBackgroundImage(
      'linear-gradient(rgb(58, 91, 95), rgb(6, 9, 10) 85%)'
    );
    document.title = 'Spotiplay | Home';

    const seed_artists = [];
    const seed_tracks = [];
    for (const item of this.props.recently_played) {
      if (item.context && item.context.type === 'artist') {
        // limited to 5 seed artists
        if (seed_artists.length >= 5) {
          continue;
        }
        seed_artists.push(item.context.uri.slice(15)); // The ID starts at position 15 of the URI string
      } else {
        // limited to 5 seed tracks
        if (seed_tracks.length >= 5) {
          continue;
        }
        seed_tracks.push(item.track.id);
      }
    }

    // if there are no seeds this will error, so make a check if there are seeds (length of at least 1 array is more than 0)
    if (seed_artists.length || seed_tracks.length) {
      axios
        .get('https://api.spotify.com/v1/recommendations', {
          params: {
            seed_artists: seed_artists.length
              ? seed_artists.join(',')
              : undefined,
            seed_tracks: seed_tracks.length ? seed_tracks.join(',') : undefined,
          },
        })
        .then(data => {
          this.setState({ forYou: data.data.tracks });
        });
    }
  }

  render() {
    const NavigationItems = [
      {
        link: '/browse/featured',
        text: 'Featured',
      },
      {
        link: '/browse/genres',
        text: 'Genres & Moods',
      },
      {
        link: '/browse/new',
        text: 'New Releases',
      },
      {
        link: '/browse/discover',
        text: 'Discover',
      },
    ];

    let recentlyPlayed = (
      <div>
        <TypographyHeader>Recently Played</TypographyHeader>
        <Grid
          container
          spacing={2}
          style={{ margin: 0, width: '100%' }} // inline styles overwrite the material ui styles (no spacing on the left side)
        >
          {this.props.recently_played.map(track => {
            let artist = track.track.artists.map(name => name.name).join(', ');
            return (
              <MediaCard
                key={`${track.track.id} - ${track.played_at}`} // There is a problem with the artist id only because some recently played songs appear couple of times so they key isn't unique
                link={'/album/' + track.track.album.id}
                img={track.track.album.images[0].url}
                primaryText={track.track.name}
                secondaryText={artist}
                playSong={() =>
                  this.props.playSong(
                    JSON.stringify({
                      context_uri: track.track.album.uri,
                      offset: {
                        uri: track.track.uri,
                      },
                    })
                  )
                }
              />
            );
          })}
        </Grid>
      </div>
    );

    let forYou = null;
    if (this.state.forYou && this.state.forYou.length) {
      forYou = (
        <div>
          <TypographyHeader>For You</TypographyHeader>
          <Grid
            container
            spacing={2}
            style={{ margin: 0, width: '100%' }} // inline styles overwrite the material ui styles (no spacing on the left side)
          >
            {this.state.forYou.map(track => {
              return (
                <MediaCard
                  key={track.id} // There is a problem with the artist id only because some recently played songs appear couple of times so they key isn't unique
                  link={'/album/' + track.album.id}
                  img={track.album.images[0].url}
                  primaryText={track.name}
                  secondaryText={track.artists
                    .map(name => name.name)
                    .join(', ')}
                  playSong={() =>
                    this.props.playSong(
                      JSON.stringify({
                        context_uri: track.album.uri,
                        offset: {
                          uri: track.uri,
                        },
                      })
                    )
                  }
                />
              );
            })}
          </Grid>
        </div>
      );
    }

    let featuredPlaylists = (
      <BrowseFeatured options={{ limit: 12 }}>
        {({ data: playlists }) =>
          playlists ? (
            <div>
              <TypographyHeader>{playlists.message}</TypographyHeader>
              <Grid container spacing={2} style={{ margin: 0, width: '100%' }}>
                {playlists.playlists.items.map(playlist => (
                  <MediaCard
                    key={playlist.id}
                    link={`/playlist/${playlist.id}`}
                    img={playlist.images[0].url}
                    primaryText={playlist.name}
                    secondaryText={
                      playlist.description ||
                      (playlist.owner.display_name
                        ? `By ${playlist.owner.display_name}`
                        : null) ||
                      ''
                    } // Playlist description is optional
                    playSong={() =>
                      this.props.playSong(
                        JSON.stringify({
                          context_uri: playlist.uri,
                        })
                      )
                    }
                  />
                ))}
              </Grid>
            </div>
          ) : null
        }
      </BrowseFeatured>
    );

    let genres = (
      <div>
        <TypographyHeader>Genres & Moods</TypographyHeader>
        <Grid container spacing={2} style={{ margin: 0, width: '100%' }}>
          <BrowseCategories options={{ limit: 18 }}>
            {({ data: categories }) =>
              categories
                ? categories.categories.items.map(genre => (
                    <MediaCard
                      link={`/genre/${genre.id}`}
                      key={genre.id}
                      img={genre.icons[0].url}
                      primaryText={genre.name}
                      secondaryText={'Genre'}
                    />
                  ))
                : null
            }
          </BrowseCategories>
        </Grid>
      </div>
    );

    let newReleases = (
      <div>
        <TypographyHeader>New Releases</TypographyHeader>
        <Grid container spacing={2} style={{ margin: 0, width: '100%' }}>
          <BrowseNew options={{ limit: 18 }}>
            {({ data: albums }) =>
              albums
                ? albums.albums.items.map(album => (
                    <MediaCard
                      link={`/album/${album.id}`}
                      key={album.id}
                      img={album.images[0].url}
                      primaryText={album.name}
                      secondaryText={album.artists.map(a => a.name).join(', ')}
                      playSong={() =>
                        this.props.playSong(
                          JSON.stringify({
                            context_uri: album.uri,
                          })
                        )
                      }
                    />
                  ))
                : null
            }
          </BrowseNew>
        </Grid>
      </div>
    );

    return (
      <Grid container>
        <Navigation items={NavigationItems} />
        <Switch>
          <Route
            path="/browse/featured"
            exact
            render={() => (
              <div>
                {recentlyPlayed}
                {forYou}
                {featuredPlaylists}
              </div>
            )}
          />
          <Route path="/browse/genres" exact render={() => genres} />
          <Route path="/browse/new" exact render={() => newReleases} />
          <Route path="/browse/discover" exact render={() => recentlyPlayed} />
        </Switch>
      </Grid>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.current_user,
    recently_played: state.recently_played,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setBackgroundImage: backgroundImage =>
      dispatch({
        type: actionTypes.SET_BACKGROUND_IMAGE,
        backgroundImage,
      }),
    playSong: uris => dispatch(actionTypes.playSong(uris)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
