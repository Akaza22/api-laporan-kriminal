import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3001,

  db: {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    name: process.env.DB_NAME as string,
  },

  jwtSecret: process.env.JWT_SECRET as string,
};
