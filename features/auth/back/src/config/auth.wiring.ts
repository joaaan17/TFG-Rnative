import { LoginUseCase } from '../application/usecases/login';
import { BcryptHasher } from '../infrastructure/crypto/bcryptHasher';
import { JwtTokenService } from '../infrastructure/tokens/jwtTokerService';
import { MongoAuthRepository } from '../infrastructure/persistence/mongo/mongoRepository';

const authRepository = new MongoAuthRepository();
const passwordService = new BcryptHasher();
const tokenService = new JwtTokenService();

//Caso de uso de login
export const loginUseCase = new LoginUseCase(
  authRepository,
  passwordService,
  tokenService,
);

// Aquí exportarías también el registerUseCase, etc.
