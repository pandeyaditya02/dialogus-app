// app/components/Hero.tsx
import { fetchLatestVideo } from "@/lib/youtubeService";
import HeroContent from "./HeroContent";

// Configure the 40-second loop
const LOOP_START = 0; // Start time in seconds
const LOOP_DURATION = 40; // Duration in seconds
const LOOP_END = LOOP_START + LOOP_DURATION;

const Hero = async () => {
  const latestVideoResult = await fetchLatestVideo();

  // Fallback to hardcoded values if API fails
  const fallbackVideo = {
    id: "j7F5KNw5F20",
    title: "Casteism in the Cockpit: Indigo's Dark Side Under the Radar",
    description: "Dalit Pilot vs IndiGo Airlines: Explosive casteism allegations revealed in this eye-opening episode. We dive deep into systemic discrimination in India's aviation sector and question the silence of those who claim to speak for Dalit rights."
  };

  const videoData = latestVideoResult.error ? fallbackVideo : latestVideoResult;

  if (!videoData.id) {
    return (
      <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="text-white">Failed to load latest video. Please try again later.</div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative h-screen w-full flex items-end md:items-center overflow-hidden"
    >
      {/* 1. Video Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        {videoData.id && (
          <iframe
            className="hero-video-bg"
            src={`https://www.youtube.com/embed/${videoData.id}?autoplay=1&mute=1&loop=1&start=${LOOP_START}&end=${LOOP_END}&playlist=${videoData.id}&controls=0&showinfo=0&autohide=1&modestbranding=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Hero Video"
          ></iframe>
        )}
      </div>

      {/* 2. Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/60 md:to-transparent z-10"></div>

      {/* 3. Content */}
      <HeroContent
        videoData={{
          id: videoData.id!,
          title: videoData.title || "",
          description: videoData.description || ""
        }}
      />
    </section>
  );
};

export default Hero;