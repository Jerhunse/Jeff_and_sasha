import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addFAQs() {
  try {
    // Find the first published wedding
    const wedding = await prisma.couple.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: 'asc' },
    })

    if (!wedding) {
      console.error('No published wedding found')
      return
    }

    console.log(`Found wedding: ${wedding.partner1Name} & ${wedding.partner2Name}`)

    // Delete existing FAQs
    await prisma.faq.deleteMany({
      where: { coupleId: wedding.id },
    })

    console.log('Cleared existing FAQs')

    // Define all FAQs
    const faqs = [
      {
        question: 'When is the wedding?',
        answer: 'Our wedding will take place on Friday, June 26, 2026.',
        category: null,
        order: 0,
      },
      {
        question: 'Where is the wedding taking place?',
        answer: 'Both the ceremony and reception will be held at The Venue at Stillwater Pond.',
        category: null,
        order: 1,
      },
      {
        question: 'What time should I arrive?',
        answer: 'The ceremony begins at 4:00 PM.\nWe recommend arriving 15–30 minutes early to get settled.',
        category: null,
        order: 2,
      },
      {
        question: 'What is the schedule for the day?',
        answer: 'Ceremony: 4:00 PM\n\nCocktail Hour: 4:30 PM\n\nReception: 5:00 PM\n\nReception Ends: 10:00 PM',
        category: null,
        order: 3,
      },
      {
        question: 'Is the wedding indoors or outdoors?',
        answer: 'Parts of the day may be outdoors, weather permitting. Please plan attire accordingly. A backup plan will be in place if needed.',
        category: null,
        order: 4,
      },
      {
        question: 'What is the dress code?',
        answer: 'The dress code is formal / semi-formal.\nWe encourage guests to dress up and feel their best — think elegant, polished, and celebratory.',
        category: null,
        order: 5,
      },
      {
        question: 'Can I bring a plus-one or children?',
        answer: 'We kindly ask that you only bring the guests listed on your invitation.\nThis helps us keep our day intimate and planned with care. Thank you for understanding!',
        category: null,
        order: 6,
      },
      {
        question: 'Are kids invited?',
        answer: 'While we love your little ones, this celebration will be adults-only, unless otherwise noted on your invitation.',
        category: null,
        order: 7,
      },
      {
        question: 'Will food and drinks be provided?',
        answer: 'Yes! A full dinner and bar service will be provided during the reception.',
        category: null,
        order: 8,
      },
      {
        question: 'Will there be alcohol?',
        answer: 'Yes, there will be a bar available during the reception. Please enjoy responsibly.',
        category: null,
        order: 9,
      },
      {
        question: 'Is parking available at the venue?',
        answer: 'Yes, parking will be available on-site at The Venue at Stillwater Pond.',
        category: null,
        order: 10,
      },
      {
        question: 'Will transportation be provided?',
        answer: 'Transportation details will be shared closer to the wedding date if applicable.',
        category: null,
        order: 11,
      },
      {
        question: 'Can I take photos during the ceremony?',
        answer: 'We kindly ask guests to keep phones and cameras away during the ceremony so everyone can be fully present.\nOur photographer and videographer will capture everything beautifully.',
        category: null,
        order: 12,
      },
      {
        question: 'When will invitations and RSVPs be due?',
        answer: 'Formal invitations will be sent closer to the wedding date.\nPlease submit your RSVP by the date listed so we can finalize details.',
        category: null,
        order: 13,
      },
      {
        question: 'What should I do if I have dietary restrictions?',
        answer: 'You\'ll be able to note any dietary restrictions when you RSVP.',
        category: null,
        order: 14,
      },
      {
        question: 'Are gifts expected?',
        answer: 'Your presence truly means the world to us.\nIf you wish to give a gift, registry details will be shared with the invitations.',
        category: null,
        order: 15,
      },
      {
        question: 'Who can I contact if I have questions?',
        answer: 'For wedding-day questions, please reach out to our coordinator:\nArmani Events & Designs\n\nFor general questions, feel free to contact us directly.',
        category: null,
        order: 16,
      },
      {
        question: 'Anything else we should know?',
        answer: 'Come ready to celebrate, dance, laugh, and make memories with us — we can\'t wait to share this day with you 🤍',
        category: null,
        order: 17,
      },
    ]

    // Create all FAQs
    for (const faq of faqs) {
      await prisma.faq.create({
        data: {
          coupleId: wedding.id,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          order: faq.order,
        },
      })
    }

    console.log(`Created ${faqs.length} FAQs`)

    console.log('\n✅ Successfully added FAQs!')
    console.log(`Total FAQs: ${faqs.length}`)

  } catch (error) {
    console.error('Error adding FAQs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addFAQs()
