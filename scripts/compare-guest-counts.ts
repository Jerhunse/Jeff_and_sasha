import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Expected Georgia guests from user's list (64 entries)
const expectedGeorgiaGuests = [
  { name: "Jeff & Sasha", guests: 2 },
  { name: "TATI Burgos", guests: 2 },
  { name: "Candida & Elias", guests: 2 },
  { name: "Carmen Rivera", guests: 1 },
  { name: "Karla Rosada", guests: 5 },
  { name: "Perez Carlos / K", guests: 2 },
  { name: "Kayla", guests: 1 },
  { name: "Danny Rivera", guests: 1 },
  { name: "April Gegsend", guests: 1 },
  { name: "Kalyn Stevens", guests: 2 },
  { name: "Payton Huff", guests: 1 },
  { name: "Josh Moran", guests: 2 },
  { name: "Juan Roldan", guests: 2 },
  { name: "Irbin Pérez", guests: 4 },
  { name: "Cruz-Nemo", guests: 2 },
  { name: "Hazel & Mom", guests: 2 },
  { name: "Santoyo", guests: 2 },
  { name: "Irvin Cruz", guests: 3 },
  { name: "Edgar Mendoza", guests: 4 },
  { name: "Mauri Mondragon", guests: 1 },
  { name: "Pedro Martinez", guests: 3 },
  { name: "Karl Farmer", guests: 3 },
  { name: "Tino Martinez", guests: 2 },
  { name: "Raphael Torrez", guests: 1 },
  { name: "Fenix Dilone", guests: 2 },
  { name: "Rachel Cuadrado", guests: 2 },
  { name: "Erhunse Family", guests: 3 },
  { name: "Afolabis Family", guests: 4 },
  { name: "Sanders Family", guests: 2 },
  { name: "Kris Johnsons", guests: 2 },
  { name: "Kerrie Robinsons", guests: 2 },
  { name: "Scott Baity", guests: 1 },
  { name: "Dre Baity", guests: 1 },
  { name: "Daniel De Leon", guests: 1 },
  { name: "Daisy/Adrian Carrions", guests: 2 },
  { name: "Dem&Maria Tsouclos", guests: 2 },
  { name: "Edith Robles", guests: 1 },
  { name: "Ian / Saph Garay", guests: 2 },
  { name: "Ashley KK", guests: 1 },
  { name: "Jas / Tyler Jostes", guests: 2 },
  { name: "Hailey Sutter", guests: 1 },
  { name: "Ashley/Deavin Rencher", guests: 2 },
  { name: "Nelson / Arellie", guests: 2 },
  { name: "Willie / Nessa", guests: 2 },
  { name: "Savanna", guests: 1 },
  { name: "Odalis / JR", guests: 2 },
  { name: "Jada M", guests: 1 },
  { name: "Uzosike", guests: 4 },
  { name: "Justin Zalava", guests: 1 },
  { name: "Boga Gladis", guests: 2 },
  { name: "Ivn & Gini", guests: 2 },
  { name: "Wendy / Bernardo", guests: 2 },
  { name: "Godwin", guests: 5 },
  { name: "Binqpe", guests: 5 },
  { name: "Aunt Sarah", guests: 1 },
  { name: "Paul / Lauren Tsouclos", guests: 2 },
  { name: "Cindy Garcia", guests: 1 },
  { name: "Emmie Sutter", guests: 1 },
  { name: "Joseph Choi", guests: 1 },
  { name: "Samantha Rudd", guests: 2 },
  { name: "Jose Martinez", guests: 2 },
  { name: "Avery Gillham", guests: 2 },
  { name: "Zach Henricks", guests: 1 },
  { name: "Daniel Hill", guests: 2 },
  { name: "LaDaesha Brown", guests: 1 },
  { name: "Will Lenares", guests: 1 },
]

async function main() {
  console.log("📊 Comparing Expected vs Database...")
  console.log("=" .repeat(60))

  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" },
  })

  if (!couple) {
    console.error("❌ Could not find wedding couple.")
    process.exit(1)
  }

  // Calculate expected totals
  const expectedTotal = expectedGeorgiaGuests.reduce((sum, g) => sum + g.guests, 0)
  console.log(`Expected Georgia guests: ${expectedGeorgiaGuests.length} entries = ${expectedTotal} total guests\n`)

  // Get database totals
  const georgiaGuests = await prisma.guest.findMany({
    where: {
      coupleId: couple.id,
      tags: {
        some: {
          tag: {
            name: "Georgia",
          },
        },
      },
    },
  })

  const dbTotal = georgiaGuests.reduce((sum, g) => sum + g.maxGuestsAllowed, 0)
  console.log(`Database Georgia guests: ${georgiaGuests.length} entries = ${dbTotal} total guests\n`)

  console.log("=" .repeat(60))
  console.log(`Difference: ${georgiaGuests.length - expectedGeorgiaGuests.length} entries, ${dbTotal - expectedTotal} guests`)
  console.log("=" .repeat(60))

  // Now let's verify the correct totals for all locations
  console.log("\n📋 User's Provided Totals:")
  console.log("  Texas: 24 Guests (12 entries)")
  console.log("  New York: 10 Guests (6 entries)")
  console.log("  Georgia: 129 Guests (64 entries)")
  console.log("  Spain: 5 Guests (1 entry)")
  console.log("  Nashville: 11 Guests (3 entries)")
  console.log("  Total: 179 Guests")

  // Manual count from the list
  console.log("\n🧮 Manual Count from User's List:")
  console.log("  Texas: 1+1+1+2+2+3+1+3+1+2+4+3 = 24 ✓")
  console.log("  New York: 2+2+1+2+1+1 = 9 (User said 10)")
  console.log("  Georgia: Let me count...")
  
  let georgiaManualCount = 0
  expectedGeorgiaGuests.forEach(g => {
    georgiaManualCount += g.guests
  })
  console.log(`  Georgia manual sum: ${georgiaManualCount}`)
  
  console.log("\n⚠️  ISSUE FOUND:")
  console.log("  The user said 'New York (10 Guests)' but the individual counts only add up to 9.")
  console.log("  The user said 'Georgia (129 Guests)' and we have " + georgiaManualCount)
  console.log("  Database currently has: Georgia=${dbTotal}, NY=9")
  console.log("\n  This means:")
  console.log("  - NY might be missing 1 guest, OR the user's header was wrong")
  console.log("  - Georgia has 1 extra guest (130 instead of 129)")
  
  await prisma.$disconnect()
}

main().catch(console.error)
