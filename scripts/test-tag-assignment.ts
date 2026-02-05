import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function testTagAssignment() {
  console.log("🧪 Testing Tag Assignment Functionality\n")

  try {
    // Get a test guest
    const guest = await prisma.guest.findFirst({
      include: {
        tags: {
          include: { tag: true }
        }
      }
    })

    if (!guest) {
      console.log("❌ No guests found in database")
      return
    }

    console.log(`✅ Found test guest: ${guest.firstName} ${guest.lastName}`)
    console.log(`   Current tags: ${guest.tags.length === 0 ? 'None' : guest.tags.map(gt => gt.tag.name).join(', ')}`)

    // Get the Family tag
    const familyTag = await prisma.tag.findFirst({
      where: { name: "Family" }
    })

    if (!familyTag) {
      console.log("❌ Family tag not found")
      return
    }

    console.log(`\n✅ Found Family tag (ID: ${familyTag.id})`)

    // Check if tag is already assigned
    const existingAssignment = await prisma.guestTag.findUnique({
      where: {
        guestId_tagId: {
          guestId: guest.id,
          tagId: familyTag.id
        }
      }
    })

    if (existingAssignment) {
      console.log(`\n✅ Tag already assigned - Testing removal...`)
      
      // Remove the tag
      await prisma.guestTag.delete({
        where: { id: existingAssignment.id }
      })
      
      console.log(`✅ Successfully removed tag from guest`)
      
      // Add it back
      console.log(`\n✅ Testing assignment...`)
      await prisma.guestTag.create({
        data: {
          guestId: guest.id,
          tagId: familyTag.id
        }
      })
      
      console.log(`✅ Successfully re-assigned tag to guest`)
    } else {
      console.log(`\n✅ Testing assignment...`)
      
      // Assign the tag
      await prisma.guestTag.create({
        data: {
          guestId: guest.id,
          tagId: familyTag.id
        }
      })
      
      console.log(`✅ Successfully assigned tag to guest`)
    }

    // Verify the assignment
    const updatedGuest = await prisma.guest.findUnique({
      where: { id: guest.id },
      include: {
        tags: {
          include: { tag: true }
        }
      }
    })

    console.log(`\n✅ Verification:`)
    console.log(`   Guest: ${updatedGuest?.firstName} ${updatedGuest?.lastName}`)
    console.log(`   Tags: ${updatedGuest?.tags.map(gt => gt.tag.name).join(', ') || 'None'}`)

    console.log("\n🎉 All tests passed!")
  } catch (error) {
    console.error("❌ Test failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testTagAssignment()
