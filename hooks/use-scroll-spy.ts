"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook that uses IntersectionObserver to detect which section
 * is currently in view and return its ID for navigation highlighting.
 * 
 * @param sectionIds - Array of section IDs to observe
 * @param options - IntersectionObserver options
 * @returns The ID of the currently active section
 */
export function useScrollSpy(
  sectionIds: string[],
  options?: IntersectionObserverInit
) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // Default options: trigger when section is 20% visible from top
    const defaultOptions: IntersectionObserverInit = {
      rootMargin: "-20% 0px -35% 0px",
      threshold: 0,
      ...options,
    }

    const observer = new IntersectionObserver((entries) => {
      // Find the most visible section
      let maxRatio = 0
      let mostVisibleId = ""

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio
          mostVisibleId = entry.target.id
        }
      })

      // If we found a visible section, set it as active
      if (mostVisibleId) {
        setActiveId(mostVisibleId)
      } else {
        // If no section is intersecting, check which one we're closest to
        entries.forEach((entry) => {
          if (entry.boundingClientRect.top > 0) {
            // Section is below viewport - we haven't reached it yet
            return
          }
          // Section is above or at viewport - this is likely the active one
          setActiveId(entry.target.id)
        })
      }
    }, defaultOptions)

    // Observe all sections
    const elements: Element[] = []
    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
        elements.push(element)
      }
    })

    // Set initial active section based on scroll position
    const checkInitialSection = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3
      
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const element = document.getElementById(sectionIds[i])
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(sectionIds[i])
          break
        }
      }
    }
    
    checkInitialSection()

    // Cleanup
    return () => {
      elements.forEach((element) => observer.unobserve(element))
    }
  }, [sectionIds, options])

  return activeId
}
