import { LoginUseCase } from '../application/usecases/login';
import { BcryptHasher } from '../infrastructure/crypto/bcryptHasher';
import { JwtTokenService } from '../infrastructure/tokens/jwtTokerService';
import { MongoAuthRepository } from '../infrastructure/persistence/mongo/mongoRepository';
import { RegisterUseCase } from '../application/usecases/register';

const authRepository = new MongoAuthRepository();
const passwordService = new BcryptHasher();
const tokenService = new JwtTokenService();

//Caso de uso de login
export const loginUseCase = new LoginUseCase(
  authRepository,
  passwordService,
  tokenService,
);

// Caso de uso de registro
export const registerUseCase = new RegisterUseCase(
  authRepository,
  passwordService,
);
