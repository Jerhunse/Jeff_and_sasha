import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function linkPlusOnesToParents() {
  const guests = await prisma.guest.findMany({
    include: { rsvpResponses: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })

  const primaryGuests = guests.filter(g => g.isPrimaryContact)
  const nonPrimaryGuests = guests.filter(g => !g.isPrimaryContact)

  const rsvpWithPlusOnes = await prisma.rSVPResponse.findMany({
    where: { plusOneName: { not: null } },
    include: { guest: true },
  })

  console.log(`Primary guests: ${primaryGuests.length}`)
  console.log(`Non-primary guests: ${nonPrimaryGuests.length}`)
  console.log(`RSVPs with plus-one names: ${rsvpWithPlusOnes.length}`)

  const parentChildPairs: { parentId: string; childId: string; parentName: string; childName: string }[] = []
  const matchedChildIds = new Set<string>()

  for (const rsvp of rsvpWithPlusOnes) {
    const parent = rsvp.guest
    const plusOneNames = rsvp.plusOneName!.split(',').map(n => n.trim()).filter(Boolean)

    for (const poName of plusOneNames) {
      const parentFullName = `${parent.firstName} ${parent.lastName}`.toLowerCase().trim()
      if (poName.toLowerCase().trim() === parentFullName) continue

      // Try exact match against non-primary guests
      let matched = false
      for (const g of nonPrimaryGuests) {
        if (matchedChildIds.has(g.id)) continue
        const gFullName = `${g.firstName} ${g.lastName}`.toLowerCase().trim()
        if (gFullName === poName.toLowerCase().trim()) {
          parentChildPairs.push({
            parentId: parent.id,
            childId: g.id,
            parentName: `${parent.firstName} ${parent.lastName}`,
            childName: `${g.firstName} ${g.lastName}`,
          })
          matchedChildIds.add(g.id)
          matched = true
          break
        }
      }

      if (!matched) {
        // Fuzzy: normalize whitespace and try
        const poNorm = poName.toLowerCase().trim().replace(/\s+/g, ' ')
        for (const g of nonPrimaryGuests) {
          if (matchedChildIds.has(g.id)) continue
          const gNorm = `${g.firstName} ${g.lastName}`.toLowerCase().trim().replace(/\s+/g, ' ')
          if (gNorm === poNorm) {
            parentChildPairs.push({
              parentId: parent.id,
              childId: g.id,
              parentName: `${parent.firstName} ${parent.lastName}`,
              childName: `${g.firstName} ${g.lastName}`,
            })
            matchedChildIds.add(g.id)
            matched = true
            break
          }
        }
      }

      if (!matched) {
        // Try first-name-only match for single-word plus-one names
        const poNameParts = poName.trim().split(/\s+/)
        if (poNameParts.length === 1) {
          for (const g of nonPrimaryGuests) {
            if (matchedChildIds.has(g.id)) continue
            if (g.firstName.toLowerCase().trim() === poName.toLowerCase().trim()) {
              parentChildPairs.push({
                parentId: parent.id,
                childId: g.id,
                parentName: `${parent.firstName} ${parent.lastName}`,
                childName: `${g.firstName} ${g.lastName}`,
              })
              matchedChildIds.add(g.id)
              matched = true
              break
            }
          }
        }
      }

      if (!matched) {
        console.log(`WARNING: No match for plus-one "${poName}" (parent: ${parent.firstName} ${parent.lastName})`)
      }
    }
  }

  console.log(`\nTotal parent-child pairs to create: ${parentChildPairs.length}`)
  console.log(`Unmatched non-primary guests: ${nonPrimaryGuests.filter(g => !matchedChildIds.has(g.id)).length}`)

  // Now do the actual updates in a transaction
  console.log('\n--- Updating database ---\n')

  let updated = 0
  let errors = 0

  for (const pair of parentChildPairs) {
    try {
      await prisma.guest.update({
        where: { id: pair.childId },
        data: { parentGuestId: pair.parentId },
      })
      console.log(`  ✓ ${pair.childName} -> parent: ${pair.parentName}`)
      updated++
    } catch (err) {
      console.error(`  ✗ Failed: ${pair.childName} -> ${pair.parentName}: ${err}`)
      errors++
    }
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`Updated: ${updated}`)
  console.log(`Errors: ${errors}`)

  // Handle the Sasha Contreras case: she's isPrimaryContact=true and should also be linked to Jeffery Erhunse
  // (She's the bride - skip, she's a primary guest in her own right)

  // Verify results
  const linkedGuests = await prisma.guest.findMany({
    where: { parentGuestId: { not: null } },
    include: { parentGuest: true },
  })
  console.log(`\nGuests now linked to a parent: ${linkedGuests.length}`)

  const parentsWithChildren = await prisma.guest.findMany({
    where: { plusOnes: { some: {} } },
    include: { plusOnes: true },
  })
  console.log(`Parents with plus-ones: ${parentsWithChildren.length}`)
  for (const p of parentsWithChildren) {
    console.log(`  ${p.firstName} ${p.lastName}: ${p.plusOnes.map(po => `${po.firstName} ${po.lastName}`).join(', ')}`)
  }

  await prisma.$disconnect()
}

linkPlusOnesToParents().catch(console.error)
