import { pool } from '../config/db';

const clearReports = async () => {
  try {
    console.log('Clearing reports data...');

    await pool.query(`
      TRUNCATE TABLE report_media, reports
      RESTART IDENTITY CASCADE;
    `);

    console.log('Reports cleared successfully ✅');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing reports ❌', error);
    process.exit(1);
  }
};

clearReports();