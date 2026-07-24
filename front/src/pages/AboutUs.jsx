import React from 'react';
import Layout from '../components/Layout';
import suitImg from '../assets/suit.png';
import wooden_clock from '../assets/wooden_clock.png';

const AboutUs = () => {
  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Header Section */}
        <section className="relative py-24 bg-[#F8F9FA] flex flex-col items-center justify-center text-center px-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Our Story</p>
          <h1 className="text-5xl md:text-6xl font-serif text-gray-900 leading-tight max-w-3xl">
            Redefining Modern Elegance.
          </h1>
        </section>

        {/* Philosophy Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="lg:w-1/2">
              <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden">
                <img src={suitImg} alt="Our Philosophy" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="lg:w-1/2">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6">Philosophy</p>
              <h2 className="text-4xl font-serif text-gray-900 leading-[1.2] mb-8">
                The Art of Fewer, Better Things
              </h2>
              <div className="text-sm text-gray-500 leading-relaxed space-y-6 max-w-lg">
                <p>
                  At AEIRA, we believe that true luxury lies in simplicity and craftsmanship. Founded with a vision to create timeless pieces, our collections are designed for those who appreciate the finer details.
                </p>
                <p>
                  We source only the highest quality materials, working with skilled artisans who share our commitment to excellence. Every garment is thoughtfully constructed to endure both time and trends, allowing you to build a wardrobe of lasting value.
                </p>
                <p>
                  Our commitment extends beyond aesthetics. We strive to maintain sustainable practices, ensuring that our impact on the environment is as refined as our aesthetic.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Craftsmanship Section */}
        <section className="bg-[#111111] text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
              <div className="lg:w-1/2">
                <div className="aspect-[4/3] w-full bg-gray-800 overflow-hidden">
                  <img src={wooden_clock} alt="Craftsmanship" className="w-full h-full object-cover opacity-80" />
                </div>
              </div>
              <div className="lg:w-1/2">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6">Craftsmanship</p>
                <h2 className="text-4xl font-serif text-white leading-[1.2] mb-8">
                  Meticulous Attention to Detail
                </h2>
                <div className="text-sm text-gray-400 leading-relaxed space-y-6 max-w-lg">
                  <p>
                    From the initial sketch to the final stitch, our process is a testament to the art of tailoring. We do not rush perfection. Instead, we embrace the slow, deliberate work required to create something truly exceptional.
                  </p>
                  <p>
                    Each piece in our collection is a harmony of structure and fluidity, designed to move with you and elevate your everyday experience. Discover the confidence that comes from wearing garments crafted with unparalleled passion and precision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutUs;
