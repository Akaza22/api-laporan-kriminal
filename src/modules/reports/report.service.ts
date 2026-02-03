import { pool } from '../../config/db';

export const createReport = async (
  userId: string,
  data: any
) => {
  const query = `
    INSERT INTO reports
    (user_id, category, description, latitude, longitude, address, incident_time)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id, status, created_at
  `;

  const values = [
    userId,
    data.category,
    data.description,
    data.latitude,
    data.longitude,
    data.address,
    data.incident_time,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const getMyReports = async (userId: string) => {
  const query = `
    SELECT id, category, status, created_at
    FROM reports
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows;
};

export const getAllReports = async () => {
  const query = `
    SELECT r.id, r.category, r.status, r.created_at,
           u.full_name AS reporter
    FROM reports r
    JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

export const updateReportStatus = async (
  reportId: string,
  status: string
) => {
  const query = `
    UPDATE reports
    SET status = $1
    WHERE id = $2
    RETURNING id, status
  `;

  const { rows } = await pool.query(query, [status, reportId]);
  return rows[0];
};
