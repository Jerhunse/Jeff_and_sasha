import { PrismaClient } from "@prisma/client"
import { nanoid } from "nanoid"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Create a test couple
  const couple = await prisma.couple.upsert({
    where: { slug: "jeff-and-sasha" },
    update: {},
    create: {
      slug: "jeff-and-sasha",
      partner1Name: "Jeffery Erhunse",
      partner2Name: "Sasha Contreras",
      weddingDate: new Date("2025-09-20T16:00:00Z"),
      venueName: "The Grand Ballroom",
      venueAddress: "123 Main Street",
      venueCity: "San Francisco",
      venueState: "CA",
      venueZip: "94102",
      primaryColor: "#6b9c7f",
      secondaryColor: "#f5f5f0",
      accentColor: "#d4a574",
      isPublished: true,
      maxCapacity: 150,
    },
  })

  console.log("✅ Created couple:", couple.slug)

  // Create admin user
  const user = await prisma.user.upsert({
    where: { email: "admin@wedding.com" },
    update: {},
    create: {
      email: "admin@wedding.com",
      name: "Admin User",
      role: "OWNER",
      coupleId: couple.id,
      emailVerified: new Date(),
    },
  })

  console.log("✅ Created admin user:", user.email)

  // Create events — first timeline item is Ceremony at 4:00 PM (local time)
  const ceremony = await prisma.event.create({
    data: {
      coupleId: couple.id,
      name: "Ceremony",
      description: "Join us for our wedding ceremony",
      startTime: new Date("2025-09-20T16:00:00-07:00"), // 4:00 PM Pacific
      endTime: new Date("2025-09-20T17:00:00-07:00"),
      location: "The Grand Ballroom",
      address: "123 Main Street, San Francisco, CA 94102",
      visibility: "PUBLIC",
      capacity: 150,
      order: 0,
    },
  })

  const reception = await prisma.event.create({
    data: {
      coupleId: couple.id,
      name: "Reception",
      description: "Celebrate with dinner and dancing",
      startTime: new Date("2025-09-20T18:00:00-07:00"), // 6:00 PM Pacific
      endTime: new Date("2025-09-20T23:00:00-07:00"),
      location: "The Grand Ballroom",
      address: "123 Main Street, San Francisco, CA 94102",
      visibility: "PUBLIC",
      capacity: 150,
      order: 1,
    },
  })

  console.log("✅ Created events:", ceremony.name, reception.name)

  // Create RSVP Questions
  const mealQuestion = await prisma.rSVPQuestion.create({
    data: {
      coupleId: couple.id,
      eventId: reception.id,
      text: "What is your meal choice?",
      description: "Please select your entrée preference",
      type: "MEAL_CHOICE",
      options: ["Chicken", "Beef", "Fish", "Vegetarian"],
      required: true,
      order: 0,
    },
  })

  const dietaryQuestion = await prisma.rSVPQuestion.create({
    data: {
      coupleId: couple.id,
      text: "Do you have any dietary restrictions?",
      description: "Allergies, dietary requirements, etc.",
      type: "DIETARY",
      options: [],
      required: false,
      order: 1,
    },
  })

  const songQuestion = await prisma.rSVPQuestion.create({
    data: {
      coupleId: couple.id,
      text: "Request a song for the dance floor!",
      type: "TEXT",
      options: [],
      required: false,
      order: 2,
    },
  })

  console.log("✅ Created RSVP questions")

  // Create test guests
  const guests = await Promise.all([
    prisma.guest.create({
      data: {
        coupleId: couple.id,
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        phone: "(555) 123-4567",
        inviteToken: nanoid(),
        allowPlusOne: true,
        plusOnePolicy: "named",
      },
    }),
    prisma.guest.create({
      data: {
        coupleId: couple.id,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        phone: "(555) 987-6543",
        inviteToken: nanoid(),
        allowPlusOne: false,
        plusOnePolicy: "none",
      },
    }),
    prisma.guest.create({
      data: {
        coupleId: couple.id,
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob@example.com",
        inviteToken: nanoid(),
        allowPlusOne: true,
        plusOnePolicy: "named",
      },
    }),
  ])

  console.log("✅ Created", guests.length, "test guests")

  // Create a test RSVP response
  await prisma.rSVPResponse.create({
    data: {
      coupleId: couple.id,
      guestId: guests[0].id,
      eventId: reception.id,
      status: "YES",
      answersJSON: JSON.stringify({
        [mealQuestion.id]: "Chicken",
        [dietaryQuestion.id]: "No allergies",
        [songQuestion.id]: "Sweet Caroline",
      }),
    },
  })

  console.log("✅ Created test RSVP response")

  // Create a tag
  const weddingPartyTag = await prisma.tag.create({
    data: {
      coupleId: couple.id,
      name: "Wedding Party",
      color: "#6b9c7f",
      description: "Members of the wedding party",
    },
  })

  await prisma.guestTag.create({
    data: {
      guestId: guests[0].id,
      tagId: weddingPartyTag.id,
    },
  })

  console.log("✅ Created tags")

  // Create a campaign
  const campaign = await prisma.campaign.create({
    data: {
      coupleId: couple.id,
      name: "Save the Date Campaign",
      type: "SAVE_THE_DATE",
      status: "DRAFT",
      subject: "Save the Date - Jeffery Erhunse & Sasha Contreras",
    },
  })

  console.log("✅ Created test campaign")

  // Create home page
  const homePage = await prisma.page.create({
    data: {
      coupleId: couple.id,
      type: "HOME",
      slug: "home",
      title: "Home",
      contentJSON: JSON.stringify({
        sections: [
          {
            id: "hero-1",
            type: "hero",
            content: {
              title: "Jeffery Erhunse & Sasha Contreras",
              subtitle: "September 20, 2025",
              backgroundImage: "",
              showCountdown: true,
            },
            order: 0,
          },
        ],
      }),
      isPublished: true,
      order: 0,
    },
  })

  console.log("✅ Created home page")

  console.log("\n🎉 Seed completed successfully!")
  console.log("\n📋 Test Data Created:")
  console.log("   Couple: jeff-and-sasha")
  console.log("   Admin: admin@wedding.com")
  console.log("   Guests:", guests.length)
  console.log("   Events: 2 (Ceremony, Reception)")
  console.log("   RSVP Questions: 3")
  console.log("\n🌐 Access the site:")
  console.log("   Public: http://localhost:3000/jeff-and-sasha")
  console.log("   Admin: http://localhost:3000/admin/overview")
  console.log("   RSVP: http://localhost:3000/rsvp/" + guests[0].inviteToken)
  console.log("\n👤 Test Guest Tokens:")
  guests.forEach((g) => {
    console.log(`   ${g.firstName} ${g.lastName}: ${g.inviteToken}`)
  })
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

