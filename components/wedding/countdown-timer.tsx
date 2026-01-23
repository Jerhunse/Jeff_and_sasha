"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  targetDate: Date
  compact?: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ targetDate, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime()

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted) {
    return null
  }

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-card border-2 border-primary/20 rounded-2xl p-4 min-w-[80px] shadow-lg flex items-center justify-center">
        <div className="text-4xl font-serif font-bold text-primary text-center">{value}</div>
      </div>
      <div className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-wider">
        {label}
      </div>
    </div>
  )

  const CompactTimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-card border-2 border-primary/20 rounded-lg px-3 py-2 min-w-[50px] flex items-center justify-center">
        <div className="text-sm font-serif font-bold text-primary text-center">{value}</div>
      </div>
      <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  )

  if (compact) {
    return (
      <div className="flex gap-2 justify-center items-center text-sm text-muted-foreground">
        <CompactTimeUnit value={timeLeft.days} label="Days" />
        <span className="mx-1">:</span>
        <CompactTimeUnit value={timeLeft.hours} label="Hours" />
        <span className="mx-1">:</span>
        <CompactTimeUnit value={timeLeft.minutes} label="Min" />
        <span className="mx-1">:</span>
        <CompactTimeUnit value={timeLeft.seconds} label="Sec" />
      </div>
    )
  }

  return (
    <div className="flex gap-4 justify-center">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  )
}

