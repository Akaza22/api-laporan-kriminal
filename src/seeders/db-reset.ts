import { pool } from '../config/db';

async function resetDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      TRUNCATE TABLE
        report_messages,
        reports,
        users
      RESTART IDENTITY CASCADE;
    `);

    await client.query('COMMIT');

    console.log('✅ Database cleared successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to reset database:', error);
  } finally {
    client.release();
    process.exit();
  }
}

resetDatabase();
