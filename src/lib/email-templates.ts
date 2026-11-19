/**
 * Email templates para notificações
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function getEmailTemplate(type: string, data: Record<string, any>): EmailTemplate {
  switch (type) {
    case "password_reset":
      return passwordResetTemplate(data);
    case "2fa_enabled":
      return twoFactorEnabledTemplate(data);
    case "login_alert":
      return loginAlertTemplate(data);
    case "gdpr_data_export":
      return gdprDataExportTemplate(data);
    default:
      throw new Error(`Unknown email template: ${type}`);
  }
}

function passwordResetTemplate(data: { email: string; resetLink: string }): EmailTemplate {
  return {
    subject: "Redefine a tua palavra-passe - Fiães SC",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #006633; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button {
      display: inline-block;
      background-color: #006633;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer { color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Fiães Sport Clube</h1>
    </div>
    <div class="content">
      <p>Olá,</p>
      <p>Recebemos um pedido para redefinir a tua palavra-passe. Se não foi tu, ignora este email.</p>
      <p><a href="${data.resetLink}" class="button">Redefinir Palavra-passe</a></p>
      <p>O link é válido por 24 horas.</p>
      <p>Se tiveres problemas, copia este link:<br>${data.resetLink}</p>
    </div>
    <div class="footer">
      <p>© 2026 Fiães Sport Clube. Todos os direitos reservados.</p>
      <p><a href="https://fiaes.pt/privacidade">Política de Privacidade</a> | <a href="https://fiaes.pt/termos">Termos de Serviço</a></p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Redefinir Palavra-passe - Fiães SC

Olá,

Recebemos um pedido para redefinir a tua palavra-passe. Se não foi tu, ignora este email.

Link para redefinir: ${data.resetLink}

O link é válido por 24 horas.

© 2026 Fiães Sport Clube
    `,
  };
}

function twoFactorEnabledTemplate(data: { email: string; deviceName?: string }): EmailTemplate {
  return {
    subject: "Autenticação de Dois Fatores Ativada - Fiães SC",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #006633; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .alert { background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; }
    .footer { color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Fiães Sport Clube</h1>
    </div>
    <div class="content">
      <p>Olá,</p>
      <p>✅ A autenticação de dois fatores (2FA) foi ativada na tua conta.</p>
      <div class="alert">
        <strong>⚠️ Importante:</strong> A partir de agora, terás de usar um código adicional ao fazeres login.
      </div>
      <p><strong>O que fazer:</strong></p>
      <ul>
        <li>Guarda os teus códigos de backup num local seguro</li>
        <li>Se perderes acesso ao dispositivo, podes usar um código de backup</li>
        <li>Se não foi tu, contacta-nos imediatamente</li>
      </ul>
      <p>Para desativar 2FA, acede às definições da tua conta.</p>
    </div>
    <div class="footer">
      <p>© 2026 Fiães Sport Clube. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Autenticação de Dois Fatores Ativada

Olá,

A autenticação de dois fatores (2FA) foi ativada na tua conta.

Guarda os teus códigos de backup num local seguro. Se perderes acesso ao dispositivo, podes usar um código de backup.

© 2026 Fiães Sport Clube
    `,
  };
}

function loginAlertTemplate(data: { email: string; location?: string; timestamp: string }): EmailTemplate {
  return {
    subject: "Nova Atividade na Tua Conta - Fiães SC",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #006633; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .details { background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
    .footer { color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Fiães Sport Clube</h1>
    </div>
    <div class="content">
      <p>Olá,</p>
      <p>Registámos uma nova atividade na tua conta.</p>
      <div class="details">
        <p><strong>Data/Hora:</strong> ${data.timestamp}</p>
        ${data.location ? `<p><strong>Localização:</strong> ${data.location}</p>` : ""}
      </div>
      <p>Se não foi tu, altera imediatamente a tua palavra-passe ou contacta-nos.</p>
    </div>
    <div class="footer">
      <p>© 2026 Fiães Sport Clube. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Nova Atividade na Tua Conta

Olá,

Registámos uma nova atividade na tua conta em ${data.timestamp}.

Se não foi tu, altera imediatamente a tua palavra-passe.

© 2026 Fiães Sport Clube
    `,
  };
}

function gdprDataExportTemplate(data: { email: string; downloadLink: string; expiresIn: string }): EmailTemplate {
  return {
    subject: "Exportação de Dados Pessoais - Fiães SC (GDPR)",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #006633; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button {
      display: inline-block;
      background-color: #006633;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer { color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Fiães Sport Clube</h1>
    </div>
    <div class="content">
      <p>Olá,</p>
      <p>Os teus dados pessoais estão prontos para download, conforme solicitado sob GDPR.</p>
      <p><a href="${data.downloadLink}" class="button">Descarregar Dados (ZIP)</a></p>
      <p>O arquivo expira em ${data.expiresIn}.</p>
      <p>O arquivo contém todos os dados pessoais que temos sobre ti, incluindo:</p>
      <ul>
        <li>Informações de perfil</li>
        <li>Registos de atividade</li>
        <li>Dados de torneios</li>
        <li>Registos de autenticação</li>
      </ul>
    </div>
    <div class="footer">
      <p>© 2026 Fiães Sport Clube. Todos os direitos reservados.</p>
      <p><a href="https://fiaes.pt/privacidade">Política de Privacidade</a></p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Exportação de Dados Pessoais - GDPR

Olá,

Os teus dados pessoais estão prontos para download: ${data.downloadLink}

O arquivo expira em ${data.expiresIn}.

© 2026 Fiães Sport Clube
    `,
  };
}
