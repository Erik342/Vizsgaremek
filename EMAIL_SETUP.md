# Email System Setup Guide

## Database Schema Changes

A email verifikációs rendszer működéséhez az alábbi oszlopokat kell hozzáadni a `felhasznalok` táblához:

### SQL Command (MySQL)

```sql
ALTER TABLE felhasznalok ADD COLUMN (
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255) UNIQUE NULL,
  verification_token_expires DATETIME NULL
);
```

### Létezik az oszlop ellenőrzése:

```sql
DESCRIBE felhasznalok;
```

## Environment Configuration

A `.env.local` fájlban már be van állítva a:
- `RESEND_API_KEY` - A Resend API key a regisztrációs és biztosítási emailekhez

Ha szükséges a Base URL módosítása (pl. production-ben), add hozzá:
```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## API Endpoints

### 1. Registration with Verification Email
**POST** `/api/auth/register`
- Automatikusan verifikációs emailt küld
- Response tartalmazza az `emailSent` státuszt

### 2. Send Verification Email (Resend)
**POST** `/api/auth/send-verification`
```json
{
  "email": "user@example.com"
}
```

### 3. Verify Email Token
**GET** `/api/auth/verify-email?token=TOKEN`
- Verifikálja az email tokent
- Frissíti a `email_verified` státuszt

### 4. Send Insurance Document Email
**POST** `/api/insurance/send-document`
```json
{
  "insuranceId": 1
}
```
- Requires: `Authorization: Bearer {token}`
- Biztosítási dokumentumot küld az emailre

## Frontend Usage

### Regisztráció + Verification Email
```typescript
import { useAuth } from '@/context/AuthContext';

const { register } = useAuth();
const result = await register('Név', 'email@example.com', 'jelszó');

// Email automatikusan elküldésre kerül
```

### Verification Email újraküldése
```typescript
import { sendVerificationEmail } from '@/lib/emailClient';

const result = await sendVerificationEmail('user@example.com');
```

### Biztosítási dokumentum emailküldés
```typescript
import { sendInsuranceDocument } from '@/lib/emailClient';
import { useAuth } from '@/context/AuthContext';

const { token } = useAuth();
await sendInsuranceDocument(insuranceId, token);
```

## Email Templates

### 1. Registration Email
- Verifikációs link
- 24 órás token expiration
- Resend standard template

### 2. Insurance Document Email
- Biztosítás típusa és szerződésszáma
- Dokumentumrészletekre való utalás
- Támogatás kontakt

## Testing

### Local Testing
1. Resend teszt emailt küld az `onboarding@resend.dev` adresz helyett
2. Üzenetek a server consolban naplózódnak

### Production
- `RESEND_API_KEY` szükséges az environment-ben
- Email-ek valódi emailcímekre érkeznek meg

## Troubleshooting

### Email nem érkezik meg
- Ellenőrizd a `RESEND_API_KEY` értékét
- Resend Dashboard → Emails → Nézd meg az error logokat

### Token lejárt
- Token 24 órára érvényes
- `/api/auth/send-verification` endpoint-tal újra lehet küldeni

### Database error
- Ellenőrizd az oszlopok hozzáadásának helyességét
- Nézd meg a server konzolon a hibákat
