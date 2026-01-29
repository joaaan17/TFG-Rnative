export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
}

export interface AuthToken {
  token: string;
  expiresIn: number;
}
