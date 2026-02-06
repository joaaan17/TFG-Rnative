import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const profileEnv = {
  dbUri: process.env.AUTH_DB_URI || process.env.DB_URI || '',
};
