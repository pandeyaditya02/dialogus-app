// app/components/VideosWrapper.tsx
import Videos from './Videos';
import { fetchPlaylistVideos } from '@/lib/youtubeService';

// Playlist configurations - kept in one place for consistency
const PLAYLISTS = {
  exclusiveInterviews: {
    id: "PLiWELLjBSGHIlwS-6Btqaze1rQko3otMP",
    title: "EXCLUSIVE INTERVIEWS"
  },
  talkItOut: {
    id: "PLiWELLjBSGHKxeFFSKSKQBhunIhR_aIMS", 
    title: "TALK IT OUT"
  },
  worldView: {
    id: "PLiWELLjBSGHI3c517bIrA7kVx0leH6v-y",
    title: "WORLD VIEW"
  }
};

export default async function VideosWrapper() {
  // Fetch data for all playlists concurrently
  const playlistKeys = Object.keys(PLAYLISTS) as Array<keyof typeof PLAYLISTS>;
  
  const playlistResults = await Promise.all(
    playlistKeys.map(async (key) => {
      const playlist = PLAYLISTS[key];
      const { videos, error } = await fetchPlaylistVideos(playlist.id);
      
      return {
        key,
        title: playlist.title,
        videos,
        error
      };
    })
  );

  // Format data for the client component
  const initialData = playlistResults.reduce((acc, { key, title, videos, error }) => {
    acc[key] = { 
      title, 
      videos, 
      error 
    };
    return acc;
  }, {} as {
    [key: string]: {
      title: string;
      videos: any[];
      error: string | null;
    }
  });

  return <Videos initialData={initialData} />;
}