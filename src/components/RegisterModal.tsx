'use client';

import React, { useState } from 'react';
import styles from './Modal.module.css';
import { useAuth } from '@/context/AuthContext';
import { sendWelcomeEmail } from '@/lib/email';
import WelcomePrompt from './WelcomePrompt';

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onLoginClick: () => void;
}

export default function RegisterModal({
  onClose,
  onSuccess,
  onLoginClick,
}: RegisterModalProps) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomePrompt, setShowWelcomePrompt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      setError('Kérjük töltsd ki az összes mezőt');
      return;
    }

    if (password !== confirmPassword) {
      setError('A jelszavak nem egyeznek');
      return;
    }

    if (password.length < 6) {
      setError('A jelszó legalább 6 karakter hosszú legyen');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await register(username, email, password);

    if (result.success) {
      // Send welcome email (don't block registration if it fails)
      try {
        await sendWelcomeEmail({
          email,
          userName: username,
        });
      } catch (emailError) {
        // Log error but don't prevent registration
        console.error('Welcome email sending failed:', emailError);
      }

      // Show welcome prompt instead of immediate success
      setShowWelcomePrompt(true);
    } else {
      setError(result.error || 'Hiba a regisztrációnál');
    }

    setIsLoading(false);
  };

  const handleWelcomePromptClose = () => {
    setShowWelcomePrompt(false);
    onSuccess();
  };

  if (showWelcomePrompt) {
    return <WelcomePrompt userName={username} onClose={handleWelcomePromptClose} />;
  }

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <button className={styles['close-button']} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles['modal-title']}>Regisztráció</h2>

        <form onSubmit={handleSubmit} className={styles['form']}>
          <div className={styles['form-group']}>
            <label htmlFor="username" className={styles['label']}>
              Felhasználónév
            </label>
            <input
              id="username"
              type="text"
              className={styles['input']}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="felhasználóneved"
            />
          </div>

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

          <div className={styles['form-group']}>
            <label htmlFor="confirmPassword" className={styles['label']}>
              Jelszó Megerősítése
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={styles['input']}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <div className={styles['error-message']}>{error}</div>}

          <button type="submit" className={styles['submit-button']} disabled={isLoading}>
            {isLoading ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>

        <div className={styles['divider']}>vagy</div>

        <button className={styles['register-link']} onClick={onLoginClick}>
          Van már fiókod? <span className={styles['highlight']}>Jelentkezz be</span>
        </button>
      </div>
    </div>
  );
}
