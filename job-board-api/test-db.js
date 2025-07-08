import 'dotenv/config';
import { db } from './utils/connectDB.js';
import { eq } from 'drizzle-orm';
import { usersTable } from './models/Users.model.js';

async function main() {
  // Ensure you have run migrations first to create the table:
  // npm run db:generate
  // npm run db:migrate

  const user = {
    name: 'John Doe',
    password: 'a-very-secret-password', // In a real app, this should be hashed
    email: 'john.doe@example.com',
    role: 'user',
  };

  try {
    console.log('Attempting to insert a new user...');
    // Use onConflictDoNothing to avoid errors on subsequent runs
    await db.insert(usersTable).values(user).onConflictDoNothing();
    console.log('New user created or already exists!');

    console.log('Getting all users from the database...');
    const users = await db.select().from(usersTable);
    console.log(users);

    console.log('Updating user info...');
    await db
      .update(usersTable)
      .set({
        name: 'Johnathan Doe',
      })
      .where(eq(usersTable.email, user.email));
    console.log('User info updated!');

    console.log('Deleting the user...');
    await db.delete(usersTable).where(eq(usersTable.email, user.email));
    console.log('User deleted!');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    console.log('Script finished.');
    // Exit the process because the DB pool connection is keeping it alive.
    process.exit(0);
  }
}

main();
