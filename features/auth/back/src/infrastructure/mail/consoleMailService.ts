import type { MailService } from '../../domain/ports';

/**
 * Adaptador "dummy" para desarrollo: no envía emails reales, solo loguea.
 * Útil para mantener el módulo portable sin depender de SMTP.
 */
export class ConsoleMailService implements MailService {
  async sendVerificationCode(email: string, code: string): Promise<void> {
    console.log(`[MAIL:console] code=${code} to=${email}`);
  }
}

export default ConsoleMailService;
