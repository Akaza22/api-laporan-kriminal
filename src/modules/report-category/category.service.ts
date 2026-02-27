import { pool } from '../../config/db';

/* ============================
   CREATE CATEGORY
============================ */
export const createCategory = async (
  name: string,
  description?: string
) => {
  const query = `
    INSERT INTO report_categories (name, description)
    VALUES ($1, $2)
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    name,
    description ?? null,
  ]);

  return rows[0];
};


/* ============================
   GET ALL CATEGORIES
============================ */
export const getAllCategories = async (
  search?: string,
  isActive?: boolean,
  page = 1,
  limit = 10
) => {
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }

  if (isActive !== undefined) {
    values.push(isActive);
    conditions.push(`is_active = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

  // Count
  const countResult = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM report_categories
    ${whereClause}
    `,
    values
  );

  // Data
  values.push(limit, offset);

  const dataResult = await pool.query(
    `
    SELECT id, name, description, is_active, created_at
    FROM report_categories
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


/* ============================
   GET CATEGORY BY ID
============================ */
export const getCategoryById = async (id: string) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM report_categories
    WHERE id = $1;
    `,
    [id]
  );

  return rows[0];
};


/* ============================
   UPDATE CATEGORY
============================ */
export const updateCategory = async (
  id: string,
  name?: string,
  description?: string
) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (name) {
    values.push(name);
    fields.push(`name = $${values.length}`);
  }

  if (description !== undefined) {
    values.push(description);
    fields.push(`description = $${values.length}`);
  }

  values.push(id);

  const query = `
    UPDATE report_categories
    SET ${fields.join(', ')},
        updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);

  return rows[0];
};


/* ============================
   DELETE CATEGORY
============================ */
export const deleteCategory = async (id: string) => {

  // Optional: cek apakah masih dipakai report
  const check = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM reports
    WHERE category_id = $1;
    `,
    [id]
  );

  if (check.rows[0].total > 0) {
    throw new Error('CATEGORY_IN_USE');
  }

  await pool.query(
    `
    DELETE FROM report_categories
    WHERE id = $1;
    `,
    [id]
  );

  return true;
};

export const updateCategoryStatus = async (
  id: string,
  isActive: boolean
) => {
  const { rows } = await pool.query(
    `
    UPDATE report_categories
    SET is_active = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *;
    `,
    [isActive, id]
  );

  return rows[0];
};