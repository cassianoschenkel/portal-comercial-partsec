import net from "node:net";
import tls from "node:tls";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type SendMailResult = {
  sent: boolean;
  reason?: string;
};

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM &&
      process.env.SMTP_FROM_NAME
  );
}

function encodeBase64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

function escapeHeader(value: string) {
  return value.replace(/[\r\n]/g, " ");
}

function buildMessage({ to, subject, text, html }: SendMailInput) {
  const from = process.env.SMTP_FROM ?? "";
  const boundary = `partsec-${Date.now()}`;

  if (!html) {
    return [
      `From: ${escapeHeader(from)}`,
      `To: ${escapeHeader(to)}`,
      `Subject: ${escapeHeader(subject)}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      text,
    ].join("\r\n");
  }

  return [
    `From: ${escapeHeader(from)}`,
    `To: ${escapeHeader(to)}`,
    `Subject: ${escapeHeader(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    text,
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
    `--${boundary}--`,
  ].join("\r\n");
}

function createSmtpClient(port: number, host: string) {
  if (port === 465) {
    return tls.connect({ host, port, servername: host });
  }

  return net.connect({ host, port });
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  if (!smtpConfigured()) {
    return { sent: false, reason: "SMTP não configurado." };
  }

  const host = process.env.SMTP_HOST as string;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER as string;
  const pass = process.env.SMTP_PASS as string;
  const from = process.env.SMTP_FROM as string;

  return new Promise((resolve) => {
    const socket = createSmtpClient(port, host);
    let buffer = "";
    let settled = false;

    function finish(result: SendMailResult) {
      if (settled) return;
      settled = true;
      socket.end();
      resolve(result);
    }

    function write(command: string) {
      socket.write(`${command}\r\n`);
    }

    function waitForCode(expected: number | number[]) {
      const expectedCodes = Array.isArray(expected) ? expected : [expected];

      return new Promise<void>((resolveWait, rejectWait) => {
        function onData(chunk: Buffer) {
          buffer += chunk.toString("utf8");
          const lines = buffer.split(/\r\n/);
          const lastComplete = lines.length > 1 ? lines[lines.length - 2] : "";

          if (!/^\d{3} /.test(lastComplete)) {
            return;
          }

          socket.off("data", onData);
          const code = Number(lastComplete.slice(0, 3));
          buffer = "";

          if (expectedCodes.includes(code)) {
            resolveWait();
            return;
          }

          rejectWait(new Error(`SMTP retornou ${code}.`));
        }

        socket.on("data", onData);
      });
    }

    async function run() {
      await waitForCode(220);
      write(`EHLO ${host}`);
      await waitForCode(250);
      write("AUTH LOGIN");
      await waitForCode(334);
      write(encodeBase64(user));
      await waitForCode(334);
      write(encodeBase64(pass));
      await waitForCode(235);
      write(`MAIL FROM:<${from}>`);
      await waitForCode(250);
      write(`RCPT TO:<${input.to}>`);
      await waitForCode([250, 251]);
      write("DATA");
      await waitForCode(354);
      write(`${buildMessage(input)}\r\n.`);
      await waitForCode(250);
      write("QUIT");
      finish({ sent: true });
    }

    socket.once("error", (error) => {
      console.error("Falha ao enviar e-mail SMTP:", error);
      finish({ sent: false, reason: "Falha no envio SMTP." });
    });

    socket.setTimeout(15000, () => {
      finish({ sent: false, reason: "Timeout no envio SMTP." });
    });

    run().catch((error) => {
      console.error("Falha ao enviar e-mail SMTP:", error);
      finish({ sent: false, reason: "Falha no envio SMTP." });
    });
  });
}
