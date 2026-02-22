import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Carefully mapped Excel -> DB primary guest name
// Each entry: [excelName, excelGuestCount, dbFirstName, dbLastName]
const mappings: [string, number, string, string][] = [
  ["Walter", 1, "Walter", ""],
  ["Adrian", 1, "Adrian", ""],
  ["Emmanuel", 1, "Emmanuel", ""],
  ["Valle's", 2, "Valle's", ""],
  ["Damara / Mary", 2, "Damara", "Damara / Mary"],
  ["Rosie / Nelson", 3, "Rosie", "Rosie / Nelson"],
  ["Mariel Fam", 1, "Mariel", "Mendez"],
  ["Saraí", 4, "Saraí", "a"],
  ["Margaret", 1, "Margaret", ""],
  ["Karina & Karen", 3, "Karina", "Karina & Karen"],
  ["Aunt Naomi", 1, "Naomi", "Otuaga"],
  ["Aunt Hanna", 3, "Hannah", "Aiwanseoba"],
  ["FIFA", 3, "FIFA", "Fifa"],
  ["Raquel", 2, "Raquel", "Raquel"],
  ["Nana", 2, "Nana", ""],
  ["Radi & Sophie", 2, "Radi", "Sophie"],
  ["Jacky", 2, "Jacky", "Jacky"],
  ["Richard", 3, "Richard", "Richard"],
  ["Ricky", 1, "Ricky", "Ricky"],
  ["Jeff & Sasha", 2, "Jeffery", "Erhunse"],
  ["TATI Burgos", 2, "TATI", "Burgos"],
  ["Candida & Elias", 2, "Candida", "Contreras"],
  ["Carmen Rivera", 1, "Carmen", "Rivera"],
  ["Karla Rosada", 6, "Karla", "Rosada"],
  ["Perez Carlos / K", 2, "Perez", "Carlos"],
  ["Kayla", 2, "Kayla", "a"],
  ["Danny Rivera", 1, "Danny", "Rivera"],
  ["April Gegsend", 2, "April", "Gegsend"],
  ["Kalyn Stevens", 2, "Kalyn", "Stevens"],
  ["Payton Huff", 1, "Payton", "Huff"],
  ["Josh Moran", 2, "Josh", "Moran"],
  ["Juan Roldan", 2, "Juan", "Roldan"],
  ["Irbin Pérez", 4, "Irbin", "Pérez"],
  ["Cruz-Nemo", 3, "Cruz-Nemo", ""],
  ["Hazel & Mom", 3, "Hazel", "Hazel & Mom"],
  ["Santoyo", 3, "Santoyo", ""],
  ["Irvin Cruz", 4, "Irvin", "Cruz"],
  ["Edgar Mendoza", 4, "Edgar", "Mendoza"],
  ["Mauri Mondragon", 2, "Mauri", "Mondragon"],
  ["Pedro Martinez", 3, "Pedro", "Martinez"],
  ["Karl Farmer", 3, "Karl", "Farmer"],
  ["Tino Martinez", 2, "Tino", "Martinez"],
  ["Raphael Torrez", 1, "Raphael", "Torrez"],
  ["Fenix Dilone", 2, "Fenix", "Dilone"],
  ["Rachel Cuadrado", 2, "Rachel", "Cuadrado"],
  ["Erhunse Family", 4, "Erhunse", "Family"],
  ["Afolabis Family", 4, "Tomi", "Afolabi"],
  ["Sanders Family", 2, "Margie", "Sanders"],
  ["Kris Johnsons", 2, "Kris", "Johnsons"],
  ["Kerrie Robinsons", 3, "Kerrie", "Robinsons"],
  ["Scott Baity", 1, "Scott", "Baity"],
  ["Dre Baity", 1, "Andre", "Baity"],
  ["Daniel De Leon", 1, "Daniel", "De Leon"],
  ["Daisy/Adrian Carrions", 2, "Adrian", "Carrion"],
  ["DemiMaria Tsouclos", 2, "Mariana", "Tsouchlos"],
  ["Edith Robles", 1, "Edith", "Robles"],
  ["Ian / Saph Garay", 2, "Ian", "Garay"],
  ["Ashley KK", 2, "Ashley", "Rencher"],
  ["Jas / Tyler Jostes", 3, "Jasmine", "Jostes"],
  ["Ashley/Deavin Rencher", 2, "Asheli", "Mitchell"], // ← Or is this a different entry?
  ["Nelson / Arellie", 2, "Nelson", "Ortiz"],
  ["Willie / Nessa", 2, "Vanessa", "Garcia"], // ← Willie/Nessa could be Vanessa Garcia
  ["Savanna Jones", 2, "Savanna", "Jay"],
  ["Odalis / JR", 2, "Odalis", "Ledgister"],
  ["Jada M", 1, "Jada", "McHargh"],
  ["Uzosike", 4, "Ezra", "Uzosike"],
  ["Justin Zalava", 2, "Justin", "Zalava"],
  ["Boga Gladis", 3, "Boga", "Gladis"],
  ["Ivn & Gini", 3, "Ivn", "Ivn & Gini"],
  ["Wendy / Bernardo", 3, "Wendy", "Wendy / Bernardo"],
  ["Godwin", 5, "Godwin", "Martins"],
  ["Bimpe", 1, "Sarah", "Theophilus"], // ← Bimpe might be Sarah Theophilus? Not sure.
  ["Aunt Sarah", 2, "Sasha", "Contreras"], // ← Not sure about this mapping
  ["Arimi Family", 5, "Benji", "Arimi"],
  ["Hamson Erhunse", 2, "Hamson", "Erhunse"],
  ["Sheddy Family", 5, "Sheddy", "Erhunmwunse"],
  ["GP Family", 4, "Godspower", "Erhunmwunse"],
  ["Paul/ Lauren Tsouclos", 2, "Paul", "Tsouclos"],
  ["Cindy Garcia", 1, "Cindy", "Garcia"],
  ["Emmie Sutter", 1, "Emmie", "Sutter"],
  ["Joseph Choi", 1, "Joseph", "Choi"],
  ["Samantha Rudd", 2, "Samantha", "Rudd"],
  ["Jose Martinez", 2, "Jose", "Martinez"],
  ["Avery Gillham", 2, "Avery", "Gillham"],
  ["Zach Henricks", 1, "Zach", "Henricks"],
  ["Daniel Hill", 2, "Daniel", "Hill"],
  ["LaDaesha Brown", 1, "LaDaesha", "Brown"],
  ["Will Lenares", 1, "Will", "Lenares"],
]

async function main() {
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
  })

  console.log(`Excel entries: ${mappings.length}`)
  console.log(`DB primary guests: ${primaryGuests.length}\n`)

  // Check party size mismatches
  let excelTotal = 0
  let dbMatchedTotal = 0
  const mismatches: string[] = []

  for (const [excelName, excelCount, dbFirst, dbLast] of mappings) {
    excelTotal += excelCount

    const match = primaryGuests.find(g => {
      if (dbFirst && dbLast) {
        return g.firstName === dbFirst && g.lastName === dbLast
      }
      return g.firstName === dbFirst || g.lastName === dbLast
    })

    if (!match) {
      mismatches.push(`❌ NO MATCH: ${excelName} (${excelCount}) → looked for ${dbFirst} ${dbLast}`)
      continue
    }

    const dbPartySize = 1 + match.plusOnes.length
    dbMatchedTotal += dbPartySize

    if (dbPartySize !== excelCount) {
      const diff = dbPartySize - excelCount
      mismatches.push(`⚠️  SIZE MISMATCH: "${excelName}" expects ${excelCount} people, DB "${match.firstName} ${match.lastName}" has ${dbPartySize} (${diff > 0 ? '+' : ''}${diff})`)
      if (match.plusOnes.length > 0) {
        for (const po of match.plusOnes) {
          mismatches.push(`      ↳ ${po.firstName} ${po.lastName}`)
        }
      }
    }
  }

  // Find unmatched DB guests
  const matchedDbIds = new Set<string>()
  for (const [, , dbFirst, dbLast] of mappings) {
    const match = primaryGuests.find(g => {
      if (dbFirst && dbLast) return g.firstName === dbFirst && g.lastName === dbLast
      return g.firstName === dbFirst || g.lastName === dbLast
    })
    if (match) matchedDbIds.add(match.id)
  }

  const unmatchedDb = primaryGuests.filter(g => !matchedDbIds.has(g.id))

  if (unmatchedDb.length > 0) {
    console.log(`🔴 DB GUESTS NOT IN EXCEL (${unmatchedDb.length}):`)
    for (const g of unmatchedDb) {
      console.log(`  - ${g.firstName} ${g.lastName} (party of ${1 + g.plusOnes.length})`)
    }
    console.log()
  }

  if (mismatches.length > 0) {
    console.log(`\n⚠️  MISMATCHES (${mismatches.length}):`)
    for (const m of mismatches) {
      console.log(`  ${m}`)
    }
  }

  console.log(`\n📊 TOTALS:`)
  console.log(`  Excel: ${mappings.length} invitations, ${excelTotal} people`)
  console.log(`  DB matched: ${matchedDbIds.size} primary guests, ${dbMatchedTotal} people`)
  console.log(`  DB unmatched: ${unmatchedDb.length} primary guests, ${unmatchedDb.reduce((s, g) => s + 1 + g.plusOnes.length, 0)} people`)
  console.log(`  DB total: ${primaryGuests.length} primary guests, ${primaryGuests.reduce((s, g) => s + 1 + g.plusOnes.length, 0)} people`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
