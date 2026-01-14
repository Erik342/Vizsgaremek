import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  return new Resend(apiKey);
}

export interface RegistrationEmailData {
  email: string;
  userName: string;
  verificationLink: string;
}

export interface InsuranceEmailData {
  email: string;
  userName: string;
  insuranceId: number;
  insuranceName: string;
  policyNumber: string;
  documentPDF?: Buffer;
  provider?: string;
  coverageType?: string;
  monthlyPremium?: string;
  startDate?: string;
  endDate?: string;
}

export async function sendRegistrationEmail({
  email,
  userName,
  verificationLink,
}: RegistrationEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Kiadás Figyelő - Fiók aktiválása',
      html: registrationEmailTemplate(userName, verificationLink),
    });

    if (response.error) {
      console.error('Email sending error:', response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Registration email error:', error);
    return { success: false, error: 'Hiba az email küldésekor' };
  }
}

export async function sendInsuranceDocumentEmail({
  email,
  userName,
  insuranceId,
  insuranceName,
  policyNumber,
  documentPDF,
  provider,
  coverageType,
  monthlyPremium,
  startDate,
  endDate,
}: InsuranceEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();

    const attachments = documentPDF ? [
      {
        filename: `biztositas_${insuranceId}_${Date.now()}.pdf`,
        content: documentPDF,
      },
    ] : [];

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Kiadás Figyelő - Biztosítás dokumentumok (${insuranceName})`,
      html: insuranceEmailTemplate(userName, insuranceName, policyNumber, provider, coverageType, monthlyPremium),
      attachments,
    });

    if (response.error) {
      console.error('Insurance email error:', response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Insurance email error:', error);
    return { success: false, error: 'Hiba az email küldésekor' };
  }
}

function registrationEmailTemplate(userName: string, verificationLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .header p {
            font-size: 16px;
            opacity: 0.95;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
          }
          .message {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.8;
          }
          .verification-box {
            background-color: #f9f9f9;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .verification-box p {
            color: #555;
            margin-bottom: 10px;
          }
          .verification-box strong {
            color: #333;
            font-weight: 600;
          }
          .button-wrapper {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
          }
          .link-alternative {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          }
          .link-alternative a {
            color: #667eea;
            text-decoration: none;
          }
          .link-alternative a:hover {
            text-decoration: underline;
          }
          .features {
            background-color: #f0f3ff;
            padding: 20px;
            border-radius: 6px;
            margin: 30px 0;
          }
          .features h3 {
            color: #667eea;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          .feature-item {
            color: #555;
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
          }
          .feature-item:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
          }
          .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
          }
          .footer p {
            margin-bottom: 8px;
          }
          .security-note {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 12px;
            color: #856404;
          }
          .security-note strong {
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Kiadás Figyelő</h1>
            <p>Üdvözöllek a közösségben! 👋</p>
          </div>
          <div class="content">
            <p class="greeting">Szia ${userName}!</p>
            <p class="message">
              Köszönünk a regisztrációért a Kiadás Figyelő alkalmazásba. Végezzük el az utolsó lépést az e-mail cím megerősítésével, hogy teljes hozzáférést kapj az alkalmazáshoz.
            </p>

            <div class="verification-box">
              <p><strong>Email megerősítés szükséges</strong></p>
              <p>A fiók aktiválásához kattints az alábbi gombra:</p>
            </div>

            <div class="button-wrapper">
              <a href="${verificationLink}" class="button">Email cím megerősítése</a>
            </div>

            <p class="message">
              Vagy másold be az alábbi linket a böngészőbe:
            </p>
            <p style="word-break: break-all; font-size: 11px; color: #999;">
              ${verificationLink}
            </p>

            <div class="features">
              <h3>Mit tudsz tenni aktiválás után?</h3>
              <div class="feature-item">Nyomon követheted kiadásaidat valós időben</div>
              <div class="feature-item">Részletes pénzügyi elemzéseket készíthetsz</div>
              <div class="feature-item">Költségvetést tervezhetsz kategóriák szerint</div>
              <div class="feature-item">Több számlát kezelhetesz egy helyről</div>
              <div class="feature-item">Biztosítási dokumentumokat tárolhatsz biztonságosan</div>
            </div>

            <div class="security-note">
              <strong>⚠️ Biztonság:</strong> Ez az email 24 óra múlva lejár. Ha nem regisztráltál, kérjük, hagyj figyelmen kívül erre az emailre.
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: #999;">
              Az email-ben hivatkozási linkek használatakor add meg a jelszavadat, ami csak akkor szükséges.
            </p>
          </div>

          <div class="footer">
            <p>© 2024 Kiadás Figyelő. Minden jog fenntartva.</p>
            <p style="margin-top: 10px; font-size: 11px;">
              Ez az e-mail automatikus. Kérjük, ne válaszolj erre az e-mailre.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function insuranceEmailTemplate(
  userName: string,
  insuranceName: string,
  policyNumber: string,
  provider?: string,
  coverageType?: string,
  monthlyPremium?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .header p {
            font-size: 16px;
            opacity: 0.95;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
          }
          .message {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.8;
          }
          .info-box {
            background: white;
            padding: 20px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
            border-radius: 4px;
            border: 1px solid #f0f0f0;
          }
          .info-item {
            margin: 15px 0;
            display: flex;
            align-items: baseline;
          }
          .info-label {
            font-weight: 600;
            color: #667eea;
            min-width: 150px;
          }
          .info-value {
            color: #333;
            flex: 1;
          }
          .document-note {
            background-color: #e3f2fd;
            border: 1px solid #bbdefb;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 13px;
            color: #1976d2;
          }
          .document-note strong {
            display: block;
            margin-bottom: 8px;
            color: #0d47a1;
          }
          .features {
            background-color: #f0f3ff;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .features h3 {
            color: #667eea;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          .feature-item {
            color: #555;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
            font-size: 13px;
          }
          .feature-item:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
          }
          .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
          }
          .footer p {
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Kiadás Figyelő</h1>
            <p>📋 Biztosítás Dokumentumok</p>
          </div>
          <div class="content">
            <p class="greeting">Szia ${userName}!</p>
            <p class="message">
              A biztosítási szerződésed sikeresen rögzítésre került. Alább megtalálod a dokumentumok részleteit, valamint mellékletben a részletes biztosítási dokumentum is megtalálható.
            </p>

            <div class="info-box">
              <div class="info-item">
                <span class="info-label">Biztosítás típusa:</span>
                <span class="info-value">${insuranceName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Szerződésszám:</span>
                <span class="info-value">${policyNumber}</span>
              </div>
              ${provider ? `<div class="info-item">
                <span class="info-label">Biztosító:</span>
                <span class="info-value">${provider}</span>
              </div>` : ''}
              ${coverageType ? `<div class="info-item">
                <span class="info-label">Fedezet típusa:</span>
                <span class="info-value">${coverageType}</span>
              </div>` : ''}
              ${monthlyPremium ? `<div class="info-item">
                <span class="info-label">Havi díj:</span>
                <span class="info-value">${monthlyPremium}</span>
              </div>` : ''}
            </div>

            <div class="document-note">
              <strong>📎 Mellékelt dokumentum</strong>
              A részletes biztosítási dokumentum PDF formátumban csatolva van az email-hez. Ez tartalmazza az összes szükséges információt és feltételeket.
            </div>

            <div class="features">
              <h3>Mit tehetsz az alkalmazásban?</h3>
              <div class="feature-item">Összes biztosítási szerződésedet egy helyen kezelheted</div>
              <div class="feature-item">Időpont emlékeztetőket állíthatsz be a díjfizetésekhez</div>
              <div class="feature-item">Dokumentumok biztonságos tárolása és szervezése</div>
              <div class="feature-item">Könnyű hozzáférés a dokumentumokhoz bármikor, bárhonnan</div>
            </div>

            <p class="message">
              Ha kérdésed van a szerződésről vagy módosítást szeretnél végezni, fordulj hozzánk bátran. Az alkalmazásban megtalálod az összes szükséges kontakt információt.
            </p>

            <p style="margin-top: 30px; font-size: 12px; color: #999;">
              Ez az e-mail automatikus. Kérjük, ne válaszolj erre az e-mailre.
            </p>
          </div>

          <div class="footer">
            <p>© 2024 Kiadás Figyelő. Minden jog fenntartva.</p>
            <p style="margin-top: 10px; font-size: 11px;">
              A biztosítási dokumentumok biztonságosan tárolódnak az alkalmazásban.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
