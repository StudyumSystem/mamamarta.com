import React, { useState } from "react";

export default function Library() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const images = [
    { id: 1, src: '/assets/rimowa.png', alt: 'Library Image 1' },
    { id: 2, src: '/assets/dyson.png', alt: 'Library Image 2' }
  ];

  return (
    <section id="system" className="relative w-screen h-screen overflow-hidden">
      <div className="md:grid md:grid-cols-2 w-full h-full flex flex-col">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative w-full h-full overflow-hidden group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-300"
            />

            {hoveredIndex === index && (
              <>
                <div
                  className="absolute inset-y-0 left-0 w-1/2 z-10 pointer-events-none"
                  style={{
                    backdropFilter: 'blur(25px)',
                    WebkitBackdropFilter: 'blur(25px)',
                    maskImage: 'linear-gradient(to right, white 1%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, white 1%, transparent)',
                  }}
                />

                <div className="absolute inset-y-0 left-0 w-1/4 flex items-center justify-center z-20">
                  <button
                    className="group/btn flex items-center xs:gap-0.5 xs:rounded-xs xs:border xs:border-white/20 xs:px-2 xs:py-1 xs:text-[0.4rem] xs:font-medium xs:backdrop-blur-md xs:transition-all xs:duration-300 xs:text-white sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[0.5rem] md:gap-3 md:px-5 md:py-2.5 lg:gap-4 lg:px-6 lg:py-3 xl:gap-5 xl:px-7 xl:py-3.5 2xl:gap-6 2xl:px-8 2xl:py-4 gap-3 rounded-xs border border-white/20 text-[0.7rem] font-medium backdrop-blur-md transition-all duration-300 text-white md:gap-3 md:px-5 md:py-2.5 lg:gap-4 lg:px-6 lg:py-3 xl:gap-5 xl:px-7 xl:py-3.5 2xl:gap-6 2xl:px-8 2xl:py-4 sm:text-[0.6rem] md:text-[0.7rem] lg:text-[0.85rem] xl:text-[0.95rem] 2xl:text-[1.1rem]"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(88.11deg, #000000 -8.79%, rgba(0, 0, 0, 0.5) 79.38%)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)'}
                    style={{ background: 'linear-gradient(88.11deg, rgba(0, 0, 0, 0.63) -8.79%, rgba(0, 0, 0, 0.315) 79.38%)' }}
                  >
                    View <span className="transition-transform ">→</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
