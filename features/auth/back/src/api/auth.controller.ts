import type { Request, Response } from 'express';
import {
  loginUseCase,
  registerUseCase,
  verifyUseCase,
  resendCodeUseCase,
} from '../config/auth.wiring';

type LoginBody = {
  email: string;
  password: string;
};

type RegisterBody = {
  email: string;
  password: string;
  name: string;
};

type VerifyBody = {
  email: string;
  code: string;
};

type ResendCodeBody = {
  email: string;
};

export const loginController = async (
  req: Request<unknown, unknown, LoginBody>,
  res: Response,
) => {
  try {
    const { email, password } = req.body;
    const result = await loginUseCase.execute(email, password);
    res.json(result);
  } catch (error) {
    // Manejo básico de errores
    res.status(401).json({
      message:
        error instanceof Error
          ? error.message
          : 'Email o contraseña incorrectos',
    });
  }
};

export const registerController = async (
  req: Request<unknown, unknown, RegisterBody>,
  res: Response,
) => {
  try {
    const { email, password, name } = req.body;
    const result = await registerUseCase.execute({ email, password, name });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Error',
    });
  }
};

export const verifyController = async (
  req: Request<unknown, unknown, VerifyBody>,
  res: Response,
) => {
  try {
    const { email, code } = req.body;
    const result = await verifyUseCase.execute(email, code);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : 'Código inválido o expirado',
    });
  }
};

export const resendCodeController = async (
  req: Request<unknown, unknown, ResendCodeBody>,
  res: Response,
) => {
  try {
    const { email } = req.body;
    const result = await resendCodeUseCase.execute(email);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Error al reenviar',
    });
  }
};
