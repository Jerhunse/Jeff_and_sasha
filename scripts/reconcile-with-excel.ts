import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Excel data: Name/Group -> Guest count (total people including plus-ones)
const excelData: { name: string; guests: number; location: string }[] = [
  { name: "Walter", guests: 1, location: "Texas" },
  { name: "Adrian", guests: 1, location: "Texas" },
  { name: "Emmanuel", guests: 1, location: "Texas" },
  { name: "Valle's", guests: 2, location: "Texas" },
  { name: "Damara / Mary", guests: 2, location: "Texas" },
  { name: "Rosie / Nelson", guests: 3, location: "Texas" },
  { name: "Mariel Fam", guests: 1, location: "Texas" },
  { name: "Saraí", guests: 4, location: "Texas" },
  { name: "Margaret", guests: 1, location: "Texas" },
  { name: "Karina & Karen", guests: 3, location: "Texas" },
  { name: "Aunt Naomi", guests: 1, location: "Texas" },
  { name: "Aunt Hanna", guests: 3, location: "Texas" },
  { name: "FIFA", guests: 3, location: "New York" },
  { name: "Raquel", guests: 2, location: "New York" },
  { name: "Nana", guests: 2, location: "New York" },
  { name: "Radi & Sophie", guests: 2, location: "New York" },
  { name: "Jacky", guests: 2, location: "New York" },
  { name: "Richard", guests: 3, location: "New York" },
  { name: "Ricky", guests: 1, location: "New York" },
  { name: "Jeff & Sasha", guests: 2, location: "Georgia" },
  { name: "TATI Burgos", guests: 2, location: "Georgia" },
  { name: "Candida & Elias", guests: 2, location: "Georgia" },
  { name: "Carmen Rivera", guests: 1, location: "Georgia" },
  { name: "Karla Rosada", guests: 6, location: "Georgia" },
  { name: "Perez Carlos / K", guests: 2, location: "Georgia" },
  { name: "Kayla", guests: 2, location: "Georgia" },
  { name: "Danny Rivera", guests: 1, location: "Georgia" },
  { name: "April Gegsend", guests: 2, location: "Georgia" },
  { name: "Kalyn Stevens", guests: 2, location: "Georgia" },
  { name: "Payton Huff", guests: 1, location: "Georgia" },
  { name: "Josh Moran", guests: 2, location: "Georgia" },
  { name: "Juan Roldan", guests: 2, location: "Georgia" },
  { name: "Irbin Pérez", guests: 4, location: "Georgia" },
  { name: "Cruz-Nemo", guests: 3, location: "Georgia" },
  { name: "Hazel & Mom", guests: 3, location: "Georgia" },
  { name: "Santoyo", guests: 3, location: "Georgia" },
  { name: "Irvin Cruz", guests: 4, location: "Georgia" },
  { name: "Edgar Mendoza", guests: 4, location: "Georgia" },
  { name: "Mauri Mondragon", guests: 2, location: "Georgia" },
  { name: "Pedro Martinez", guests: 3, location: "Georgia" },
  { name: "Karl Farmer", guests: 3, location: "Georgia" },
  { name: "Tino Martinez", guests: 2, location: "Georgia" },
  { name: "Raphael Torrez", guests: 1, location: "Georgia" },
  { name: "Fenix Dilone", guests: 2, location: "Georgia" },
  { name: "Rachel Cuadrado", guests: 2, location: "Georgia" },
  { name: "Erhunse Family", guests: 4, location: "Georgia" },
  { name: "Afolabis Family", guests: 4, location: "Georgia" },
  { name: "Sanders Family", guests: 2, location: "Georgia" },
  { name: "Kris Johnsons", guests: 2, location: "Georgia" },
  { name: "Kerrie Robinsons", guests: 3, location: "Georgia" },
  { name: "Scott Baity", guests: 1, location: "Georgia" },
  { name: "Dre Baity", guests: 1, location: "Georgia" },
  { name: "Daniel De Leon", guests: 1, location: "Georgia" },
  { name: "Daisy/Adrian Carrions", guests: 2, location: "Georgia" },
  { name: "DemiMaria Tsouclos", guests: 2, location: "Georgia" },
  { name: "Edith Robles", guests: 1, location: "Georgia" },
  { name: "Ian / Saph Garay", guests: 2, location: "Georgia" },
  { name: "Ashley KK", guests: 2, location: "Georgia" },
  { name: "Jas / Tyler Jostes", guests: 3, location: "Georgia" },
  { name: "Ashley/Deavin Rencher", guests: 2, location: "Georgia" },
  { name: "Nelson / Arellie", guests: 2, location: "Georgia" },
  { name: "Willie / Nessa", guests: 2, location: "Georgia" },
  { name: "Savanna Jones", guests: 2, location: "Georgia" },
  { name: "Odalis / JR", guests: 2, location: "Georgia" },
  { name: "Jada M", guests: 1, location: "Georgia" },
  { name: "Uzosike", guests: 4, location: "Georgia" },
  { name: "Justin Zalava", guests: 2, location: "Georgia" },
  { name: "Boga Gladis", guests: 3, location: "Georgia" },
  { name: "Ivn & Gini", guests: 3, location: "Georgia" },
  { name: "Wendy / Bernardo", guests: 3, location: "Georgia" },
  { name: "Godwin", guests: 5, location: "Georgia" },
  { name: "Bimpe", guests: 1, location: "Georgia" },
  { name: "Aunt Sarah", guests: 2, location: "Georgia" },
  { name: "Arimi Family", guests: 5, location: "Spain" },
  { name: "Hamson Erhunse", guests: 2, location: "Nashville" },
  { name: "Sheddy Family", guests: 5, location: "Nashville" },
  { name: "GP Family", guests: 4, location: "Nashville" },
  { name: "Paul/ Lauren Tsouclos", guests: 2, location: "Georgia" },
  { name: "Cindy Garcia", guests: 1, location: "Georgia" },
  { name: "Emmie Sutter", guests: 1, location: "Georgia" },
  { name: "Joseph Choi", guests: 1, location: "Georgia" },
  { name: "Samantha Rudd", guests: 2, location: "Georgia" },
  { name: "Jose Martinez", guests: 2, location: "Georgia" },
  { name: "Avery Gillham", guests: 2, location: "Georgia" },
  { name: "Zach Henricks", guests: 1, location: "Georgia" },
  { name: "Daniel Hill", guests: 2, location: "Georgia" },
  { name: "LaDaesha Brown", guests: 1, location: "Georgia" },
  { name: "Will Lenares", guests: 1, location: "Georgia" },
]

async function main() {
  const excelTotal = excelData.reduce((sum, row) => sum + row.guests, 0)
  console.log(`📋 EXCEL: ${excelData.length} invitations, ${excelTotal} total people\n`)

  // Get all primary guests from database
  const primaryGuests = await prisma.guest.findMany({
    where: {
      coupleId: 'cmgn7015b0000y44c73zxrwpc',
      parentGuestId: null,
    },
    include: {
      plusOnes: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { firstName: 'asc' },
  })

  console.log(`🗄️  DATABASE: ${primaryGuests.length} primary guests\n`)

  // Compare: find database entries NOT in excel
  // We'll match by checking if the database guest name appears somewhere in the excel name
  const unmatchedDb: typeof primaryGuests = []

  for (const dbGuest of primaryGuests) {
    const dbName = `${dbGuest.firstName} ${dbGuest.lastName}`.toLowerCase().trim()
    
    const match = excelData.find(row => {
      const excelName = row.name.toLowerCase()
      // Check various matching strategies
      return (
        excelName.includes(dbGuest.firstName.toLowerCase().trim()) ||
        dbName.includes(excelName.replace(/[/&]/g, ' ').trim().split(' ')[0])
      )
    })

    if (!match) {
      unmatchedDb.push(dbGuest)
    }
  }

  if (unmatchedDb.length > 0) {
    console.log(`\n❌ DATABASE GUESTS NOT FOUND IN EXCEL (${unmatchedDb.length}):`)
    console.log("─".repeat(70))
    for (const g of unmatchedDb) {
      console.log(`  - ${g.firstName} ${g.lastName} (+${g.plusOnes.length} plus-ones = ${1 + g.plusOnes.length} people)`)
      for (const po of g.plusOnes) {
        console.log(`      ↳ ${po.firstName} ${po.lastName}`)
      }
    }
    const extraPeople = unmatchedDb.reduce((sum, g) => sum + 1 + g.plusOnes.length, 0)
    console.log(`\n  Total extra people from unmatched guests: ${extraPeople}`)
  }

  // Now check plus-one counts
  console.log(`\n\n📊 PLUS-ONE COUNT MISMATCHES:`)
  console.log("─".repeat(70))
  
  let totalExpectedPlusOnes = 0
  let totalActualPlusOnes = 0
  let mismatches: { name: string; expected: number; actual: number; dbGuest: string; extras: string[] }[] = []

  for (const row of excelData) {
    const expectedPlusOnes = row.guests - 1 // Subtract 1 for the primary guest
    totalExpectedPlusOnes += expectedPlusOnes

    // Find matching database guest
    const match = primaryGuests.find(g => {
      const dbName = `${g.firstName} ${g.lastName}`.toLowerCase().trim()
      const excelName = row.name.toLowerCase()
      return (
        excelName.includes(g.firstName.toLowerCase().trim()) ||
        dbName.includes(excelName.replace(/[/&]/g, ' ').trim().split(' ')[0])
      )
    })

    if (match) {
      totalActualPlusOnes += match.plusOnes.length
      if (match.plusOnes.length !== expectedPlusOnes) {
        mismatches.push({
          name: row.name,
          expected: expectedPlusOnes,
          actual: match.plusOnes.length,
          dbGuest: `${match.firstName} ${match.lastName}`,
          extras: match.plusOnes.map(po => `${po.firstName} ${po.lastName}`),
        })
      }
    }
  }

  if (mismatches.length > 0) {
    for (const m of mismatches) {
      const diff = m.actual - m.expected
      console.log(`  ${m.name} (db: ${m.dbGuest}): expected ${m.expected} plus-ones, has ${m.actual} (${diff > 0 ? '+' : ''}${diff})`)
      if (m.extras.length > 0) {
        for (const name of m.extras) {
          console.log(`      ↳ ${name}`)
        }
      }
    }
    console.log()
  }

  console.log(`\n📊 FINAL SUMMARY:`)
  console.log("─".repeat(70))
  console.log(`Excel: ${excelData.length} invitations, ${excelTotal} total people`)
  console.log(`Database: ${primaryGuests.length} primary guests, ${primaryGuests.reduce((s, g) => s + g.plusOnes.length, 0)} plus-ones = ${primaryGuests.reduce((s, g) => s + 1 + g.plusOnes.length, 0)} total`)
  console.log(`Expected plus-ones (from Excel): ${totalExpectedPlusOnes}`)
  console.log(`Actual plus-ones (in DB): ${totalActualPlusOnes}`)
  console.log(`Extra primary guests: ${unmatchedDb.length}`)
  console.log(`Extra plus-ones: ${totalActualPlusOnes - totalExpectedPlusOnes}`)
  console.log(`Total extra people: ${primaryGuests.reduce((s, g) => s + 1 + g.plusOnes.length, 0) - excelTotal}`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
