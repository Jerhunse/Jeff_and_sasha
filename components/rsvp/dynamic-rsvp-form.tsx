"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Heart, Loader2, CheckCircle, Calendar } from "lucide-react"

interface Question {
  id: string
  text: string
  description?: string
  type: string
  options: string[]
  placeholder?: string
  required: boolean
  order: number
}

interface Event {
  id: string
  name: string
  startTime: Date
  endTime?: Date
  location?: string
}

interface DynamicRsvpFormProps {
  token: string
}

export function DynamicRsvpForm({ token }: DynamicRsvpFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [guestData, setGuestData] = useState<any>(null)
  const [coupleData, setCoupleData] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [existingResponses, setExistingResponses] = useState<any[]>([])

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [message, setMessage] = useState<string>("")

  // Plus-one state
  const [hasPlusOne, setHasPlusOne] = useState(false)
  const [plusOneData, setPlusOneData] = useState({
    name: "",
    email: "",
    answers: {} as Record<string, any>,
  })

  // Fetch RSVP data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/rsvp/${token}`)
        if (!response.ok) {
          throw new Error("Failed to fetch RSVP data")
        }

        const data = await response.json()
        setGuestData(data.guest)
        setCoupleData(data.couple)
        setEvents(data.events || [])
        setQuestions(data.questions || [])
        setExistingResponses(data.existingResponses || [])

        // Set default event if only one
        if (data.events && data.events.length === 1) {
          setSelectedEventId(data.events[0].id)
        }

        // Pre-fill if existing response
        if (data.existingResponses && data.existingResponses.length > 0) {
          const lastResponse = data.existingResponses[0]
          setStatus(lastResponse.status)
          if (lastResponse.answersJSON) {
            setAnswers(JSON.parse(lastResponse.answersJSON))
          }
        }

        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handlePlusOneAnswerChange = (questionId: string, value: any) => {
    setPlusOneData({
      ...plusOneData,
      answers: { ...plusOneData.answers, [questionId]: value },
    })
  }

  const renderQuestion = (
    question: Question,
    answerValue: any,
    onChange: (value: any) => void,
    idPrefix: string = ""
  ) => {
    const inputId = `${idPrefix}question-${question.id}`

    switch (question.type) {
      case "TEXT":
      case "EMAIL":
      case "PHONE":
        return (
          <Input
            id={inputId}
            type={question.type === "EMAIL" ? "email" : question.type === "PHONE" ? "tel" : "text"}
            value={answerValue || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            required={question.required}
          />
        )

      case "TEXTAREA":
        return (
          <Textarea
            id={inputId}
            value={answerValue || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            required={question.required}
          />
        )

      case "NUMBER":
        return (
          <Input
            id={inputId}
            type="number"
            value={answerValue || ""}
            onChange={(e) => onChange(parseInt(e.target.value))}
            placeholder={question.placeholder}
            required={question.required}
          />
        )

      case "YES_NO":
        return (
          <Select
            value={answerValue || ""}
            onValueChange={onChange}
            required={question.required}
          >
            <SelectTrigger id={inputId}>
              <SelectValue placeholder="Please select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        )

      case "SINGLE_SELECT":
      case "MEAL_CHOICE":
        return (
          <Select
            value={answerValue || ""}
            onValueChange={onChange}
            required={question.required}
          >
            <SelectTrigger id={inputId}>
              <SelectValue placeholder="Please select" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "MULTI_SELECT":
        return (
          <div className="space-y-2">
            {question.options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${inputId}-${option}`}
                  checked={(answerValue || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const current = answerValue || []
                    if (checked) {
                      onChange([...current, option])
                    } else {
                      onChange(current.filter((v: string) => v !== option))
                    }
                  }}
                />
                <Label
                  htmlFor={`${inputId}-${option}`}
                  className="cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case "DATE":
        return (
          <Input
            id={inputId}
            type="date"
            value={answerValue || ""}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
          />
        )

      case "DIETARY":
        return (
          <Textarea
            id={inputId}
            value={answerValue || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Allergies, dietary requirements, etc."
            rows={3}
          />
        )

      default:
        return (
          <Input
            id={inputId}
            value={answerValue || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
          />
        )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!status) {
      setError("Please select your RSVP status")
      setIsSubmitting(false)
      return
    }

    // Validate required questions
    const requiredQuestions = questions.filter((q) => q.required)
    for (const q of requiredQuestions) {
      if (!answers[q.id]) {
        setError(`Please answer: ${q.text}`)
        setIsSubmitting(false)
        return
      }
    }

    if (hasPlusOne && !plusOneData.name) {
      setError("Please provide your plus one's name")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/rsvp/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          status,
          answers,
          message,
          plusOne: hasPlusOne ? plusOneData : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit RSVP")
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push(`/${coupleData.slug}`)
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !guestData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              Your RSVP has been submitted successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the wedding website...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">
            RSVP for {guestData.firstName} {guestData.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Selection (if multiple events) */}
          {events.length > 1 && (
            <div className="space-y-2 pb-4 border-b">
              <Label className="text-base">Select Event</Label>
              <Select
                value={selectedEventId || ""}
                onValueChange={setSelectedEventId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {event.name} -{" "}
                        {new Date(event.startTime).toLocaleDateString()}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* RSVP Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-base">
              Will you be attending? <span className="text-red-500">*</span>
            </Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger id="status">
                <SelectValue placeholder="Please select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YES">✓ Joyfully Accepts</SelectItem>
                <SelectItem value="NO">✗ Regretfully Declines</SelectItem>
                <SelectItem value="MAYBE">? Tentatively Accepts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "YES" && (
            <>
              {/* Dynamic Questions */}
              {questions.map((question) => (
                <div key={question.id} className="space-y-2 pt-4 border-t">
                  <Label htmlFor={`question-${question.id}`} className="text-base">
                    {question.text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {question.description && (
                    <p className="text-sm text-muted-foreground">
                      {question.description}
                    </p>
                  )}
                  {renderQuestion(
                    question,
                    answers[question.id],
                    (value) => handleAnswerChange(question.id, value)
                  )}
                </div>
              ))}

              {/* Plus-One Section */}
              {(guestData.plusOnePolicy === "named" ||
                guestData.plusOnePolicy === "unnamed") && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPlusOne"
                      checked={hasPlusOne}
                      onCheckedChange={(checked) =>
                        setHasPlusOne(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="hasPlusOne"
                      className="text-base cursor-pointer"
                    >
                      I'm bringing a plus one
                    </Label>
                  </div>

                  {hasPlusOne && (
                    <div className="space-y-4 ml-6 p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium">Plus One Information</h4>

                      <div className="space-y-2">
                        <Label htmlFor="plusOneName">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="plusOneName"
                          value={plusOneData.name}
                          onChange={(e) =>
                            setPlusOneData({
                              ...plusOneData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Guest's full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="plusOneEmail">Email (Optional)</Label>
                        <Input
                          id="plusOneEmail"
                          type="email"
                          value={plusOneData.email}
                          onChange={(e) =>
                            setPlusOneData({
                              ...plusOneData,
                              email: e.target.value,
                            })
                          }
                          placeholder="guest@email.com"
                        />
                      </div>

                      {/* Plus-one questions */}
                      {questions.filter((q) => q.type === "MEAL_CHOICE" || q.type === "DIETARY").map((question) => (
                        <div key={`plusone-${question.id}`} className="space-y-2">
                          <Label htmlFor={`plusone-question-${question.id}`}>
                            {question.text} (for plus one)
                          </Label>
                          {renderQuestion(
                            question,
                            plusOneData.answers[question.id],
                            (value) => handlePlusOneAnswerChange(question.id, value),
                            "plusone-"
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Message */}
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="message" className="text-base">
                  Message to the Couple (Optional)
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your excitement or well wishes..."
                  rows={4}
                />
              </div>
            </>
          )}

          {status === "NO" && (
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="message" className="text-base">
                Message (Optional)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="We'll miss you! Let us know if anything changes."
                rows={4}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Submit RSVP
              </>
            )}
          </Button>

          {coupleData.rsvpDeadline && (
            <p className="text-sm text-center text-muted-foreground">
              Please respond by{" "}
              {new Date(coupleData.rsvpDeadline).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </form>
  )
}

