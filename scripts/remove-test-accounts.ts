import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeTestAccounts() {
  const testEmails = [
    'jane@example.com',
    'bob@example.com',
    'john@example.com',
  ];

  try {
    console.log('Searching for test accounts...');
    
    // Find all guests with test emails
    const guests = await prisma.guest.findMany({
      where: {
        email: {
          in: testEmails,
        },
      },
      include: {
        household: true,
        rsvpResponses: true,
        invitations: true,
        tags: true,
      },
    });

    console.log(`Found ${guests.length} test accounts:`);
    guests.forEach((guest) => {
      console.log(`  - ${guest.firstName} ${guest.lastName} (${guest.email})`);
      console.log(`    Phone: ${guest.phone || 'N/A'}`);
      console.log(`    Household: ${guest.household?.name || 'N/A'}`);
      console.log(`    RSVP Responses: ${guest.rsvpResponses.length}`);
      console.log(`    Invitations: ${guest.invitations.length}`);
      console.log(`    Tags: ${guest.tags.length}`);
      console.log('');
    });

    if (guests.length === 0) {
      console.log('No test accounts found.');
      return;
    }

    // Delete related records first (due to foreign key constraints)
    console.log('Deleting test accounts and related data...');
    
    for (const guest of guests) {
      console.log(`Deleting ${guest.firstName} ${guest.lastName}...`);
      
      // Delete the guest (cascading deletes should handle related records)
      await prisma.guest.delete({
        where: {
          id: guest.id,
        },
      });
      
      console.log(`  ✓ Deleted ${guest.firstName} ${guest.lastName}`);
    }

    console.log('\n✅ Successfully removed all test accounts!');
    
  } catch (error) {
    console.error('Error removing test accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeTestAccounts();
