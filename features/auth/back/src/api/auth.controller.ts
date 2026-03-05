import type { Request, Response } from 'express';
import { authEnv } from '../config/auth.env';
import {
  loginUseCase,
  registerUseCase,
  verifyUseCase,
  resendCodeUseCase,
  resetPasswordUseCase,
  sendPasswordResetCodeUseCase,
  verifyPasswordResetCodeUseCase,
  deleteUserUseCase,
} from '../config/auth.wiring';

type LoginBody = {
  email: string;
  password: string;
};

type RegisterBody = {
  email: string;
  password: string;
  name: string;
  username: string;
};

type VerifyBody = {
  email: string;
  code: string;
};

type ResendCodeBody = {
  email: string;
};

type ResetPasswordBody = {
  email: string;
  code: string;
  newPassword: string;
};

type SendPasswordResetCodeBody = {
  email: string;
};

type VerifyPasswordResetCodeBody = {
  email: string;
  code: string;
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
    const { email, password, name, username } = req.body;
    const result = await registerUseCase.execute({
      email,
      password,
      name,
      username: username ?? '',
    });
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
        error instanceof Error ? error.message : 'Código inválido o expirado',
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

export const resetPasswordController = async (
  req: Request<unknown, unknown, ResetPasswordBody>,
  res: Response,
) => {
  try {
    const { email, code, newPassword } = req.body;
    const result = await resetPasswordUseCase.execute(email, code, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'Error al resetear contraseña',
    });
  }
};

export const sendPasswordResetCodeController = async (
  req: Request<unknown, unknown, SendPasswordResetCodeBody>,
  res: Response,
) => {
  try {
    const { email } = req.body;
    const result = await sendPasswordResetCodeUseCase.execute(email);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : 'Error al enviar código de recuperación',
    });
  }
};

export const verifyPasswordResetCodeController = async (
  req: Request<unknown, unknown, VerifyPasswordResetCodeBody>,
  res: Response,
) => {
  try {
    const { email, code } = req.body;
    const result = await verifyPasswordResetCodeUseCase.execute(email, code);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : 'Código de verificación incorrecto',
    });
  }
};

export const deleteUserController = async (
  req: Request<{ id: string }> & { auth?: { userId: string; email: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const auth = req.auth;
    if (!auth) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    if (!id) {
      res.status(400).json({ message: 'ID de usuario requerido' });
      return;
    }
    const isSelf = auth.userId === id;
    const isAdmin = authEnv.adminEmails.includes(auth.email);
    if (!isSelf && !isAdmin) {
      res.status(403).json({
        message: 'Solo puedes eliminar tu propia cuenta o ser admin',
      });
      return;
    }
    await deleteUserUseCase.execute(id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : 'Usuario no encontrado',
    });
  }
};
