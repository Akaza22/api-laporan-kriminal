import { pool } from "../../config/db";


export const getSystemSettings = async () => {
  const { rows } = await pool.query(`
    SELECT maintenance_mode, max_upload_size
    FROM system_settings
    LIMIT 1
  `);

  return rows[0];
};

export const updateSystemSettings = async (payload: {
  maintenance_mode?: boolean;
  max_upload_size?: number;
}) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (payload.maintenance_mode !== undefined) {
    fields.push(`maintenance_mode = $${index}`);
    values.push(payload.maintenance_mode);
    index++;
  }

  if (payload.max_upload_size !== undefined) {
    fields.push(`max_upload_size = $${index}`);
    values.push(payload.max_upload_size);
    index++;
  }

  if (fields.length === 0) {
    throw new Error('NO_FIELDS_TO_UPDATE');
  }

  const query = `
    UPDATE system_settings
    SET ${fields.join(', ')},
        updated_at = NOW()
    RETURNING maintenance_mode, max_upload_size
  `;

  const { rows } = await pool.query(query, values);

  return rows[0];
};