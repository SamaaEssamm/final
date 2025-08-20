'use client';

import { useState, useEffect } from 'react';

// 20 floating elements with different colors, sizes and positions
const FLOATING_POSITIONS = [
  { top: '15%', left: '10%', size: 60, delay: 0, duration: 15, color: 'rgba(138, 176, 238, 0.7)' },
  { top: '63%', left: '80%', size: 80, delay: 2, duration: 20, color: 'rgba(243, 132, 237, 0.7)' },
  { top: '38%', left: '80%', size: 50, delay: 4, duration: 18, color: 'rgba(240, 145, 145, 0.6)' },
  { top: '77%', left: '15%', size: 70, delay: 1, duration: 22, color: 'rgba(133, 241, 133, 0.6)' },
  { top: '26%', left: '50%', size: 40, delay: 3, duration: 17, color: 'rgba(245, 158, 11, 0.6)' },
  { top: '75%', left: '30%', size: 90, delay: 1.5, duration: 19, color: 'rgba(236, 72, 153, 0.6)' },
  { top: '21%', left: '20%', size: 105, delay: 2.5, duration: 16, color: 'rgba(6, 182, 212, 0.6)' },
  { top: '14%', left: '60%', size: 85, delay: 0.5, duration: 21, color: 'rgba(173, 127, 236, 0.6)' },
  { top: '90%', left: '90%', size: 15, delay: 3, duration: 29, color: 'rgba(250, 211, 140, 0.6)' },
  { top: '70%', left: '20%', size: 25, delay: 3.5, duration: 11, color: 'rgba(235, 247, 135, 0.6)' },
  { top: '10%', left: '40%', size: 35, delay: 4.5, duration: 24, color: 'rgba(109, 236, 215, 0.6)' },
  { top: '22%', left: '85%', size: 55, delay: 1.2, duration: 14, color: 'rgba(255, 182, 193, 0.6)' },
  { top: '75%', left: '65%', size: 75, delay: 2.8, duration: 19, color: 'rgba(135, 206, 250, 0.6)' },
  { top: '45%', left: '5%', size: 45, delay: 0.8, duration: 23, color: 'rgba(221, 160, 221, 0.6)' },
  { top: '75%', left: '55%', size: 65, delay: 3.2, duration: 17, color: 'rgba(152, 251, 152, 0.6)' },
  { top: '20%', left: '35%', size: 85, delay: 1.7, duration: 21, color: 'rgba(255, 215, 0, 0.6)' },
  { top: '55%', left: '90%', size: 35, delay: 4.2, duration: 15, color: 'rgba(250, 128, 114, 0.6)' },
  { top: '12%', left: '70%', size: 95, delay: 2.3, duration: 26, color: 'rgba(176, 224, 230, 0.6)' },
  { top: '75%', left: '45%', size: 25, delay: 3.8, duration: 13, color: 'rgba(255, 218, 185, 0.6)' },
  { top: '50%', left: '10%', size: 105, delay: 0.3, duration: 28, color: 'rgba(216, 191, 216, 0.6)' }
];

// Predefined particles for the card (to avoid hydration errors)
const CARD_PARTICLES = [
  { width: 7, height: 7, top: '15%', left: '20%', duration: 12, delay: 0, opacity: 0.4 },
  { width: 5, height: 5, top: '75%', left: '80%', duration: 8, delay: 2, opacity: 0.2 },
  { width: 9, height: 9, top: '35%', left: '65%', duration: 15, delay: 1, opacity: 0.3 },
  { width: 4, height: 4, top: '85%', left: '25%', duration: 10, delay: 3, opacity: 0.5 },
  { width: 6, height: 6, top: '45%', left: '45%', duration: 14, delay: 0.5, opacity: 0.2 },
  { width: 8, height: 8, top: '25%', left: '85%', duration: 9, delay: 2.5, opacity: 0.4 },
  { width: 5, height: 5, top: '65%', left: '15%', duration: 11, delay: 1.5, opacity: 0.3 },
  { width: 7, height: 7, top: '55%', left: '75%', duration: 13, delay: 0.8, opacity: 0.4 },
  { width: 6, height: 6, top: '15%', left: '55%', duration: 16, delay: 3.2, opacity: 0.2 },
  { width: 8, height: 8, top: '85%', left: '35%', duration: 7, delay: 4, opacity: 0.3 }
];

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-indigo-900/70">
      {/* Main background with increased transparency */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/1719835311862.jpeg')] bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/50"></div>
      </div>
      
      {/* Animated grid pattern for additional texture */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:50px_50px]"></div>
      </div>

      {/* Shiny floating elements with enhanced glow */}
      <div className="absolute inset-0 z-0">
        {FLOATING_POSITIONS.map((pos, i) => (
          <div 
            key={i}
            className="absolute rounded-full backdrop-blur-sm"
            style={{
              width: `${pos.size}px`,
              height: `${pos.size}px`,
              top: pos.top,
              left: pos.left,
              animation: `float ${pos.duration}s infinite ease-in-out`,
              animationDelay: `${pos.delay}s`,
              backgroundColor: pos.color,
              boxShadow: `
                0 0 60px ${pos.color},
                0 0 100px ${pos.color},
                inset 0 0 40px rgba(255, 255, 255, 0.5)
              `,
              filter: 'brightness(1.2) contrast(1.2)'
            }}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Logos */}
        <header className="flex justify-between items-center px-6 py-6 sm:px-10">
          <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <img
                src="/fci_new_logo2.png"
                alt="Faculty Logo"
                className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-lg mb-1"
              />
              <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-md"></div>
            </div>
          </div>
          <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <img
                src="/assuitUnivirsity.png"
                alt="University Logo"
                className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-lg mb-1"
              />
              <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-md"></div>
            </div>
          </div>
        </header>

        {/* Main Content - vibrant card */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-10">
          <div className="max-w-3xl bg-gradient-to-br from-blue-900/70 to-indigo-900/80 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl relative overflow-hidden">
            {/* Content glow effect */}
            <div className="absolute -inset-3 bg-blue-500/30 rounded-2xl blur-xl -z-10"></div>
            
            {/* Animated particles inside card - using predefined values */}
            <div className="absolute inset-0 -z-10 opacity-30">
              {CARD_PARTICLES.map((particle, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: `${particle.width}px`,
                    height: `${particle.height}px`,
                    top: particle.top,
                    left: particle.left,
                    animation: `float ${particle.duration}s infinite ease-in-out`,
                    animationDelay: `${particle.delay}s`,
                    opacity: particle.opacity
                  }}
                ></div>
              ))}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                Speak Up
              </span>{' '}
              for a Better Faculty
            </h1>
            
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Your voice shapes our community. Share your complaints and suggestions to help us improve together.
            </p>
            
            <div 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="inline-block relative"
            >
              <div className={`absolute -inset-3 bg-blue-400/40 rounded-lg blur-lg transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
              <a
                href="/login"
                className="relative bg-gradient-to-r from-[#003087] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-10 rounded-lg shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center border border-blue-400/40"
              >
                Get Started
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </a>
            </div>
          </div>
        </main>

        {/* Vibrant Footer */}
        <footer className="text-sm text-white text-center py-6 mx-6 rounded-lg border border-white/20 bg-gradient-to-b from-blue-800/60 to-indigo-900/70 backdrop-blur-md shadow-lg">
          <p className="font-medium">© 2025 Assiut University - Faculty of Computer & Information</p>
          <p className="mt-1 text-blue-100">Together we build a better future</p>
          
          {/* Footer decorative elements */}
          <div className="flex justify-center space-x-3 mt-3">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full bg-blue-300 opacity-60"
                style={{
                  animation: `pulse 2s infinite`,
                  animationDelay: `${i * 0.3}s`
                }}
              ></div>
            ))}
          </div>
        </footer>
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
        }
        
        /* Enhanced glow animation for floating elements */
        @keyframes glow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}