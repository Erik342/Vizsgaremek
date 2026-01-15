'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './verify-email.module.css';

interface VerificationResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: number;
    nev: string;
    email: string;
  };
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (error) {
      setResult({
        success: false,
        error: error,
      });
      setIsLoading(false);
      return;
    }

    if (success) {
      setResult({
        success: true,
        message: 'Email sikeresen verifikálva',
        user: undefined,
      });
      setIsLoading(false);
      return;
    }

    if (!token) {
      setResult({
        success: false,
        error: 'Verifikációs token nem található',
      });
      setIsLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);

        const data = await response.json();

        if (response.ok) {
          setResult({
            success: true,
            message: data.message,
            user: data.user,
          });
        } else {
          setResult({
            success: false,
            error: data.error || 'Hiba a verifikáció során',
          });
        }
      } catch (error) {
        setResult({
          success: false,
          error: 'Hálózati hiba történt',
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className={styles['page-container']}>
      <div className={styles['content-wrapper']}>
        {isLoading ? (
          <div className={styles['loading-state']}>
            <div className={styles['spinner']}></div>
            <p className={styles['loading-text']}>Az email-t ellenőrizem...</p>
          </div>
        ) : result?.success ? (
          <div className={styles['success-state']}>
            <h1 className={styles['title']}>Email sikeresen ellenőrizve!</h1>
            <p className={styles['message']}>
              {result.user?.nev ? `Üdvözöllek, ${result.user.nev}!` : 'Üdvözöllek!'}
            </p>
            <p className={styles['description']}>
              Az email-cím ellenőrizve lett. Most már teljes hozzáférésed van a Kiadás Figyelőhöz.
            </p>

            {result.user?.email && (
              <div className={styles['info-box']}>
                <p className={styles['info-text']}>
                  📧 Email: <strong>{result.user.email}</strong>
                </p>
              </div>
            )}

            <button
              onClick={() => router.push('/dashboard')}
              className={styles['cta-button']}
            >
              Tovább az alkalmazásba →
            </button>

            <p className={styles['additional-text']}>
              Nem vagy bejelentkezve? <a href="/">Vissza a kezdőlapra</a>
            </p>
          </div>
        ) : (
          <div className={styles['error-state']}>
            <div className={styles['icon-error']}>❌</div>
            <h1 className={styles['title']}>Verifikáció sikertelen</h1>
            <p className={styles['message']}>{result?.error}</p>

            <div className={styles['error-suggestions']}>
              <p className={styles['suggestion-title']}>Mit tehetsz?</p>
              <ul className={styles['suggestion-list']}>
                <li>Ellenőrizd, hogy a token helyesen másolva lett</li>
                <li>A token 24 óra után lejár</li>
                <li>Próbálj újra regisztrálni, és új emailt fogsz kapni</li>
              </ul>
            </div>

            <button
              onClick={() => router.push('/')}
              className={styles['cta-button']}
            >
              Vissza a kezdőlapra
            </button>

            <p className={styles['additional-text']}>
              Segítségre van szükséged?{' '}
              <a href="/">Vedd fel velünk a kapcsolatot</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
