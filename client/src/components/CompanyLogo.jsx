import React from "react";

const logos = [
  "slack",
  "framer",
  "netflix",
  "google",
  "linkedin",
  "instagram",
  "facebook",
];

const CompanyLogo = () => {
  return (
    <section className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-12 space-y-6">
      
      {/* Label */}
      <div className="text-center">
        <p className="text-[11px] font-mono tracking-widest text-gray-400 uppercase font-semibold">
          POWERING CREATION AT LEADING TEAMS & BRANDS
        </p>
      </div>

      <div className="overflow-hidden w-full relative max-w-5xl mx-auto select-none py-4 border-y border-white/5 bg-white/[0.01] backdrop-blur-md rounded-2xl">
        
        {/* Left fade */}
        <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none bg-gradient-to-r from-black via-black/80 to-transparent"></div>

        {/* Marquee */}
        <div className="marquee-inner flex items-center will-change-transform min-w-[200%]">
          <div className="flex items-center">
            {[...logos, ...logos].map((name, index) => (
              <img
                key={index}
                className="h-7 w-auto object-contain mx-10 brightness-0 invert opacity-40 hover:opacity-80 transition-opacity duration-300"
                draggable="false"
                src={`https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/companyLogo/${name}.svg`}
                alt={name}
              />
            ))}
          </div>
        </div>

        {/* Right fade */}
        <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none bg-gradient-to-l from-black via-black/80 to-transparent"></div>
      </div>
    </section>
  );
};

export default CompanyLogo;

