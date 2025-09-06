import { Play, Star } from "lucide-react";
import Image from "next/image";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative h-screen w-full flex flex-col md:flex-row items-end md:items-center overflow-hidden"
    >
      {/* 1. Video Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <iframe
          className="hero-video-bg"
          src="https://www.youtube.com/embed/j7F5KNw5F20?autoplay=1&mute=1&loop=1&playlist=j7F5KNw5F20&controls=0&showinfo=0&autohide=1&modestbranding=1"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>

      {/* 2. Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/60 md:to-transparent z-10"></div>

      {/* 3. Content */}
      <div className="relative z-20 container mx-auto px-6 w-full text-center md:text-left">
        <div className="w-full md:w-1/2 lg:w-2/5 py-16 md:py-0">
          {/* Branding */}
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <Image
              src="/NEW LOGO.png"
              alt="Dialogus Logo Icon"
              width={100}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-gray-300 font-semibold tracking-wider text-sm">
              Clarity in a World of Noise
            </span>
          </div>

          {/* Title */}
          <h1 className="hero-title text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Casteism in the Cockpit: Indigo&apos;s Dark Side Under the Radar
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-base mb-8">
            Dalit Pilot vs IndiGo Airlines: Explosive casteism allegations
            revealed in this eye-opening episode. We dive deep into systemic
            discrimination in India&apos;s aviation sector and question the
            silence of those who claim to speak for Dalit rights.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center md:justify-start gap-4">
            <a
              href="https://www.youtube.com/watch?v=j7F5KNw5F20"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-cta inline-flex items-center gap-2 text-white font-semibold py-3 px-6 rounded-full"
            >
              <Play size={20} fill="currentColor" />
              Watch Now
            </a>
            <a
              href="#"
              className="subscribe-cta inline-flex items-center gap-2 font-semibold py-3 px-6 rounded-full"
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
