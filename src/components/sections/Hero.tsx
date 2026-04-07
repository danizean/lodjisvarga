"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Users, Search } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex text-center flex-col justify-end pb-24 md:pb-32 font-sans overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
          alt="Luxury Villa in Yogyakarta"
          fill
          className="object-cover"
          priority
        />
        {/* Deep Olive Gradient Overlay for Text Readability - linear gradient from bottom to top */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(58, 74, 31, 1) 0%, rgba(58, 74, 31, 0.4) 50%, rgba(58, 74, 31, 0.1) 100%)"
          }} 
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full container mx-auto px-4 sm:px-6 lg:px-8 mt-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter mb-6 max-w-5xl drop-shadow-lg leading-tight md:leading-tight">
          Elevate Your Stay in<br className="hidden md:block" /> the Heart of Yogyakarta
        </h1>
        <p className="text-lg md:text-2xl text-white/95 mb-14 max-w-3xl font-light drop-shadow-md">
          Experience unparalleled luxury and serenity in our handpicked private villas.
        </p>

        {/* Floating Search Bar */}
        <div className="w-full max-w-5xl bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl md:rounded-full p-2 md:p-3 shadow-2xl">
          <div className="bg-white rounded-2xl md:rounded-full p-2 md:pl-8 md:pr-2 py-4 md:py-2 flex flex-col md:flex-row items-center gap-4">
            
            {/* Check-In */}
            <div className="flex-1 w-full flex items-center gap-4 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200">
              <CalendarIcon className="w-6 h-6 text-[#3A4A1F] shrink-0" />
              <div className="flex flex-col text-left w-full">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Check In</label>
                <input 
                  type="date" 
                  className="w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-gray-900 font-semibold cursor-pointer appearance-none"
                />
              </div>
            </div>

            {/* Check-Out */}
            <div className="flex-1 w-full flex items-center gap-4 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200">
              <CalendarIcon className="w-6 h-6 text-[#3A4A1F] shrink-0" />
              <div className="flex flex-col text-left w-full">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Check Out</label>
                <input 
                  type="date" 
                  className="w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-gray-900 font-semibold cursor-pointer appearance-none"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="flex-1 w-full flex items-center gap-4 px-4 py-2">
              <Users className="w-6 h-6 text-[#3A4A1F] shrink-0" />
              <div className="flex flex-col text-left w-full">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Guests</label>
                <input 
                  type="number" 
                  min="1"
                  placeholder="2 Guests"
                  className="w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-gray-900 font-semibold placeholder:text-gray-900 appearance-none"
                />
              </div>
            </div>

            {/* CTA Search Button */}
            <Button size="lg" className="w-full md:w-auto rounded-xl md:rounded-full h-16 md:h-14 px-10 bg-[#3A4A1F] hover:bg-[#6E8F3B] text-white transition-all duration-300 shadow-xl group text-base mt-2 md:mt-0 shrink-0">
              <Search className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Check Availability
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
