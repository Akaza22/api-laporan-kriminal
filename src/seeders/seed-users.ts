import { pool } from '../config/db';
import { hashPassword } from '../utils/password';

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding users...');

    // ===== DATA SEED =====
    const users = [
      {
        full_name: 'Default User',
        email: 'user@test.com',
        password: 'user123',
        role: 'USER',
      },
      {
        full_name: 'System Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'ADMIN',
      },
    ];

    for (const user of users) {
      // cek apakah email sudah ada
      const exists = await pool.query(
        'SELECT 1 FROM users WHERE email = $1 LIMIT 1',
        [user.email]
      );

      if (exists.rowCount) {
        console.log(`⚠️  ${user.role} already exists: ${user.email}`);
        continue;
      }

      const passwordHash = await hashPassword(user.password);

      await pool.query(
        `
        INSERT INTO users (full_name, email, password_hash, role, is_active)
        VALUES ($1, $2, $3, $4, true)
        `,
        [
          user.full_name,
          user.email,
          passwordHash,
          user.role,
        ]
      );

      console.log(`✅ ${user.role} created: ${user.email}`);
    }

    console.log('🌱 Seeding finished');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedUsers();
