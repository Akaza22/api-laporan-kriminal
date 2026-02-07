import { pool } from '../../config/db';

interface GetLatestUsersParams {
  limit: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
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
    `,
    [userId]
  );

  return rows[0] || null;
};
