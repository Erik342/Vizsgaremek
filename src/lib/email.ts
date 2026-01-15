import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Warning: RESEND_API_KEY environment variable is not set. Email sending will fail.');
    // Return a client instance even if API key is missing to avoid crashes
    // The API calls will fail at runtime with a proper error message
    return new Resend('');
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

export interface WelcomeEmailData {
  email: string;
  userName: string;
}

export async function sendWelcomeEmail({
  email,
  userName,
}: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Üdvözöllek a Kiadás Figyelőben! 👋',
      html: welcomeEmailTemplate(userName),
    });

    if (response.error) {
      console.error('Welcome email error:', response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error: 'Hiba az email küldésekor' };
  }
}

function welcomeEmailTemplate(userName: string): string {
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
            font-size: 20px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
          }
          .intro {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.8;
            font-size: 15px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f3ff;
          }
          .feature-box {
            background-color: #f9fafb;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 12px;
            border-radius: 4px;
            display: flex;
            gap: 12px;
          }
          .feature-icon {
            font-size: 20px;
            min-width: 30px;
            text-align: center;
          }
          .feature-content {
            flex: 1;
          }
          .feature-content strong {
            display: block;
            color: #333;
            margin-bottom: 4px;
            font-size: 14px;
          }
          .feature-content p {
            color: #666;
            font-size: 13px;
            margin: 0;
          }
          .guide-link {
            background-color: #f0f3ff;
            border: 1px solid #e0e7ff;
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 4px;
            color: #667eea;
            text-decoration: none;
            display: inline-block;
            font-size: 13px;
            font-weight: 500;
            transition: background-color 0.2s;
          }
          .guide-link:hover {
            background-color: #e0e7ff;
          }
          .security-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 13px;
            color: #166534;
          }
          .security-box strong {
            display: block;
            margin-bottom: 8px;
            color: #15803d;
          }
          .legal-box {
            background-color: #fef3c7;
            border: 1px solid #fcd34d;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 12px;
            color: #92400e;
            line-height: 1.6;
          }
          .legal-box strong {
            display: block;
            margin-bottom: 10px;
            color: #78350f;
            font-size: 13px;
          }
          .divider {
            border-top: 1px solid #eee;
            margin: 30px 0;
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
          .footer-links {
            margin-top: 15px;
          }
          .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
            font-size: 11px;
          }
          .footer-links a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Kiadás Figyelő</h1>
            <p>Üdvözöllek! 👋</p>
          </div>
          <div class="content">
            <p class="greeting">Szia ${userName}!</p>
            <p class="intro">
              Köszönünk, hogy csatlakoztál a Kiadás Figyelőhöz! Egy modern, felhasználóbarát alkalmazáshoz érkeztél, amely segít nyomon követni kiadásaidat, megtervezni költségvetésed, és biztonságosan kezelni biztosítási dokumentumaidat.
            </p>

            <div class="section">
              <h2 class="section-title">🚀 Mit tudsz tenni az alkalmazásban?</h2>

              <div class="feature-box">
                <div class="feature-icon">📊</div>
                <div class="feature-content">
                  <strong>Valós idejű nyomkövetés</strong>
                  <p>Köverd nyomon kiadásaidat kategóriák szerint, tetszőleges időszakban. Azonnal lásd a te pénzügyi helyzetét.</p>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">📈</div>
                <div class="feature-content">
                  <strong>Részletes elemzések</strong>
                  <p>Vizuális diagramok és részletes statisztikák segítségével jobban megértheted kiadásaidat.</p>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">💰</div>
                <div class="feature-content">
                  <strong>Költségvetés tervezés</strong>
                  <p>Állíts be havi költségvetést és figyeld meg, hogy mennyire tartod magad az előirányzathoz.</p>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">💳</div>
                <div class="feature-content">
                  <strong>Több számla kezelése</strong>
                  <p>Ha több számlád van, könnyen kezelheted őket egy helyről, és követheted az összes kiadást.</p>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">🛡️</div>
                <div class="feature-content">
                  <strong>Biztosítás kezelés</strong>
                  <p>Biztonságosan tárolj és szervezz összes biztosítási dokumentumot. Soha ne veszítsd el fontos szerződéseket.</p>
                </div>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">📍 Útmutató az alkalmazásban</h2>

              <div style="margin-bottom: 20px;">
                <p style="color: #666; margin-bottom: 12px; font-size: 14px;">Az alkalmazás logikusan szerkezet van. Alább a fontosabb menüpontok:</p>
              </div>

              <div class="feature-box">
                <div class="feature-icon">🏠</div>
                <div class="feature-content">
                  <strong>Irányítópult (Dashboard)</strong>
                  <p>Az alkalmazás kezdőoldala. Itt látod az összes fontos információt egyből: kiadások áttekintése, költségvetés helyzet, legutóbbi tranzakciók.</p>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">💵</div>
                <div class="feature-content">
                  <strong>Kiadások (Cards)</strong>
                  <p>Itt rögzítheted az új kiadásokat, szerkesztheted és törölheted a meglévőeket. Jól szervezett listában látod az összes tranzakciódat.</p>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">📋</div>
                <div class="feature-content">
                  <strong>Biztosítások (Insurances)</strong>
                  <p>Kezeld összes biztosítási szerződésedet itt. Rögzítsd a szerződés részleteit, tárold a dokumentumokat, és állíts be emlékeztetőket.</p>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">👤</div>
                <div class="feature-content">
                  <strong>Profil (Profile)</strong>
                  <p>Állítsd be a jelszavadat, módosítsd a személyes adataidat, és kezeld az alkalmazás beállításait.</p>
                </div>
              </div>

              <div class="feature-box">
                <div class="feature-icon">💳</div>
                <div class="feature-content">
                  <strong>Pénztárca (Wallet)</strong>
                  <p>Összefoglalás a számláidról és egyenlegükről. Egyszerűen kezelj több számlát egy helyen.</p>
                </div>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">🔒 Biztonsági információk</h2>

              <div class="security-box">
                <strong>Adatod biztonságban van</strong>
                Az alkalmazás a legmodernebb titkosítási és biztonsági szabványokat követi. Az összes adatod titkosítva tárolódik, és csak te hozzáférhetsz hozzájuk. Soha nem osztjuk meg harmadik fél felekkel az adataidat.
              </div>

              <div class="security-box">
                <strong>Titkosság és adatvédelem</strong>
                Az alkalmazás teljes mértékben megfelel az adatvédelmi törvényi előírásoknak. Személyes adataidat csak az alkalmazás működtetéséhez használjuk. További információkért olvasd el az Adatvédelmi Nyilatkozatunkat.
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">⚖️ Jogi információk</h2>

              <div class="legal-box">
                <strong>Felhasználási feltételek</strong>
                Az alkalmazás használatával elfogadod a Felhasználási Feltételeinket. Fontos, hogy elolvasd ezeket, hogy megértsed a jogaidat és kötelezettségeidet.
              </div>

              <div class="legal-box">
                <strong>Biztosítási adatok</strong>
                A biztosítási dokumentumok és szerződések megtekintésére és tárolására az alkalmazást használod. A biztosítási szerződés feltételeit, kizárásait és a fedezet részleteit a biztosítónak szóló szerződésből alapulnak. Az alkalmazás nem nyújt jogi vagy pénzügyi tanácsot.
              </div>

              <div class="legal-box">
                <strong>Felelősségvállalás</strong>
                Az alkalmazás a jelenlegi formájában kerül biztosításra. Bár igyekszünk biztosítani az adatok pontosságát és rendelkezésre állását, az alkalmazás használatából eredő bármilyen közvetlen vagy közvetett kárért nem vagyunk felelősek.
              </div>

              <div class="legal-box">
                <strong>Szellemi tulajdon</strong>
                Az alkalmazás és annak tartalma szerzői jog alatt védett. Az alkalmazás nem rész vagy egészében nem reprodukálható, módosítható vagy terjeszthető szerzői jog nélkül.
              </div>
            </div>

            <div class="divider"></div>

            <p style="font-size: 13px; color: #666; margin-bottom: 20px;">
              Ha kérdéseid vannak vagy segítségre van szükséged, ne habozz kapcsolatba lépni velünk. Boldogan segítünk!
            </p>

            <p style="font-size: 12px; color: #999;">
              Ez az e-mail automatikus. Kérjük, ne válaszolj erre az e-mailre.
            </p>
          </div>

          <div class="footer">
            <p>© 2024 Kiadás Figyelő. Minden jog fenntartva.</p>
            <div class="footer-links">
              <a href="#">Adatvédelmi nyilatkozat</a>
              <a href="#">Felhasználási feltételek</a>
              <a href="#">Támogatás</a>
            </div>
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
