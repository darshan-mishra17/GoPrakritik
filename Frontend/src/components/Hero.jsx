import React from "react";

export default function Hero() {
    return(
        <div className="flex items-center md:mx-[6rem] md:my-[2rem]">
            <div className="max-w-2xl">
              <h1 className="text-white text-6xl font-bold mb-6 leading-[1.3]">
                Discover the Best
                <br />
                Organic Products
                <br />
                Here
              </h1>
              <p className="text-white/90 text-xl italic mb-10">
                Explore our wide range of organic products, including goat milk
                and more!
              </p>
              <button className="bg-white text-xl text-green-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition duration-300">
                Buy now
              </button>
            </div>
          </div>
    )
}