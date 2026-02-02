    import { pool } from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';

export const registerUser = async (
  full_name: string,
  email: string,
  password: string,
  phone?: string
) => {
  const hashed = await hashPassword(password);

  const query = `
    INSERT INTO users (full_name, email, password_hash, phone, role)
    VALUES ($1, $2, $3, $4, 'USER')
    RETURNING id, full_name, email, role
  `;

  const { rows } = await pool.query(query, [
    full_name,
    email,
    hashed,
    phone,
  ]);

  return rows[0];
};

export const loginUser = async (email: string, password: string) => {
  const query = `
    SELECT id, password_hash, role
    FROM users
    WHERE email = $1 AND is_active = true
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [email]);
  if (!rows.length) throw new Error('Invalid credentials');

  const user = rows[0];

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = signToken({
    userId: user.id,
    role: user.role,
  });

  return token;
};
