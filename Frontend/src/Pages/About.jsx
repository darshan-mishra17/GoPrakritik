import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function About() {
  const [animatedText, setAnimatedText] = useState("");
  const fullText = `Go Prakritik is dedicated to revolutionizing health and wellness by providing organic and natural products. Founded at the young age of 17, the company was born out of a deeply personal and tragic experience. After losing a father to a cardiac arrest, the founder sought answers and discovered that the prevalence of pesticides and processed foods in India significantly contributes to such health issues. Determined to make a difference, the founder embarked on a mission to promote healthier living through natural and organic alternatives.

Since its inception, Go Prakritik has been committed to offering high-quality, eco-friendly products that support a healthier lifestyle. The company's journey began in Jamshedpur, where it started by selling organic goat milk and other natural products. Over time, the range expanded to include items like organic ghee, pink salt, and ashwagandha powder, which are now available across India and on Amazon.

Go Prakritik is not just a business; it is a movement towards sustainable living and better health. The vision is to create a world where people have access to pure, unadulterated products that enhance their well-being and contribute to a healthier planet. Join us in our journey to make natural, organic living a standard for everyone.`;

  const [activeIcon, setActiveIcon] = useState(null);
  //added some emoji and related text
  const icons = [
    { emoji: "🌿", label: "Organic" },
    { emoji: "💚", label: "Healthy" },
    { emoji: "🌍", label: "Sustainable" },
    { emoji: "👨‍🌾", label: "Local Farmers" },
    { emoji: "🔄", label: "Eco-friendly" },
  ];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setAnimatedText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 20); // Adjust typing speed here

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 hover:scale-105"
        style={{
          backgroundImage: 'url("./assets/bg.png")',
          zIndex: -1,
        }}
      />
      <div className="flex items-center justify-center w-full h-full">
        <div className="backdrop-blur-sm bg-green-700/90 rounded-3xl md:rounded-3xl shadow-xl w-full h-full max-w-[95%] sm:max-w-[90%] max-h-[95vh] sm:max-h-[90vh] flex flex-col py-2 md:py-4 transition-all duration-300 hover:shadow-2xl hover:bg-green-700/95">
          <Navbar />
          <div className="flex flex-col md:flex-row h-full p-4 md:p-12 overflow-hidden">
            <div className="w-full md:w-1/2 pr-0 md:pr-8 overflow-y-auto custom-scrollbar">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fadeIn">
                Our <span className="text-green-200">Story</span>
              </h1>
              <p className="text-lg text-white leading-relaxed whitespace-pre-line animate-fadeIn delay-100">
                {animatedText}
                <span className="inline-block ml-1 animate-blink">|</span>
              </p>
            </div>
            
            <div className="w-full md:w-1/2 mt-8 md:mt-0 flex flex-col items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {icons.map((icon, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${activeIcon === index ? 'bg-green-600 scale-110' : 'bg-green-700/80 hover:bg-green-600/90 hover:scale-105'}`}
                    onClick={() => setActiveIcon(index === activeIcon ? null : index)}
                    onMouseEnter={() => setActiveIcon(index)}
                    onMouseLeave={() => setActiveIcon(null)}
                  >
                    <span className="text-3xl mb-2">{icon.emoji}</span>
                    <span className="text-white text-sm font-medium">{icon.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-green-600/80 p-6 rounded-xl w-full max-w-md transition-all duration-500 hover:shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-3">Our Mission</h3>
                <p className="text-white">
                  {activeIcon !== null ? (
                    <span className="animate-fadeIn">
                      {icons[activeIcon].label}: We're committed to {icons[activeIcon].label.toLowerCase()} products that benefit both people and the planet.
                    </span>
                  ) : (
                    "Hover over or click on the values above to learn more about our commitment to organic, sustainable living."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-fadeIn.delay-100 {
          animation-delay: 0.1s;
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}