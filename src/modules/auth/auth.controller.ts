import { Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schema';
import { registerUser, loginUser } from './auth.services';

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const user = await registerUser(
    data.full_name,
    data.email,
    data.password,
    data.phone
  );

  res.status(201).json({
    message: 'User registered',
    user,
  });
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const token = await loginUser(data.email, data.password);

  res.json({
    message: 'Login success',
    token,
  });
};
