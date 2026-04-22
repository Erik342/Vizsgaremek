import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  decodeToken,
  generateVerificationToken,
  extractTokenFromRequest
} from '../../src/lib/auth';

describe('Authentication Tests', () => {
  
  describe('Password Hashing', () => {
    test('should hash a password correctly', async () => {
      const password = 'test_password_123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('should produce different hashes for the same password', async () => {
      const password = 'test_password_123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Password Verification', () => {
    test('should verify correct password', async () => {
      const password = 'correct_password_123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'correct_password_123';
      const wrongPassword = 'wrong_password_456';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    test('should handle empty password', async () => {
      const hash = await hashPassword('password');
      const isValid = await verifyPassword('', hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate a valid token', () => {
      const userId = 1;
      const email = 'test@example.com';
      const role = 'user';
      
      const token = generateToken(userId, email, role);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    test('should include userId, email and role in token payload', () => {
      const userId = 2;
      const email = 'admin@example.com';
      const role = 'admin';

      const token = generateToken(userId, email, role);
      const decoded = decodeToken(token);

      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
      expect(decoded?.role).toBe(role);
    });
  });

  describe('JWT Token Verification', () => {
    test('should verify valid token', () => {
      const userId = 1;
      const email = 'test@example.com';
      const role = 'user';
      
      const token = generateToken(userId, email, role);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
      expect(decoded?.role).toBe(role);
    });

    test('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);
      
      expect(decoded).toBeNull();
    });

    test('should return null for empty token', () => {
      const decoded = verifyToken('');
      
      expect(decoded).toBeNull();
    });
  });

  describe('Token Decoding', () => {
    test('should decode a valid token', () => {
      const userId = 1;
      const email = 'test@example.com';
      const role = 'admin';
      
      const token = generateToken(userId, email, role);
      const decoded = decodeToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
    });

    test('should return null for invalid token', () => {
      const decoded = decodeToken('invalid.token');
      
      expect(decoded).toBeNull();
    });
  });

  describe('Verification Token Generation', () => {
    test('should generate a verification token', () => {
      const token = generateVerificationToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    test('should generate different tokens each time', () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();
      
      expect(token1).not.toBe(token2);
    });

    test('should generate hex string token', () => {
      const token = generateVerificationToken();
      
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });
  });

  describe('Extract Token From Request', () => {
    test('should extract token from Bearer Authorization header', () => {
      const token = 'test_token_123';
      const request = {
        headers: {
          get: (key: string) => {
            if (key === 'authorization') return `Bearer ${token}`;
            return null;
          }
        },
        cookies: { get: () => undefined }
      };
      
      const extracted = extractTokenFromRequest(request);
      
      expect(extracted).toBe(token);
    });

    test('should return null if no token present', () => {
      const request = {
        headers: {
          get: () => null
        },
        cookies: { get: () => undefined }
      };
      
      const extracted = extractTokenFromRequest(request);
      
      expect(extracted).toBeNull();
    });
  });
});
