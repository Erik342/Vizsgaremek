'use client';

import React, { useState } from 'react';
import styles from './Modal.module.css';
import { useAuth } from '@/context/AuthContext';
import { sendWelcomeEmail } from '@/lib/email';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onRegisterClick: () => void;
}

export default function LoginModal({
  onClose,
  onSuccess,
  onRegisterClick,
}: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Kérjük töltsd ki az összes mezőt');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      // Extract username from email (part before @)
      const userName = email.split('@')[0];

      // Send welcome email (don't block login if it fails)
      try {
        await sendWelcomeEmail({
          email,
          userName,
        });
      } catch (emailError) {
        // Log error but don't prevent login
        console.error('Welcome email sending failed:', emailError);
      }

      onSuccess();
    } else {
      setError(result.error || 'Hiba a bejelentkezésnél');
    }

    setIsLoading(false);
  };

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <button className={styles['close-button']} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles['modal-title']}>Bejelentkezés</h2>

        <form onSubmit={handleSubmit} className={styles['form']}>
          <div className={styles['form-group']}>
            <label htmlFor="email" className={styles['label']}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={styles['input']}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="valami@email.com"
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password" className={styles['label']}>
              Jelszó
            </label>
            <input
              id="password"
              type="password"
              className={styles['input']}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <div className={styles['error-message']}>{error}</div>}

          <button type="submit" className={styles['submit-button']} disabled={isLoading}>
            {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <div className={styles['divider']}>vagy</div>

        <button className={styles['register-link']} onClick={onRegisterClick}>
          Még nincs fiókod? <span className={styles['highlight']}>Regisztrálj</span>
        </button>
      </div>
    </div>
  );
}
