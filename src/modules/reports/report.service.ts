import { pool } from '../../config/db';

/* =====================================================
   CREATE REPORT (WITH CATEGORY VALIDATION)
===================================================== */
export const createReport = async (
  userId: string,
  data: any
) => {

  // 🔥 Cek kategori ada & aktif
  const categoryCheck = await pool.query(
    `
    SELECT is_active
    FROM report_categories
    WHERE id = $1
    `,
    [data.category_id]
  );

  if (categoryCheck.rowCount === 0) {
    throw new Error('CATEGORY_NOT_FOUND');
  }

  if (!categoryCheck.rows[0].is_active) {
    throw new Error('CATEGORY_INACTIVE');
  }

  const query = `
    INSERT INTO reports
    (user_id, category_id, description,
     latitude, longitude, address, incident_time)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id, status, created_at
  `;

  const values = [
    userId,
    data.category_id,
    data.description,
    data.latitude,
    data.longitude,
    data.address,
    data.incident_time,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
};


/* =====================================================
   GET MY REPORTS (USER)
===================================================== */
export const getMyReports = async (userId: string) => {
  const { rows } = await pool.query(
    `
    SELECT
      r.id,
      c.name AS category_name,
      r.description,
      r.status,
      r.created_at
    FROM reports r
    LEFT JOIN report_categories c ON c.id = r.category_id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
    `,
    [userId]
  );

  return rows;
};


/* =====================================================
   GET ALL REPORTS (ADMIN - PAGINATED + CATEGORY JOIN)
===================================================== */
export const getAllReportsPaginated = async (
  status?: string,
  startDate?: string,
  endDate?: string,
  search?: string,
  assigned?: 'unclaimed' | 'mine',
  adminId?: string,
  page = 1,
  limit = 10
) => {
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];

  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }

  if (startDate) {
    values.push(startDate);
    conditions.push(`r.created_at >= $${values.length}`);
  }

  if (endDate) {
    values.push(endDate);
    conditions.push(`r.created_at <= $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`
      (
        r.description ILIKE $${values.length}
        OR r.address ILIKE $${values.length}
        OR c.name ILIKE $${values.length}
      )
    `);
  }

  if (assigned === 'unclaimed') {
    conditions.push(`r.assigned_admin_id IS NULL`);
  }

  if (assigned === 'mine' && adminId) {
    values.push(adminId);
    conditions.push(`r.assigned_admin_id = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

  // COUNT
  const countResult = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM reports r
    LEFT JOIN report_categories c ON c.id = r.category_id
    ${whereClause}
    `,
    values
  );

  // DATA
  values.push(limit, offset);

  const dataResult = await pool.query(
    `
    SELECT
      r.id,
      c.name AS category_name,
      r.status,
      r.address,
      r.created_at,
      r.assigned_admin_id,
      r.claimed_at
    FROM reports r
    LEFT JOIN report_categories c ON c.id = r.category_id
    ${whereClause}
    ORDER BY r.created_at DESC
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


/* =====================================================
   CLAIM REPORT (ADMIN)
===================================================== */
export const claimReport = async (
  reportId: string,
  adminId: string
) => {
  const result = await pool.query(
    `
    UPDATE reports
    SET assigned_admin_id = $1,
        status = 'IN_PROGRESS',
        claimed_at = NOW()
    WHERE id = $2
    AND assigned_admin_id IS NULL
    RETURNING *;
    `,
    [adminId, reportId]
  );

  if (result.rowCount === 0) {
    throw new Error('ALREADY_CLAIMED');
  }

  return result.rows[0];
};


/* =====================================================
   UPDATE STATUS (ONLY CLAIMING ADMIN)
===================================================== */
export const updateReportStatus = async (
  reportId: string,
  status: string,
  adminId: string
) => {
  const result = await pool.query(
    `
    UPDATE reports
    SET status = $1
    WHERE id = $2
    AND assigned_admin_id = $3
    RETURNING id, status;
    `,
    [status, reportId, adminId]
  );

  if (result.rowCount === 0) {
    throw new Error('NOT_ALLOWED');
  }

  return result.rows[0];
};


/* =====================================================
   GET REPORT DETAIL (FULL JOIN CATEGORY)
===================================================== */
export const getReportDetailById = async (reportId: string) => {
  const { rows } = await pool.query(
    `
    SELECT
      r.id,
      r.description,
      r.address,
      r.latitude,
      r.longitude,
      r.status,
      r.created_at,
      r.assigned_admin_id,
      r.claimed_at,

      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS category,

      json_build_object(
        'id', u.id,
        'full_name', u.full_name
      ) AS user,

      json_build_object(
        'id', admin.id,
        'full_name', admin.full_name
      ) AS assigned_admin,

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
    LEFT JOIN users admin ON admin.id = r.assigned_admin_id
    LEFT JOIN report_categories c ON c.id = r.category_id
    LEFT JOIN report_media rm ON rm.report_id = r.id
    WHERE r.id = $1
    GROUP BY r.id, u.id, admin.id, c.id
    `,
    [reportId]
  );

  return rows[0];
};