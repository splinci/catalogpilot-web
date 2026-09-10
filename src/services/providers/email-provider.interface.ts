/**
 * ============================================================================
 * Splinci Commerce OS — Email Provider Abstraction Layer
 * ============================================================================
 * Specification Reference: PROVIDER-001 / CI-001 / INFRA-001
 * Domain: Transactional Email Delivery Abstraction
 * ============================================================================
 */

export interface SendEmailInput {
  companyId: string;
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  templateId?: string;
  idempotencyKey?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId: string;
  status: "SENT" | "FAILED" | "QUEUED";
  timestamp: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface EmailProvider {
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
}

export class MockEmailProvider implements EmailProvider {
  private sentEmails: SendEmailInput[] = [];

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    if (!input.to || !input.to.includes("@")) {
      return {
        success: false,
        messageId: "",
        status: "FAILED",
        timestamp: new Date().toISOString(),
        errorCode: "INVALID_RECIPIENT",
        errorMessage: "Recipient email address is invalid",
      };
    }

    this.sentEmails.push(input);

    return {
      success: true,
      messageId: `MSG-MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "SENT",
      timestamp: new Date().toISOString(),
    };
  }

  getSentEmails(): SendEmailInput[] {
    return [...this.sentEmails];
  }

  clearSentEmails() {
    this.sentEmails = [];
  }
}

export class SMTPEmailProvider implements EmailProvider {
  constructor(
    private host?: string,
    private port?: number,
    private user?: string,
    private pass?: string,
    private from?: string
  ) {}

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const host = this.host || process.env.SMTP_HOST || "smtp.gmail.com";
    const port = this.port || Number(process.env.SMTP_PORT) || 465;
    const user = this.user || process.env.SMTP_USER || "info@splinci.com";
    const pass = this.pass || process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
    const fromAddr = this.from || process.env.SMTP_FROM || process.env.EMAIL_FROM || user || "info@splinci.com";

    if (!host) {
      throw new Error("SMTP Configuration Error: SMTP_HOST environment variable is missing.");
    }

    if (!input.to || !input.to.includes("@")) {
      return {
        success: false,
        messageId: "",
        status: "FAILED",
        timestamp: new Date().toISOString(),
        errorCode: "INVALID_RECIPIENT",
        errorMessage: "Recipient email address is invalid",
      };
    }

    // If credentials are present, execute native TLS SMTP transmission
    if (pass && user) {
      try {
        const messageId = await this.sendViaTLS(host, port, user, pass, fromAddr, input);
        return {
          success: true,
          messageId,
          status: "SENT",
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        // Sanitize error message to ensure no credentials are ever exposed
        const safeErrorMsg = (err?.message || "SMTP transmission failed").replace(new RegExp(pass, "g"), "***REDACTED***");
        return {
          success: false,
          messageId: "",
          status: "FAILED",
          timestamp: new Date().toISOString(),
          errorCode: "SMTP_TRANSMISSION_ERROR",
          errorMessage: safeErrorMsg,
        };
      }
    }

    // Production mode validation
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP Configuration Error: SMTP_PASS / SMTP_USER environment variables are missing in production.");
    }

    // Sandbox / Test fallback when credentials not provided
    return {
      success: true,
      messageId: `MSG-SMTP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "SENT",
      timestamp: new Date().toISOString(),
    };
  }

  private sendViaTLS(
    host: string,
    port: number,
    user: string,
    pass: string,
    from: string,
    input: SendEmailInput
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tls = await import("tls");
        const socket = tls.connect(port, host, { servername: host }, () => {
          let step = 0;
          let buffer = "";
          const msgId = `<${Date.now()}.${Math.floor(Math.random() * 10000)}@splinci.com>`;

          const send = (cmd: string) => {
            socket.write(cmd + "\r\n");
          };

          socket.on("data", (data) => {
            buffer += data.toString();
            const lines = buffer.split("\r\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line) continue;
              const code = parseInt(line.substring(0, 3), 10);

              if (step === 0 && code === 220) {
                step = 1;
                send(`EHLO splinci.com`);
              } else if (step === 1 && code === 250) {
                step = 2;
                send(`AUTH LOGIN`);
              } else if (step === 2 && code === 334) {
                step = 3;
                send(Buffer.from(user).toString("base64"));
              } else if (step === 3 && code === 334) {
                step = 4;
                send(Buffer.from(pass).toString("base64"));
              } else if (step === 4 && code === 235) {
                step = 5;
                send(`MAIL FROM:<${from}>`);
              } else if (step === 5 && code === 250) {
                step = 6;
                send(`RCPT TO:<${input.to}>`);
              } else if (step === 6 && code === 250) {
                step = 7;
                send(`DATA`);
              } else if (step === 7 && code === 354) {
                step = 8;
                const mime = [
                  `From: ${from}`,
                  `To: ${input.to}`,
                  `Subject: ${input.subject}`,
                  `Message-ID: ${msgId}`,
                  `MIME-Version: 1.0`,
                  `Content-Type: text/plain; charset=utf-8`,
                  ``,
                  input.bodyText,
                  `.`,
                ].join("\r\n");
                socket.write(mime + "\r\n");
              } else if (step === 8 && code === 250) {
                step = 9;
                send(`QUIT`);
                socket.end();
                resolve(msgId);
              } else if (code >= 400) {
                socket.end();
                reject(new Error(`SMTP server error code ${code}: ${line}`));
              }
            }
          });
        });

        socket.on("error", (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const mockEmailProvider = new MockEmailProvider();
