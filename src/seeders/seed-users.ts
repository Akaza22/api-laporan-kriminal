import { pool } from '../config/db';
import { hashPassword } from '../utils/password';

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding users...');

    // ===== DATA SEED =====
    const users = [
      {
        full_name: 'admin 1',
        email: 'admin1@test.com',
        password: 'admin123',
        role: 'ADMIN',
        phone: '081234567890',
      },
      {
        full_name: 'admin 2',
        email: 'admin2@test.com',
        password: 'admin123',
        role: 'ADMIN',
        phone: '081234567899',
      },
      {
        full_name: 'user 1',
        email: 'user1@test.com',
        password: 'user123',
        role: 'USER',
        phone: '081234567891',
      },
      {
        full_name: 'user 2',
        email: 'user2@test.com',
        password: 'user123',
        role: 'USER',
        phone: '081234567892',
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
