    import { pool } from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import bcrypt from 'bcrypt';

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
    WHERE email = $1 AND is_active = true AND deleted_at IS NULL
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

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const { rows } = await pool.query(
    `
    SELECT password_hash
    FROM users
    WHERE id = $1
    AND deleted_at IS NULL
    `,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const hashedPassword = rows[0].password_hash;

  const isMatch = await bcrypt.compare(currentPassword, hashedPassword);

  if (!isMatch) {
    throw new Error('INVALID_CURRENT_PASSWORD');
  }

  const isSamePassword = await bcrypt.compare(newPassword, hashedPassword);

  if (isSamePassword) {
    throw new Error('PASSWORD_MUST_BE_DIFFERENT');
  }

  if (newPassword.length < 8) {
    throw new Error('PASSWORD_TOO_SHORT');
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    `
    UPDATE users
    SET password_hash = $1
    WHERE id = $2
    `,
    [newHashedPassword, userId]
  );

  return true;
};
