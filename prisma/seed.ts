import { prisma } from '../src/app/lib/prisma';
import { UserRole } from '../src/generated/prisma/enums';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@gmail.com';
  
  // Check if admin already exists to prevent duplicate seeding
  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Skipping seed.');
    return;
  }

  // Hash password using the same cost factor (10) as in user.service.ts
  const hashedPassword = await bcrypt.hash('12345678', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: 'ACTIVE', // Good practice to activate the admin immediately
    }
  });

  console.log(`Successfully created admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
