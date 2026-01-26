import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ensure user exists before creating related records
export async function ensureUserExists(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    // Create a placeholder user - will be updated on proper sync
    await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@placeholder.local`,
      },
    });
  }
}
