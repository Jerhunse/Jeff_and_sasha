import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addRegistryLink() {
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

    // Check if Amazon registry already exists
    const existingAmazon = await prisma.registryLink.findFirst({
      where: {
        coupleId: wedding.id,
        label: 'Amazon',
      },
    })

    if (existingAmazon) {
      // Update existing Amazon registry
      await prisma.registryLink.update({
        where: { id: existingAmazon.id },
        data: {
          url: 'https://www.amazon.com/wedding/guest-view/1JFLEJMAOAH27',
          description: 'View our Amazon wedding registry',
        },
      })
      console.log('✅ Updated existing Amazon registry link')
    } else {
      // Create new Amazon registry
      await prisma.registryLink.create({
        data: {
          coupleId: wedding.id,
          label: 'Amazon',
          url: 'https://www.amazon.com/wedding/guest-view/1JFLEJMAOAH27',
          description: 'View our Amazon wedding registry',
          order: 0,
        },
      })
      console.log('✅ Created Amazon registry link')
    }

    console.log('\n✅ Registry link added successfully!')
    console.log('Amazon Registry: https://www.amazon.com/wedding/guest-view/1JFLEJMAOAH27')

  } catch (error) {
    console.error('Error adding registry link:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addRegistryLink()
