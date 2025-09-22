declare namespace Spotify {
  interface Player {
    addListener(event: string, callback: (state: PlaybackState | null) => void): boolean;
    removeListener(event: string, callback?: (state: PlaybackState | null) => void): boolean;
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    getCurrentState(): Promise<PlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }

  interface PlaybackState {
    context: {
      uri: string;
      metadata: any;
    };
    disallows: {
      pausing?: boolean;
      peeking_next?: boolean;
      peeking_prev?: boolean;
      resuming?: boolean;
      seeking?: boolean;
      skipping_next?: boolean;
      skipping_prev?: boolean;
    };
    paused: boolean;
    position: number;
    duration: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: Track;
      previous_tracks: Track[];
      next_tracks: Track[];
    };
  }

  interface Track {
    id: string;
    name: string;
    artists: Artist[];
    album: Album;
    duration_ms: number;
    uri: string;
  }

  interface Artist {
    name: string;
    uri: string;
  }

  interface Album {
    name: string;
    uri: string;
    images: Image[];
  }

  interface Image {
    url: string;
    height: number;
    width: number;
  }

  interface PlayerConstructor {
    new (options: PlayerOptions): Player;
  }

  interface PlayerOptions {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }
}

declare global {
  interface Window {
    Spotify: {
      Player: Spotify.PlayerConstructor;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
  
  var window: Window & typeof globalThis;
}
