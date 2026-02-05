import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Corrected guest counts from the provided list
const correctedGuestData = [
  // Texas (24 Guests)
  { location: "Texas", name: "Walter", guests: 1 },
  { location: "Texas", name: "Adrian", guests: 1 },
  { location: "Texas", name: "Emmanuel", guests: 1 },
  { location: "Texas", name: "Valle's", guests: 2 },
  { location: "Texas", name: "Damara / Mary", guests: 2 },
  { location: "Texas", name: "Rosie / Nelson", guests: 3 },
  { location: "Texas", name: "Mariel Fam", guests: 1 },
  { location: "Texas", name: "Saraí", guests: 3 },
  { location: "Texas", name: "Margaret", guests: 1 },
  { location: "Texas", name: "Karina & Karen", guests: 2 },
  { location: "Texas", name: "Aunt Naomi", guests: 4 },
  { location: "Texas", name: "Aunt Hanna", guests: 3 },
  
  // New York (10 Guests)
  { location: "New York", name: "FIFA", guests: 2 },
  { location: "New York", name: "Raquel", guests: 2 },
  { location: "New York", name: "Nana", guests: 1 },
  { location: "New York", name: "Radi & Sophie", guests: 2 },
  { location: "New York", name: "Jacky", guests: 1 },
  { location: "New York", name: "Ricky", guests: 1 },
  
  // Georgia (129 Guests)
  { location: "Georgia", name: "Jeff & Sasha", guests: 2 },
  { location: "Georgia", name: "TATI Burgos", guests: 2 },
  { location: "Georgia", name: "Candida & Elias", guests: 2 },
  { location: "Georgia", name: "Carmen Rivera", guests: 1 },
  { location: "Georgia", name: "Karla Rosada", guests: 5 },
  { location: "Georgia", name: "Perez Carlos / K", guests: 2 },
  { location: "Georgia", name: "Kayla", guests: 1 },
  { location: "Georgia", name: "Danny Rivera", guests: 1 },
  { location: "Georgia", name: "April Gegsend", guests: 1 },
  { location: "Georgia", name: "Kalyn Stevens", guests: 2 },
  { location: "Georgia", name: "Payton Huff", guests: 1 },
  { location: "Georgia", name: "Josh Moran", guests: 2 },
  { location: "Georgia", name: "Juan Roldan", guests: 2 },
  { location: "Georgia", name: "Irbin Pérez", guests: 4 },
  { location: "Georgia", name: "Cruz-Nemo", guests: 2 },
  { location: "Georgia", name: "Hazel & Mom", guests: 2 },
  { location: "Georgia", name: "Santoyo", guests: 2 },
  { location: "Georgia", name: "Irvin Cruz", guests: 3 },
  { location: "Georgia", name: "Edgar Mendoza", guests: 4 },
  { location: "Georgia", name: "Mauri Mondragon", guests: 1 },
  { location: "Georgia", name: "Pedro Martinez", guests: 3 },
  { location: "Georgia", name: "Karl Farmer", guests: 3 },
  { location: "Georgia", name: "Tino Martinez", guests: 2 },
  { location: "Georgia", name: "Raphael Torrez", guests: 1 },
  { location: "Georgia", name: "Fenix Dilone", guests: 2 },
  { location: "Georgia", name: "Rachel Cuadrado", guests: 2 },
  { location: "Georgia", name: "Erhunse Family", guests: 3 },
  { location: "Georgia", name: "Afolabis Family", guests: 4 },
  { location: "Georgia", name: "Sanders Family", guests: 2 },
  { location: "Georgia", name: "Kris Johnsons", guests: 2 },
  { location: "Georgia", name: "Kerrie Robinsons", guests: 2 },
  { location: "Georgia", name: "Scott Baity", guests: 1 },
  { location: "Georgia", name: "Dre Baity", guests: 1 },
  { location: "Georgia", name: "Daniel De Leon", guests: 1 },
  { location: "Georgia", name: "Daisy/Adrian Carrions", guests: 2 },
  { location: "Georgia", name: "Dem&Maria Tsouclos", guests: 2 },
  { location: "Georgia", name: "Edith Robles", guests: 1 },
  { location: "Georgia", name: "Ian / Saph Garay", guests: 2 },
  { location: "Georgia", name: "Ashley KK", guests: 1 },
  { location: "Georgia", name: "Jas / Tyler Jostes", guests: 2 },
  { location: "Georgia", name: "Hailey Sutter", guests: 1 },
  { location: "Georgia", name: "Ashley/Deavin Rencher", guests: 2 },
  { location: "Georgia", name: "Nelson / Arellie", guests: 2 },
  { location: "Georgia", name: "Willie / Nessa", guests: 2 },
  { location: "Georgia", name: "Savanna", guests: 1 },
  { location: "Georgia", name: "Odalis / JR", guests: 2 },
  { location: "Georgia", name: "Jada M", guests: 1 },
  { location: "Georgia", name: "Uzosike", guests: 4 },
  { location: "Georgia", name: "Justin Zalava", guests: 1 },
  { location: "Georgia", name: "Boga Gladis", guests: 2 },
  { location: "Georgia", name: "Ivn & Gini", guests: 2 },
  { location: "Georgia", name: "Wendy / Bernardo", guests: 2 },
  { location: "Georgia", name: "Godwin", guests: 5 },
  { location: "Georgia", name: "Binqpe", guests: 5 },
  { location: "Georgia", name: "Aunt Sarah", guests: 1 },
  { location: "Georgia", name: "Paul / Lauren Tsouclos", guests: 2 },
  { location: "Georgia", name: "Cindy Garcia", guests: 1 },
  { location: "Georgia", name: "Emmie Sutter", guests: 1 },
  { location: "Georgia", name: "Joseph Choi", guests: 1 },
  { location: "Georgia", name: "Samantha Rudd", guests: 2 },
  { location: "Georgia", name: "Jose Martinez", guests: 2 },
  { location: "Georgia", name: "Avery Gillham", guests: 2 },
  { location: "Georgia", name: "Zach Henricks", guests: 1 },
  { location: "Georgia", name: "Daniel Hill", guests: 2 },
  { location: "Georgia", name: "LaDaesha Brown", guests: 1 },
  { location: "Georgia", name: "Will Lenares", guests: 1 },
  
  // Spain (5 Guests)
  { location: "Spain", name: "Arimi Family", guests: 5 },
  
  // Nashville (11 Guests)
  { location: "Nashville", name: "Hamson Erhunse", guests: 2 },
  { location: "Nashville", name: "Sheddy Family", guests: 5 },
  { location: "Nashville", name: "GP Family", guests: 4 },
]

function normalizeGuestName(name: string): string {
  // Normalize variations in name formatting to match database
  return name
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace("Paul/ Lauren", "Paul / Lauren") // Fix spacing
    .replace("Daisy/Adrian", "Daisy / Adrian") // Fix spacing
    .replace("Ashley/Deavin", "Ashley / Deavin") // Fix spacing
    .replace("Dem&Maria", "Dem & Maria") // Fix spacing
    .trim()
}

function parseGuestName(name: string): { firstName: string; lastName: string } {
  const trimmed = name.trim()
  
  // Check for " / " or " & " separators (indicates multiple people in same party)
  if (trimmed.includes(" / ") || trimmed.includes(" & ")) {
    const parts = trimmed.split(/\s+\/\s+|\s+&\s+/)
    const firstPerson = parts[0].trim()
    const nameParts = firstPerson.split(/\s+/)
    return {
      firstName: nameParts[0],
      lastName: nameParts.length > 1 ? nameParts.slice(1).join(" ") : trimmed,
    }
  }
  
  // Handle "Family" suffix
  if (trimmed.includes(" Family") || trimmed.includes(" Fam")) {
    const baseName = trimmed.replace(/\s+(Family|Fam)$/, "")
    return {
      firstName: baseName,
      lastName: "Family",
    }
  }
  
  // Handle single names or names with spaces
  const nameParts = trimmed.split(/\s+/)
  if (nameParts.length === 1) {
    return {
      firstName: nameParts[0],
      lastName: "",
    }
  }
  
  return {
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(" "),
  }
}

async function main() {
  console.log("🔄 Starting guest count update...")
  console.log("=" .repeat(60))

  // Get the couple record
  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" },
  })

  if (!couple) {
    console.error("❌ Could not find wedding couple.")
    process.exit(1)
  }

  console.log(`✅ Found wedding: ${couple.partner1Name} & ${couple.partner2Name}\n`)

  let updated = 0
  let notFound = 0
  let unchanged = 0
  let errors = 0
  
  const locationSummary: Record<string, { expected: number; actual: number }> = {}

  for (const guestInfo of correctedGuestData) {
    try {
      const normalizedName = normalizeGuestName(guestInfo.name)
      const { firstName, lastName } = parseGuestName(normalizedName)

      // Find the guest
      const guest = await prisma.guest.findFirst({
        where: {
          coupleId: couple.id,
          AND: [
            { firstName: { equals: firstName, mode: "insensitive" } },
            { lastName: { equals: lastName, mode: "insensitive" } },
          ],
        },
      })

      if (!guest) {
        console.log(`⚠️  Not found: ${guestInfo.name} (${firstName} ${lastName})`)
        notFound++
        continue
      }

      // Check if update is needed
      if (guest.maxGuestsAllowed === guestInfo.guests) {
        console.log(`✓  Unchanged: ${guestInfo.name} (${guestInfo.guests} guests)`)
        unchanged++
      } else {
        // Update the guest count
        await prisma.guest.update({
          where: { id: guest.id },
          data: {
            maxGuestsAllowed: guestInfo.guests,
            allowPlusOne: guestInfo.guests > 1,
            plusOnePolicy: guestInfo.guests > 1 ? "unnamed" : "none",
            notes: guest.notes
              ? guest.notes.replace(
                  /Party size: \d+ guest\(s\)/,
                  `Party size: ${guestInfo.guests} guest(s)`
                )
              : `Party size: ${guestInfo.guests} guest(s)\nOriginal name: ${guestInfo.name}\nLocation: ${guestInfo.location}`,
          },
        })

        console.log(
          `✅ Updated: ${guestInfo.name} (${guest.maxGuestsAllowed} → ${guestInfo.guests} guests)`
        )
        updated++
      }

      // Track location summary
      if (!locationSummary[guestInfo.location]) {
        locationSummary[guestInfo.location] = { expected: 0, actual: 0 }
      }
      locationSummary[guestInfo.location].expected += guestInfo.guests
      locationSummary[guestInfo.location].actual += guestInfo.guests
    } catch (error: any) {
      console.error(`❌ Error updating ${guestInfo.name}:`, error.message)
      errors++
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log("📊 Update Summary:")
  console.log("=".repeat(60))
  console.log(`   ✅ Updated: ${updated}`)
  console.log(`   ✓  Unchanged: ${unchanged}`)
  console.log(`   ⚠️  Not found: ${notFound}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`   📋 Total processed: ${correctedGuestData.length}`)

  console.log("\n" + "=".repeat(60))
  console.log("📍 Guest Count by Location:")
  console.log("=".repeat(60))
  
  let totalExpected = 0
  Object.entries(locationSummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([location, counts]) => {
      console.log(`   ${location}: ${counts.expected} guests`)
      totalExpected += counts.expected
    })
  
  console.log("   " + "-".repeat(40))
  console.log(`   Total: ${totalExpected} guests`)
  console.log("=".repeat(60))

  // Verify database totals
  console.log("\n🔍 Verifying database totals...")
  const allGuests = await prisma.guest.findMany({
    where: { coupleId: couple.id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  const dbLocationSummary: Record<string, number> = {}
  allGuests.forEach((guest) => {
    const locationTag = guest.tags.find((t) =>
      ["Texas", "New York", "Georgia", "Nashville", "Spain"].includes(t.tag.name)
    )
    if (locationTag) {
      const location = locationTag.tag.name
      if (!dbLocationSummary[location]) {
        dbLocationSummary[location] = 0
      }
      dbLocationSummary[location] += guest.maxGuestsAllowed
    }
  })

  console.log("\n📊 Current Database Totals by Location:")
  console.log("=".repeat(60))
  let dbTotal = 0
  Object.entries(dbLocationSummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([location, count]) => {
      const expected = locationSummary[location]?.expected || 0
      const status = count === expected ? "✅" : "⚠️"
      console.log(`   ${status} ${location}: ${count} guests (expected: ${expected})`)
      dbTotal += count
    })
  console.log("   " + "-".repeat(40))
  console.log(`   Total: ${dbTotal} guests (expected: ${totalExpected})`)
  console.log("=".repeat(60))
}

main()
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
