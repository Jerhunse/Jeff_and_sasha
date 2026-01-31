"use client"

import { Calendar as CalendarIcon } from "lucide-react"
import Image from "next/image"

interface WeddingCalendarProps {
  weddingDate: Date
}

export function WeddingCalendar({ weddingDate }: WeddingCalendarProps) {
  const date = new Date(weddingDate)
  const year = date.getFullYear()
  const month = date.getMonth()
  const weddingDay = date.getDate()

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  
  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Month name
  const monthName = date.toLocaleDateString("en-US", { month: "long" })
  
  // Create array of days to render
  const days = []
  
  // Add empty slots for days before first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  
  // Add all days in month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

  return (
    <section className="relative py-12 md:py-20 px-4 md:px-6" style={{ backgroundColor: "#708C5C" }}>
      <div className="max-w-6xl mx-auto">
        {/* Two column layout: Photo on left, Calendar on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Polaroid Photo */}
          <div className="flex justify-center lg:justify-end">
            <div 
              className="relative bg-white p-3 md:p-4 pb-10 md:pb-12 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-300"
              style={{ width: "min(90vw, 380px)", maxWidth: "100%" }}
            >
              <div className="relative w-full aspect-square bg-gray-100">
                <Image
                  src="/couple-photo.png"
                  alt="Wedding Couple"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-center mt-3 md:mt-4 font-cursive text-xl md:text-2xl text-[#708C5C]">
                Moments
              </p>
            </div>
          </div>

          {/* Right: Calendar */}
          <div className="flex flex-col items-center lg:items-start">
            {/* Header */}
            <div className="text-center lg:text-left mb-6 md:mb-8">
              <h2 className="font-sans text-lg md:text-xl lg:text-2xl tracking-wider mb-2" style={{ color: "#D4C8B8" }}>
                SAVE THE DATE
              </h2>
              <p className="font-sans text-sm md:text-base tracking-widest" style={{ color: "#D4C8B8" }}>
                {monthName} {year}
              </p>
            </div>

            {/* Calendar Card */}
            <div className="w-full max-w-md px-2 md:px-0">
              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 md:mb-4">
                {dayNames.map((dayName) => (
                  <div
                    key={dayName}
                    className="text-center font-sans text-xs font-light tracking-wider lowercase"
                    style={{ color: "#D4C8B8" }}
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {days.map((day, index) => {
                  const isWeddingDay = day === weddingDay
                  
                  return (
                    <div
                      key={index}
                      className="aspect-square flex items-center justify-center relative"
                    >
                      {day && (
                        <div
                          className={`
                            w-full h-full flex items-center justify-center
                            font-sans text-xs md:text-sm lg:text-base
                            transition-all duration-300
                            ${
                              isWeddingDay
                                ? "rounded-full border-2 scale-110"
                                : ""
                            }
                          `}
                          style={
                            isWeddingDay
                              ? { color: "#D4C8B8", borderColor: "#D4C8B8" }
                              : { color: "#D4C8B8" }
                          }
                        >
                          {day}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add to Calendar Button */}
              <div className="mt-6 md:mt-8 text-center lg:text-left">
                <button
                  className="px-6 py-2.5 md:py-2 border font-sans text-xs md:text-sm tracking-widest uppercase transition-all duration-300 hover:bg-white/10 min-h-[44px]"
                  style={{ color: "#D4C8B8", borderColor: "#D4C8B8" }}
                >
                  ADD TO CALENDAR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 mt-12 md:mt-16">
          <div className="h-px w-12 md:w-16" style={{ backgroundColor: "rgba(212, 200, 184, 0.3)" }} />
          <CalendarIcon className="h-4 w-4 md:h-5 md:w-5" style={{ color: "rgba(212, 200, 184, 0.5)" }} />
          <div className="h-px w-12 md:w-16" style={{ backgroundColor: "rgba(212, 200, 184, 0.3)" }} />
        </div>
      </div>
    </section>
  )
}
