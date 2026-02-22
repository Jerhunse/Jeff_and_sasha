import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting bride and groom seat assignment...")

  // Find Jeffery Erhunse (Groom)
  const jeffery = await prisma.guest.findFirst({
    where: {
      firstName: "Jeffery",
      lastName: "Erhunse",
    },
  })

  if (!jeffery) {
    console.error("❌ Could not find Jeffery Erhunse")
    return
  }

  // Find Sasha Contreras (Bride)
  const sasha = await prisma.guest.findFirst({
    where: {
      firstName: "Sasha",
      lastName: "Contreras",
    },
  })

  if (!sasha) {
    console.error("❌ Could not find Sasha Contreras")
    return
  }

  console.log(`✓ Found Jeffery Erhunse (${jeffery.id})`)
  console.log(`✓ Found Sasha Contreras (${sasha.id})`)

  // Find the head table
  const headTable = await prisma.table.findFirst({
    where: {
      name: "Head Table",
      seatingChart: {
        coupleId: jeffery.coupleId,
      },
    },
    include: {
      seats: true,
    },
  })

  if (!headTable) {
    console.error("❌ Could not find Head Table")
    return
  }

  console.log(`✓ Found Head Table (${headTable.id}) with capacity ${headTable.capacity}`)

  // Remove any existing seat assignments for these guests
  await prisma.seat.deleteMany({
    where: {
      OR: [
        { guestId: jeffery.id },
        { guestId: sasha.id },
      ],
    },
  })

  console.log("✓ Cleared any existing seat assignments")

  // Assign Jeffery as Groom at seat 3 (position 3 in top row - GROOM spot)
  const groomSeat = await prisma.seat.create({
    data: {
      tableId: headTable.id,
      guestId: jeffery.id,
      seatNumber: 3,
      notes: "GROOM",
    },
  })

  console.log(`✓ Assigned Jeffery Erhunse as GROOM at seat ${groomSeat.seatNumber}`)

  // Assign Sasha as Bride at seat 4 (position 4 in top row - BRIDE spot)
  const brideSeat = await prisma.seat.create({
    data: {
      tableId: headTable.id,
      guestId: sasha.id,
      seatNumber: 4,
      notes: "BRIDE",
    },
  })

  console.log(`✓ Assigned Sasha Contreras as BRIDE at seat ${brideSeat.seatNumber}`)

  console.log("\n✅ Successfully assigned bride and groom seats!")
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
