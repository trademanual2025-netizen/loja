import nodemailer from 'nodemailer'

interface MailOptions {
    to: string
    subject: string
    html: string
    from?: string
}

interface SmtpConfig {
    host: string
    port: number
    user: string
    pass: string
    from: string
}

export async function sendEmail(options: MailOptions, smtp: SmtpConfig): Promise<{ ok: boolean; error?: string }> {
    try {
        const transporter = nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: smtp.port === 465,
            auth: {
                user: smtp.user,
                pass: smtp.pass,
            },
        })

        await transporter.sendMail({
            from: options.from || smtp.from,
            to: options.to,
            subject: options.subject,
            html: options.html,
        })

        return { ok: true }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        return { ok: false, error: message }
    }
}

export function buildContactNotificationHtml(data: {
    name: string
    email: string
    subject?: string
    message: string
    receivedAt: string
}): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;background:#f5f5f5;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <div style="background:#0d0a06;padding:24px 32px;border-bottom:2px solid rgba(200,160,80,0.4)">
      <p style="color:rgba(200,160,80,0.9);font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px">Giovana Dias Joias</p>
      <h2 style="color:#fff;margin:0;font-size:1.3rem;font-weight:300;letter-spacing:0.05em">Nova Mensagem de Contato</h2>
    </div>
    <div style="padding:28px 32px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px 0;color:#666;font-size:0.85rem;width:90px;vertical-align:top">Nome</td>
          <td style="padding:8px 0;color:#111;font-weight:600;font-size:0.9rem">${data.name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:0.85rem;vertical-align:top">Email</td>
          <td style="padding:8px 0;color:#111;font-size:0.9rem"><a href="mailto:${data.email}" style="color:#b8860b">${data.email}</a></td>
        </tr>
        ${data.subject ? `
        <tr>
          <td style="padding:8px 0;color:#666;font-size:0.85rem;vertical-align:top">Assunto</td>
          <td style="padding:8px 0;color:#111;font-size:0.9rem">${data.subject}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:8px 0;color:#666;font-size:0.85rem;vertical-align:top">Mensagem</td>
          <td style="padding:8px 0;color:#111;font-size:0.9rem;line-height:1.6;white-space:pre-wrap">${data.message}</td>
        </tr>
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee">
        <p style="color:#999;font-size:0.78rem;margin:0">Recebida em ${data.receivedAt}</p>
      </div>
      <div style="margin-top:16px">
        <a href="mailto:${data.email}" style="display:inline-block;padding:10px 24px;background:#0d0a06;color:#fff;border-radius:6px;text-decoration:none;font-size:0.85rem;font-weight:600">
          Responder ${data.name}
        </a>
      </div>
    </div>
  </div>
</body>
</html>`
}
