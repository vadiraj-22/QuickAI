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
    <div className="overflow-hidden w-full relative max-w-5xl mx-auto select-none">
      
      {/* Left fade */}
      <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent"></div>

      {/* Marquee */}
      <div className="marquee-inner flex will-change-transform min-w-[200%]">
        <div className="flex">
          {[...logos, ...logos].map((name, index) => (
            <img
              key={index}
              className="w-full h-full object-cover mx-6"
              draggable="false"
              src={`https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/companyLogo/${name}.svg`}
              alt={name}
            />
          ))}
        </div>
      </div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent"></div>
    </div>
  );
};

export default CompanyLogo;
