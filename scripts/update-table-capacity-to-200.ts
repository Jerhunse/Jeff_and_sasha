import { prisma } from '../lib/prisma'

/**
 * Update table capacities to match venue capacity of 200
 * Current: 208 (needs to reduce by 8)
 * 
 * Strategy: Reduce head table from 18 to 10
 * Result: 18 tables × 10 + 1 head table × 10 = 190
 * Or: Keep 18 round tables at 10, set head table to 20
 * Result: 18 × 10 + 1 × 20 = 200 ✓
 */

async function updateTableCapacities() {
  console.log('Fetching current tables...')
  
  const tables = await prisma.table.findMany({
    include: {
      seatingChart: true,
      _count: {
        select: {
          seats: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  console.log(`\nFound ${tables.length} tables:`)
  let totalCapacity = 0
  tables.forEach(table => {
    console.log(`  ${table.name}: capacity=${table.capacity}, current seats=${table._count.seats}`)
    totalCapacity += table.capacity
  })
  console.log(`\nTotal capacity: ${totalCapacity}`)
  
  // Find head table
  const headTable = tables.find(t => t.name.toLowerCase().includes('head'))
  
  if (!headTable) {
    console.error('No head table found!')
    return
  }
  
  console.log(`\nUpdating Head Table capacity from ${headTable.capacity} to 20...`)
  
  await prisma.table.update({
    where: { id: headTable.id },
    data: { capacity: 20 }
  })
  
  console.log('✓ Updated successfully')
  
  // Verify
  const updatedTables = await prisma.table.findMany()
  const newTotal = updatedTables.reduce((sum, t) => sum + t.capacity, 0)
  console.log(`\nNew total capacity: ${newTotal}`)
}

updateTableCapacities()
  .then(() => {
    console.log('\n✓ Done')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
