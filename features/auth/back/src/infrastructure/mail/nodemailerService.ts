import nodemailer, { type Transporter } from 'nodemailer';

import type { MailService } from '../../domain/ports';

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export class NodemailerService implements MailService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: SmtpConfig) {
    this.from = config.from;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const subject = 'Código de verificación';
    const text = `Tu código de verificación es: ${code}`;
    const html = `
      <div style="font-family: sans-serif; line-height: 1.5">
        <h2>Código de verificación</h2>
        <p>Tu código de verificación es:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 2px">${code}</p>
      </div>
    `;

    try {
      console.log(`📧 Intentando enviar código ${code} a ${email}...`);

      const info = await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject,
        text,
        html,
      });

      console.log(
        `✅ Email enviado exitosamente. MessageId: ${info.messageId}`,
      );
    } catch (error) {
      console.error('❌ Error al enviar email:', error);

      // Proporcionar mensajes de error más específicos
      if (error instanceof Error) {
        if (error.message.includes('Invalid login')) {
          throw new Error(
            'Credenciales SMTP inválidas. Verifica MAIL_USER y MAIL_PASS',
          );
        }
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error(
            `No se pudo conectar al servidor SMTP. Verifica MAIL_HOST y MAIL_PORT`,
          );
        }
        if (error.message.includes('self signed certificate')) {
          throw new Error(
            'Error de certificado SSL. Verifica la configuración de MAIL_SECURE',
          );
        }
      }

      throw error;
    }
  }
}

export default NodemailerService;
