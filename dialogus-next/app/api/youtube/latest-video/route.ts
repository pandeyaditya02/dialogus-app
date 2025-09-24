// app/api/youtube/latest-video/route.ts
export async function GET() {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "YouTube API key not configured" }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
  
      const playlistId = "PLiWELLjBSGHJegQWqDl9EImihEW0Rakzc";
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${apiKey}`
      );
  
      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch playlist items" }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }
  
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const video = data.items[0].snippet;
        return new Response(
          JSON.stringify({
            id: video.resourceId.videoId,
            title: video.title,
            description: video.description
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "No videos found in playlist" }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("Error fetching latest video:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch latest video" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }