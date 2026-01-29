import type { HttpRequest, HttpResponse } from './http.types';
import { loginUseCase } from '../config/auth.wiring';

type LoginBody = {
  email: string;
  password: string;
};

export const loginController = async (
  req: HttpRequest<LoginBody>,
  res: HttpResponse,
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
