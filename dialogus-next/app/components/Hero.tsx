import { Play, Star } from "lucide-react";
import { useState, useEffect } from "react";

const Hero = () => {
  const [latestVideo, setLatestVideo] = useState<{
    id?: string;
    title?: string;
    description?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestVideo = async () => {
      try {
        const response = await fetch('/api/youtube/latest-video');
        const data = await response.json();
        
        if (data.error) {
          console.error("Error fetching latest video:", data.error);
          // Fallback to hardcoded values if API fails
          setLatestVideo({
            id: "j7F5KNw5F20",
            title: "Casteism in the Cockpit: Indigo's Dark Side Under the Radar",
            description: "Dalit Pilot vs IndiGo Airlines: Explosive casteism allegations revealed in this eye-opening episode. We dive deep into systemic discrimination in India's aviation sector and question the silence of those who claim to speak for Dalit rights."
          });
        } else {
          setLatestVideo(data);
        }
      } catch (error) {
        console.error("Error fetching latest video:", error);
        // Fallback to hardcoded values
        setLatestVideo({
          id: "j7F5KNw5F20",
          title: "Casteism in the Cockpit: Indigo's Dark Side Under the Radar",
          description: "Dalit Pilot vs IndiGo Airlines: Explosive casteism allegations revealed in this eye-opening episode. We dive deep into systemic discrimination in India's aviation sector and question the silence of those who claim to speak for Dalit rights."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestVideo();
  }, []);

  if (isLoading) {
    return (
      <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="text-white">Loading latest video...</div>
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
        {latestVideo.id && (
          <iframe
            className="hero-video-bg"
            src={`https://www.youtube.com/embed/${latestVideo.id}?autoplay=1&mute=1&loop=1&playlist=${latestVideo.id}&controls=0&showinfo=0&autohide=1&modestbranding=1`}
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
      <div className="relative z-20 container mx-auto px-4 sm:px-6 w-full text-center md:text-left">
        <div className="w-full md:w-3/4 lg:w-1/2 xl:w-2/5 pb-12 sm:pb-16 md:py-0">
          {/* Title */}
          <h1 className="hero-title text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-tight">
            {latestVideo.title || "Latest Video"}
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-8">
            {latestVideo.description || "Loading description..."}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <a
              href={`https://www.youtube.com/watch?v=${latestVideo.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-cta w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-semibold py-3 px-6 rounded-full"
            >
              <Play size={20} fill="currentColor" />
              Watch Now
            </a>
            <a
              href="https://www.youtube.com/@Dialogusdigital"
              target="_blank"
              rel="noopener noreferrer"
              className="subscribe-cta w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-full"
            >
              <Star size={20} className="text-yellow-400" fill="currentColor" />
              Subscribe to Dialogus
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;