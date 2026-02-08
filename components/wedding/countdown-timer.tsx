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

  const cardStyle =
    "bg-card rounded-[18px] p-3 md:p-4 min-w-[60px] md:min-w-[80px] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-[rgba(212,175,55,0.3)]"
  const compactCardStyle =
    "bg-card rounded-[16px] px-2 py-1.5 md:px-3 md:py-2 min-w-[45px] md:min-w-[50px] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-[rgba(212,175,55,0.3)]"

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="font-serif text-4xl lg:text-5xl text-gold tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-widest mt-2 text-zinc-400">
        {label}
      </span>
    </div>
  )

  const CompactTimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className={compactCardStyle}>
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
    <div className="grid grid-cols-4 gap-4 lg:gap-8 w-full max-w-md">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  )
}

