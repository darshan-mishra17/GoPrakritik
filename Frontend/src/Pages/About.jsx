import Navbar from "../components/Navbar";

export default function About() {

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("./assets/bg.png")',
          zIndex: -1,
        }}
      />
      <div className="flex items-center justify-center w-full h-full">
        <div className="backdrop-blur-sm bg-green-700/90 rounded-3xl md:rounded-3xl shadow-xl w-full h-full max-w-[95%] sm:max-w-[90%] max-h-[95vh] sm:max-h-[90vh] flex flex-col py-2 md:py-4">
          <Navbar />
          <div className=" flex flex-wrap text-lg p-12 text-white">
            <p>
            Go Prakritik is dedicated to revolutionizing health and wellness by providing organic and natural products 🌿. Founded at the young age of 17 👦, the company was born out of a deeply personal and tragic experience. After losing a father to a cardiac arrest 💔, the founder sought answers and discovered that the prevalence of pesticides and processed foods in India significantly contributes to such health issues ⚠️. Determined to make a difference, the founder embarked on a mission to promote healthier living through natural and organic alternatives 🌍.    (Line break)   Since its inception, Go Prakritik has been committed to offering high-quality, eco-friendly products that support a healthier lifestyle 🌾. The company's journey began in Jamshedpur, where it started by selling organic goat milk and other natural products 🥛. Over time, the range expanded to include items like organic ghee, pink salt, and ashwagandha powder, which are now available across India and on Amazon 🇮🇳.   (Line break)    Prakritik is not just a business; it is a movement towards sustainable living and better health 🌟. The vision is to create a world where people have access to pure, unadulterated products that enhance their well-being and contribute to a healthier planet 🌏. Join us in our journey to make natural, organic living a standard for everyone 🌱🌿.
            </p>
          </div>
          <div className="flex-1 overflow-auto">
          </div>
        </div>
      </div>
    </div>
  );
}
