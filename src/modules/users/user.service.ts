import { pool } from '../../config/db';

interface GetLatestUsersParams {
  limit: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
}

interface GetUsersParams{
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}

export const getLatestUsersService = async ({
  limit,
  sortField,
  sortOrder,
}: GetLatestUsersParams) => {
  // whitelist column & order (ANTI SQL INJECTION)
  const allowedSortFields = ['created_at'];
  const allowedSortOrder = ['asc', 'desc'];

  const safeSortField = allowedSortFields.includes(sortField)
    ? sortField
    : 'created_at';

  const safeSortOrder = allowedSortOrder.includes(sortOrder)
    ? sortOrder
    : 'desc';

  const query = `
    SELECT
      id,
      full_name,
      email,
      role,
      is_active,
      created_at
    FROM users
    WHERE deleted_at IS NULL
    ORDER BY ${safeSortField} ${safeSortOrder}
    LIMIT $1
  `;

  const { rows } = await pool.query(query, [limit]);

  // mapping biar FE dapet format rapi
  return rows.map((user) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.is_active ? 'ACTIVE' : 'INACTIVE',
    created_at: user.created_at,
  }));
};


export const getUserById = async (userId: string) => {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      full_name,
      email,
      phone,
      role,
      is_active,
      created_at
    FROM users
    WHERE id = $1
    AND deleted_at IS NULL
    `,
    [userId]
  );

  return rows[0] || null;
};


export const getUsersPaginated = async ({
  page = 1,
  limit = 10,
  search,
  status,
  role,
}: GetUsersParams) => {
  const offset = (page - 1) * limit;

  const conditions: string[] = ['deleted_at IS NULL'];
  const values: any[] = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`
      (
        full_name ILIKE $${values.length}
        OR email ILIKE $${values.length}
      )
    `);
  }

  if (status !== undefined) {
    values.push(status === 'true');
    conditions.push(`is_active = $${values.length}`);
  }

  if (role) {
    values.push(role);
    conditions.push(`role = $${values.length}`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // COUNT
  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM users
      ${whereClause}
    `,
    values
  );

  // DATA
  const dataValues = [...values, limit, offset];

  const dataResult = await pool.query(
    `
      SELECT 
        id,
        full_name,
        email,
        phone,
        role,
        is_active,
        created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `,
    dataValues
  );

  const total = countResult.rows[0].total;

  return {
    data: dataResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};


export const getUserReports = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const offset = (page - 1) * limit;

  // 🔎 Cek user masih aktif
  const userCheck = await pool.query(
    `
    SELECT id
    FROM users
    WHERE id = $1
    AND deleted_at IS NULL
    `,
    [userId]
  );

  if (userCheck.rowCount === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  // 🔢 Total count (pakai join biar konsisten)
  const countResult = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM reports r
    WHERE r.user_id = $1
    `,
    [userId]
  );

  // 📄 Data query dengan join kategori
  const dataResult = await pool.query(
    `
    SELECT
      r.id,
      json_build_object(
        'id', c.id,
        'name', c.name
      ) AS category,
      r.description,
      r.status,
      r.created_at
    FROM reports r
    LEFT JOIN report_categories c
      ON c.id = r.category_id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  const total = countResult.rows[0].total;

  return {
    data: dataResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};


export const updateUserStatus = async (
  userId: string,
  isActive: boolean
) => {
  const result = await pool.query(
    `
      UPDATE users
      SET is_active = $1
      WHERE id = $2
      AND deleted_at IS NULL
      RETURNING id, full_name, email, role, is_active
    `,
    [isActive, userId]
  );

  if (result.rowCount === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  return result.rows[0];
};


export const updateUserRole = async (
  userId: string,
  newRole: 'USER' | 'ADMIN'
) => {
  const result = await pool.query(
    `
      UPDATE users
      SET role = $1
      WHERE id = $2
      AND deleted_at IS NULL
      RETURNING id, full_name, email, role, is_active
    `,
    [newRole, userId]
  );

  if (result.rowCount === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  return result.rows[0];
};

export const softDeleteUser = async (userId: string) => {
  const result = await pool.query(
    `
      UPDATE users
      SET deleted_at = NOW()
      WHERE id = $1
      AND deleted_at IS NULL
      RETURNING id, full_name, email
    `,
    [userId]
  );

  if (result.rowCount === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  return result.rows[0];
};

export const restoreUser = async (userId: string) => {
  const result = await pool.query(
    `
      UPDATE users
      SET deleted_at = NULL
      WHERE id = $1
      AND deleted_at IS NOT NULL
      RETURNING id, full_name, email, role, is_active, deleted_at
    `,
    [userId]
  );

  if (result.rowCount === 0) {
    throw new Error('USER_NOT_FOUND_OR_NOT_DELETED');
  }

  return result.rows[0];
};

export const getProfile = async (userId: string) => {
  

  const { rows } = await pool.query(
    `
    SELECT 
      id,
      full_name,
      email,
      phone,
      role,
      created_at
    FROM users
    WHERE id = $1
    AND deleted_at IS NULL
    `,
    [userId]
  );


  if (rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  return rows[0];
};

export const updateProfile = async (
  userId: string,
  payload: { full_name?: string; phone?: string }
) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (payload.full_name !== undefined) {
    fields.push(`full_name = $${index}`);
    values.push(payload.full_name);
    index++;
  }

  if (payload.phone !== undefined) {
    fields.push(`phone = $${index}`);
    values.push(payload.phone);
    index++;
  }

  if (fields.length === 0) {
    throw new Error('NO_FIELDS_TO_UPDATE');
  }

  values.push(userId);

  const query = `
    UPDATE users
    SET ${fields.join(', ')},
        updated_at = NOW()
    WHERE id = $${index}
    AND deleted_at IS NULL
    RETURNING id, full_name, email, phone, role, updated_at
  `;

  const { rowCount, rows } = await pool.query(query, values);

  if (rowCount === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  return rows[0];
};
