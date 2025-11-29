// app/components/VideosWrapper.tsx
import VideoSlider from './VideoSlider';
import { fetchPlaylistVideos } from '@/lib/youtubeService';

// Playlist configurations
const PLAYLISTS = {
  exclusiveInterviews: {
    id: "PLiWELLjBSGHIlwS-6Btqaze1rQko3otMP",
    title: "EXCLUSIVE INTERVIEWS"
  }
};

export default async function VideosWrapper() {
  // Fetch data for the playlist
  const playlist = PLAYLISTS.exclusiveInterviews;
  const { videos, error } = await fetchPlaylistVideos(playlist.id);

  return (
    <VideoSlider
      title={playlist.title}
      videos={videos}
      error={error}
    />
  );
}