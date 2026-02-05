import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Guest data from the provided CSV
const guestData = [
  { location: "Texas", name: "Walter", guests: 1, phone: "(214) 543-8131" },
  { location: "Texas", name: "Adrian", guests: 1, phone: "(469) 508-6595" },
  { location: "Texas", name: "Emmanuel", guests: 1, phone: "(469) 441-2756" },
  { location: "Texas", name: "Valle's", guests: 2, phone: "(214) 477-6734" },
  { location: "Texas", name: "Damara / Mary", guests: 2, phone: "(404) 510-3561" },
  { location: "Texas", name: "Rosie / Nelson", guests: 3, phone: "(214) 783-1762" },
  { location: "Texas", name: "Mariel Fam", guests: 1, phone: "(469) 826-4248" },
  { location: "Texas", name: "Saraí", guests: 3, phone: null },
  { location: "Texas", name: "Margaret", guests: 1, phone: "(214) 686-1468" },
  { location: "Texas", name: "Karina & Karen", guests: 2, phone: null },
  { location: "Texas", name: "Aunt Naomi", guests: 4, phone: "(346) 203-7296" },
  { location: "Texas", name: "Aunt Hanna", guests: 3, phone: "(832) 818-5677" },
  { location: "New York", name: "FIFA", guests: 2, phone: null },
  { location: "New York", name: "Raquel", guests: 2, phone: null },
  { location: "New York", name: "Nana", guests: 1, phone: null },
  { location: "New York", name: "Radi & Sophie", guests: 2, phone: null },
  { location: "New York", name: "Jacky", guests: 1, phone: null },
  { location: "New York", name: "Ricky", guests: 1, phone: null },
  { location: "Georgia", name: "Jeff & Sasha", guests: 2, phone: "(404) 980-9690" },
  { location: "Georgia", name: "TATI Burgos", guests: 2, phone: "(678) 447-5290" },
  { location: "Georgia", name: "Candida & Elias", guests: 2, phone: "(972) 358-0528" },
  { location: "Georgia", name: "Carmen Rivera", guests: 1, phone: "(678) 447-5290" },
  { location: "Georgia", name: "Karla Rosada", guests: 5, phone: "(678) 471-7824" },
  { location: "Georgia", name: "Perez Carlos / K", guests: 2, phone: "(404) 734-2459" },
  { location: "Georgia", name: "Kayla", guests: 1, phone: null },
  { location: "Georgia", name: "Danny Rivera", guests: 1, phone: null },
  { location: "Georgia", name: "April Gegsend", guests: 1, phone: "(843) 217-2793" },
  { location: "Georgia", name: "Kalyn Stevens", guests: 2, phone: "(678) 993-4271" },
  { location: "Georgia", name: "Payton Huff", guests: 1, phone: "(770) 549-7025" },
  { location: "Georgia", name: "Josh Moran", guests: 2, phone: "(404) 429-2973" },
  { location: "Georgia", name: "Juan Roldan", guests: 2, phone: "(678) 478-7719" },
  { location: "Georgia", name: "Irbin Pérez", guests: 4, phone: "(404) 477-8745" },
  { location: "Georgia", name: "Cruz-Nemo", guests: 2, phone: "(678) 939-9638" },
  { location: "Georgia", name: "Hazel & Mom", guests: 2, phone: null },
  { location: "Georgia", name: "Santoyo", guests: 2, phone: "(678) 469-7836" },
  { location: "Georgia", name: "Irvin Cruz", guests: 3, phone: "(770) 289-0742" },
  { location: "Georgia", name: "Edgar Mendoza", guests: 4, phone: "(404) 936-4793" },
  { location: "Georgia", name: "Mauri Mondragon", guests: 1, phone: null },
  { location: "Georgia", name: "Pedro Martinez", guests: 3, phone: "(770) 310-4042" },
  { location: "Georgia", name: "Karl Farmer", guests: 3, phone: "(678) 438-1123" },
  { location: "Georgia", name: "Tino Martinez", guests: 2, phone: null },
  { location: "Georgia", name: "Raphael Torrez", guests: 1, phone: "(404) 465-0828" },
  { location: "Georgia", name: "Fenix Dilone", guests: 2, phone: null },
  { location: "Georgia", name: "Rachel Cuadrado", guests: 2, phone: "(404) 453-0910" },
  { location: "Georgia", name: "Erhunse Family", guests: 3, phone: "(770) 882-6362" },
  { location: "Georgia", name: "Afolabis Family", guests: 4, phone: "(770) 771-2289" },
  { location: "Georgia", name: "Sanders Family", guests: 2, phone: "(404) 520-6972" },
  { location: "Georgia", name: "Kris Johnsons", guests: 2, phone: "(404) 895-5916" },
  { location: "Georgia", name: "Kerrie Robinsons", guests: 2, phone: "(770) 881-1335" },
  { location: "Georgia", name: "Scott Baity", guests: 1, phone: "(678) 522-4455" },
  { location: "Georgia", name: "Dre Baity", guests: 1, phone: "(678) 358-9703" },
  { location: "Georgia", name: "Daniel De Leon", guests: 1, phone: "(770) 733-9987" },
  { location: "Georgia", name: "Daisy/Adrian Carrions", guests: 2, phone: "(404) 789-9163" },
  { location: "Georgia", name: "Dem&Maria Tsouclos", guests: 2, phone: "(678) 642-6758" },
  { location: "Georgia", name: "Edith Robles", guests: 1, phone: "(678) 622-5459" },
  { location: "Georgia", name: "Ian / Saph Garay", guests: 2, phone: "(678) 469-8738" },
  { location: "Georgia", name: "Ashley KK", guests: 1, phone: "(678) 467-5058" },
  { location: "Georgia", name: "Jas / Tyler Jostes", guests: 2, phone: "(404) 729-3976" },
  { location: "Georgia", name: "Hailey Sutter", guests: 1, phone: "(678) 629-0549" },
  { location: "Georgia", name: "Ashley/Deavin Rencher", guests: 2, phone: "(678) 577-4665" },
  { location: "Georgia", name: "Nelson / Arellie", guests: 2, phone: "(470) 902-9051" },
  { location: "Georgia", name: "Willie / Nessa", guests: 2, phone: "(678) 622-7355" },
  { location: "Georgia", name: "Savanna", guests: 1, phone: "(678) 557-6850" },
  { location: "Georgia", name: "Odalis / JR", guests: 2, phone: "(470) 786-0473" },
  { location: "Georgia", name: "Jada M", guests: 1, phone: "(440) 446-0802" },
  { location: "Georgia", name: "Uzosike", guests: 4, phone: "(404) 754-3210" },
  { location: "Georgia", name: "Justin Zalava", guests: 1, phone: "(770) 718-8090" },
  { location: "Georgia", name: "Boga Gladis", guests: 2, phone: "(770) 686-1575" },
  { location: "Georgia", name: "Ivn & Gini", guests: 2, phone: null },
  { location: "Georgia", name: "Wendy / Bernardo", guests: 2, phone: "(347) 645-8396" },
  { location: "Georgia", name: "Godwin", guests: 5, phone: null },
  { location: "Georgia", name: "Binqpe", guests: 5, phone: null },
  { location: "Georgia", name: "Aunt Sarah", guests: 1, phone: null },
  { location: "Spain", name: "Arimi Family", guests: 5, phone: "+34 631 95 81 86" },
  { location: "Nashville", name: "Hamson Erhunse", guests: 2, phone: "(404) 322-7533" },
  { location: "Nashville", name: "Sheddy Family", guests: 5, phone: "(615) 397-5459" },
  { location: "Nashville", name: "GP Family", guests: 4, phone: "(615) 554-6201" },
  { location: "Georgia", name: "Paul/ Lauren Tsouclos", guests: 2, phone: "(678) 620-6235" },
  { location: "Georgia", name: "Cindy Garcia", guests: 1, phone: "(678) 989-9226" },
  { location: "Georgia", name: "Emmie Sutter", guests: 1, phone: "(470) 424-9200" },
  { location: "Georgia", name: "Joseph Choi", guests: 1, phone: "(678) 770-0500" },
  { location: "Georgia", name: "Samantha Rudd", guests: 2, phone: "(404) 717-2086" },
  { location: "Georgia", name: "Jose Martinez", guests: 2, phone: "(404) 437-8496" },
  { location: "Georgia", name: "Avery Gillham", guests: 2, phone: "(678) 822-6787" },
  { location: "Georgia", name: "Zach Henricks", guests: 1, phone: "(678) 767-2540" },
  { location: "Georgia", name: "Daniel Hill", guests: 2, phone: "(770) 313-3519" },
  { location: "Georgia", name: "LaDaesha Brown", guests: 1, phone: "(912) 222-8829" },
  { location: "Georgia", name: "Will Lenares", guests: 1, phone: "(678) 431-8444" },
]

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null
  // For US numbers starting with 1, keep the full number
  // For international, keep as is
  return digits
}

function parseGuestName(name: string): { firstName: string; lastName: string } {
  // Handle various name formats
  const trimmed = name.trim()
  
  // Check for " / " or " & " separators (indicates multiple people in same party)
  if (trimmed.includes(" / ") || trimmed.includes(" & ")) {
    // Use the first name before the separator as the primary
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
  console.log("🚀 Starting guest import...")

  // Get the couple record (assuming there's only one, or get by slug)
  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" }, // Update this to match your wedding slug
  })

  if (!couple) {
    console.error("❌ Could not find wedding couple. Please create a couple record first.")
    console.error("   Available slugs can be checked with: npx tsx scripts/check-couples.ts")
    process.exit(1)
  }

  console.log(`✅ Found wedding: ${couple.partner1Name} & ${couple.partner2Name}`)
  console.log(`   Slug: ${couple.slug}`)
  console.log(`   ID: ${couple.id}\n`)

  // Create a tag for location-based grouping
  const locations = [...new Set(guestData.map((g) => g.location))]
  const locationTags: Record<string, any> = {}

  for (const location of locations) {
    const tag = await prisma.tag.upsert({
      where: {
        coupleId_name: {
          coupleId: couple.id,
          name: location,
        },
      },
      update: {},
      create: {
        coupleId: couple.id,
        name: location,
        color: getColorForLocation(location),
        description: `Guests from ${location}`,
      },
    })
    locationTags[location] = tag
    console.log(`✅ Created/found tag: ${location}`)
  }

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const guestInfo of guestData) {
    try {
      const { firstName, lastName } = parseGuestName(guestInfo.name)
      const normalizedPhone = normalizePhone(guestInfo.phone)

      // Check if guest already exists (by name or phone)
      const existingGuest = await prisma.guest.findFirst({
        where: {
          coupleId: couple.id,
          OR: [
            {
              AND: [
                { firstName: { equals: firstName, mode: "insensitive" } },
                { lastName: { equals: lastName, mode: "insensitive" } },
              ],
            },
            ...(normalizedPhone
              ? [{ phone: { contains: normalizedPhone } }]
              : []),
          ],
        },
      })

      if (existingGuest) {
        console.log(`⏭️  Skipped: ${guestInfo.name} (already exists)`)
        skipped++
        continue
      }

      // Create the guest
      const guest = await prisma.guest.create({
        data: {
          coupleId: couple.id,
          firstName,
          lastName,
          phone: normalizedPhone,
          allowPlusOne: guestInfo.guests > 1,
          plusOnePolicy: guestInfo.guests > 1 ? "unnamed" : "none",
          maxGuestsAllowed: guestInfo.guests,
          notes: `Party size: ${guestInfo.guests} guest(s)\nOriginal name: ${guestInfo.name}\nLocation: ${guestInfo.location}`,
        },
      })

      // Add location tag
      await prisma.guestTag.create({
        data: {
          guestId: guest.id,
          tagId: locationTags[guestInfo.location].id,
        },
      })

      console.log(`✅ Imported: ${guestInfo.name} (${guestInfo.guests} guests)`)
      imported++
    } catch (error: any) {
      console.error(`❌ Error importing ${guestInfo.name}:`, error.message)
      errors++
    }
  }

  console.log("\n📊 Import Summary:")
  console.log(`   ✅ Imported: ${imported}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`   📋 Total: ${guestData.length}`)
}

function getColorForLocation(location: string): string {
  const colors: Record<string, string> = {
    Texas: "#dc2626", // Red
    "New York": "#2563eb", // Blue
    Georgia: "#16a34a", // Green
    Nashville: "#9333ea", // Purple
    Spain: "#ea580c", // Orange
  }
  return colors[location] || "#6b7280" // Default gray
}

main()
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
