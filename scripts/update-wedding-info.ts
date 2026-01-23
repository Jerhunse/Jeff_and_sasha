import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateWeddingInfo() {
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

    // Wedding date: June 26, 2026
    const weddingDate = new Date('2026-06-26T16:00:00.000Z') // 4pm ceremony

    // Update wedding details
    await prisma.couple.update({
      where: { id: wedding.id },
      data: {
        weddingDate,
        venueName: 'The Venue at Stillwater Pond',
        venueAddress: '175 Pollard Rd',
        venueCity: 'Temple',
        venueState: 'GA',
        venueZip: '30179',
        venueCountry: 'United States',
      },
    })

    console.log('Updated wedding date and venue information')

    // Delete existing events for this wedding
    await prisma.event.deleteMany({
      where: { coupleId: wedding.id },
    })

    console.log('Cleared existing events')

    // Create schedule events
    const baseDate = '2026-06-26'
    
    const events = [
      {
        name: 'Venue Available for Family & Bridal Party',
        description: 'The venue will be open for family and bridal party members to arrive and prepare for the ceremony.',
        startTime: new Date(`${baseDate}T09:00:00-04:00`),
        endTime: new Date(`${baseDate}T22:00:00-04:00`),
        location: 'The Venue at Stillwater Pond',
        address: '175 Pollard Rd, Temple, GA 30179',
        visibility: 'PRIVATE' as const,
        order: 0,
      },
      {
        name: 'Wedding Party & Family Photos',
        description: 'Photos with wedding party and family members before the ceremony.',
        startTime: new Date(`${baseDate}T14:00:00-04:00`),
        endTime: new Date(`${baseDate}T16:00:00-04:00`),
        location: 'The Venue at Stillwater Pond',
        address: '175 Pollard Rd, Temple, GA 30179',
        visibility: 'PRIVATE' as const,
        order: 1,
      },
      {
        name: 'Ceremony',
        description: 'Join us as we exchange our vows and begin our journey together.',
        startTime: new Date(`${baseDate}T16:00:00-04:00`),
        endTime: new Date(`${baseDate}T16:30:00-04:00`),
        location: 'The Venue at Stillwater Pond',
        address: '175 Pollard Rd, Temple, GA 30179',
        attire: 'Semi-Formal',
        visibility: 'PUBLIC' as const,
        order: 2,
      },
      {
        name: 'Cocktail Hour',
        description: 'Enjoy drinks and hors d\'oeuvres while we take photos with the wedding party.',
        startTime: new Date(`${baseDate}T16:30:00-04:00`),
        endTime: new Date(`${baseDate}T17:00:00-04:00`),
        location: 'The Venue at Stillwater Pond',
        address: '175 Pollard Rd, Temple, GA 30179',
        visibility: 'PUBLIC' as const,
        order: 3,
      },
      {
        name: 'First Dance & Dinner',
        description: 'Watch our first dance as a married couple followed by dinner service.',
        startTime: new Date(`${baseDate}T17:00:00-04:00`),
        endTime: new Date(`${baseDate}T17:45:00-04:00`),
        location: 'The Venue at Stillwater Pond',
        address: '175 Pollard Rd, Temple, GA 30179',
        visibility: 'PUBLIC' as const,
        order: 4,
      },
      {
        name: 'Parent Dances, Toasts & Speeches',
        description: 'Special dances with our parents and heartfelt toasts from our loved ones.',
        startTime: new Date(`${baseDate}T17:45:00-04:00`),
        endTime: new Date(`${baseDate}T18:00:00-04:00`),
        location: 'The Venue at Stillwater Pond',
        address: '175 Pollard Rd, Temple, GA 30179',
        visibility: 'PUBLIC' as const,
        order: 5,
      },
      {
        name: 'Dance Floor Open',
        description: 'Let\'s celebrate! Join us on the dance floor for an unforgettable evening.',
        startTime: new Date(`${baseDate}T18:00:00-04:00`),
        endTime: new Date(`${baseDate}T19:00:00-04:00`),
        location: 'The Venue at Stillwater Pond',
        address: '175 Pollard Rd, Temple, GA 30179',
        visibility: 'PUBLIC' as const,
        order: 6,
      },
      {
        name: 'Cake Cutting',
        description: 'Join us for the traditional cake cutting ceremony.',
        startTime: new Date(`${baseDate}T19:00:00-04:00`),
        endTime: new Date(`${baseDate}T19:15:00-04:00`),
        location: 'The Venue at Stillwater Pond',
        address: '175 Pollard Rd, Temple, GA 30179',
        visibility: 'PUBLIC' as const,
        order: 7,
      },
      {
        name: 'Grand Send Off',
        description: 'Help us celebrate with a grand send-off as we begin our new life together!',
        startTime: new Date(`${baseDate}T21:00:00-04:00`),
        endTime: new Date(`${baseDate}T21:15:00-04:00`),
        location: 'The Venue at Stillwater Pond',
        address: '175 Pollard Rd, Temple, GA 30179',
        visibility: 'PUBLIC' as const,
        order: 8,
      },
    ]

    for (const event of events) {
      await prisma.event.create({
        data: {
          coupleId: wedding.id,
          ...event,
        },
      })
    }

    console.log(`Created ${events.length} events`)

    // Delete existing hotels
    await prisma.hotelBlock.deleteMany({
      where: { coupleId: wedding.id },
    })

    console.log('Cleared existing hotels')

    // Add hotels from the table
    const hotels = [
      {
        name: 'Courtyard Carrollton',
        address: 'Courtyard Carrollton',
        city: 'Carrollton',
        state: 'GA',
        zip: '',
        website: 'https://www.marriott.com/hotels/travel/atccy-courtyard-carrollton/',
        distanceFromVenue: '~13 miles (25 minutes)',
        order: 0,
      },
      {
        name: 'Hampton Inn Carrollton',
        address: 'Hampton Inn Carrollton',
        city: 'Carrollton',
        state: 'GA',
        zip: '',
        website: 'https://www.hilton.com/en/hotels/atlcthx-hampton-carrollton/',
        distanceFromVenue: '~17 miles (28 minutes)',
        order: 1,
      },
      {
        name: 'Holiday Inn Express & Suites Carrollton-West by IHG',
        address: 'Holiday Inn Express & Suites Carrollton-West by IHG',
        city: 'Carrollton',
        state: 'GA',
        zip: '',
        website: 'https://www.ihg.com/holidayinnexpress/hotels/us/en/carrollton/atlcw/hoteldetail',
        distanceFromVenue: '~17 miles (28 minutes)',
        order: 2,
      },
      {
        name: 'Hampton Inn Bremen I-20',
        address: 'Hampton Inn Bremen',
        city: 'Bremen',
        state: 'GA',
        zip: '',
        website: 'https://www.hilton.com/en/hotels/atlbrhx-hampton-bremen/',
        distanceFromVenue: '~8 miles (15 minutes)',
        order: 3,
      },
      {
        name: 'Holiday Inn Express & Suites Bremen by IHG',
        address: 'Holiday Inn - Bremen',
        city: 'Bremen',
        state: 'GA',
        zip: '',
        website: 'https://www.ihg.com/holidayinnexpress/hotels/us/en/bremen/atlbr/hoteldetail',
        distanceFromVenue: '~8 miles (15 minutes)',
        order: 4,
      },
      {
        name: 'Microtel Inn & Suites by Wyndham Bremen',
        address: 'Microtel by Wyndham',
        city: 'Bremen',
        state: 'GA',
        zip: '',
        website: 'https://www.wyndhamhotels.com/microtel/bremen-georgia/microtel-inn-and-suites-bremen/overview',
        distanceFromVenue: '~8 miles (15 minutes)',
        order: 5,
      },
      {
        name: 'Holiday Inn Express Villa Rica by IHG',
        address: 'Holiday Inn Express Villa Rica',
        city: 'Villa Rica',
        state: 'GA',
        zip: '',
        website: 'https://www.ihg.com/holidayinnexpress/hotels/us/en/villa-rica/atlvr/hoteldetail',
        distanceFromVenue: '~9 miles (15 minutes)',
        order: 6,
      },
      {
        name: 'Fairfield Plantation Resort',
        address: 'Fairfield Plantation Resort',
        city: 'Villa Rica',
        state: 'GA',
        zip: '',
        distanceFromVenue: '~13 miles (20 minutes)',
        order: 7,
      },
    ]

    for (const hotel of hotels) {
      await prisma.hotelBlock.create({
        data: {
          coupleId: wedding.id,
          name: hotel.name,
          address: hotel.address,
          city: hotel.city,
          state: hotel.state,
          zip: hotel.zip || null,
          website: hotel.website || null,
          distanceFromVenue: hotel.distanceFromVenue,
          order: hotel.order,
        },
      })
    }

    console.log(`Created ${hotels.length} hotels`)

    console.log('\n✅ Successfully updated wedding information!')
    console.log(`Wedding Date: ${weddingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`)
    console.log(`Venue: The Venue at Stillwater Pond`)
    console.log(`Location: 175 Pollard Rd, Temple, GA 30179`)

  } catch (error) {
    console.error('Error updating wedding information:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateWeddingInfo()
