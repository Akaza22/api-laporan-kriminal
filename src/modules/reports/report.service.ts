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

export const getAllReportsPaginated = async (
  status?: string,
  startDate?: string,
  endDate?: string,
  search?: string,
  page = 1,
  limit = 10
) => {
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (startDate) {
    values.push(startDate);
    conditions.push(`created_at >= $${values.length}`);
  }

  if (endDate) {
    values.push(endDate);
    conditions.push(`created_at <= $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`
      (
        description ILIKE $${values.length}
        OR address ILIKE $${values.length}
      )
    `);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

  // total count
  const countResult = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM reports
    ${whereClause}
    `,
    values
  );

  // data
  values.push(limit, offset);

  const dataResult = await pool.query(
    `
    SELECT *
    FROM reports
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
    `,
    values
  );

  return {
    data: dataResult.rows,
    total: countResult.rows[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult.rows[0].total / limit),
  };
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

export const getReportDetailById = async (reportId: string) => {
  const { rows } = await pool.query(
    `
    SELECT
      r.id,
      r.category,
      r.description,
      r.address,
      r.latitude,
      r.longitude,
      r.status,
      r.created_at,
      json_build_object(
        'full_name', u.full_name
      ) AS user,
      COALESCE(
        json_agg(
          json_build_object(
            'id', rm.id,
            'url', rm.file_url,
            'type', rm.file_type
          )
        ) FILTER (WHERE rm.id IS NOT NULL),
        '[]'
      ) AS images
    FROM reports r
    JOIN users u ON u.id = r.user_id
    LEFT JOIN report_media rm ON rm.report_id = r.id
    WHERE r.id = $1
    GROUP BY r.id, u.full_name
    `,
    [reportId]
  );

  return rows[0];
};


