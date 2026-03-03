'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import OnboardingFlow from '@/components/OnboardingFlow';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoggedIn, logout, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    // Check if user has completed onboarding
    if (user && !user.has_completed_onboarding) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleOnboardingComplete = async (data: {
    profilePicture: string | null;
    currency: string;
    location: string;
  }) => {
    setSavingOnboarding(true);
    setOnboardingError(null);
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        setOnboardingError('Hitelesítési token hiányzik. Kérjük, jelentkezzen be újra.');
        setSavingOnboarding(false);
        return;
      }

      const response = await fetch('/api/users/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowOnboarding(false);
        setOnboardingError(null);
        // Update user context
        if (user) {
          user.has_completed_onboarding = true;
          user.currency = data.currency;
          user.location = data.location;
        }
      } else {
        // grab raw text first so we can log whatever came back
        const text = await response.text();
        let errorMessage = 'Ismeretlen hiba történt';
        let errorData: any = null;
        try {
          errorData = JSON.parse(text);
          errorMessage = errorData?.error || errorMessage;
        } catch {
          // not JSON, leave text as-is
          if (text) errorMessage = text;
        }

        setOnboardingError(errorMessage);
        console.error(
          `Failed to save onboarding data (status ${response.status})`,
          {
            status: response.status,
            error: errorMessage,
            raw: text,
            parsed: errorData,
          }
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ismeretlen hiba';
      setOnboardingError(`Hiba az onboarding mentésekor: ${errorMessage}`);
      console.error('Error saving onboarding data:', {
        message: errorMessage,
        error,
      });
    } finally {
      setSavingOnboarding(false);
    }
  };

  if (isLoading || !isLoggedIn || !user) {
    return <div className={styles['loading']}>Betöltés...</div>;
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          isLoading={savingOnboarding}
          error={onboardingError}
        />
      )}
      <div className={styles['dashboard-container']}>
      <header className={styles['dashboard-header']}>
        <div className={styles['header-content']}>
          <h1 className={styles['dashboard-title']}>Üdvözöllek, {user.nev}!</h1>
          <button onClick={handleLogout} className={styles['logout-button']}>
            Kijelentkezés
          </button>
        </div>
      </header>

      <main className={styles['dashboard-main']}>
        <section className={styles['guide-section']}>
          <h2 className={styles['section-title']}>Használati utasítás</h2>
          <div className={styles['guide-card']}>
            <div className={styles['guide-content']}>
              <h3 className={styles['guide-subtitle']}>Kezdj a Valora-val</h3>
              <ul className={styles['guide-list']}>
                <li>
                  <strong>1. Fiók beállítása:</strong> Frissítsd a profilodnak, hogy az alkalmazás jobban ismerhessen.
                </li>
                <li>
                  <strong>2. Bankkártyák hozzáadása:</strong> Add hozzá a kártyáidat a kiadások nyomon követéséhez.
                </li>
                <li>
                  <strong>3. Kiadások regisztrálása:</strong> Rögzítsd az összes tranzakciót a pénztárcában.
                </li>
                <li>
                  <strong>4. Biztosítások kezelése:</strong> Kösd meg biztosításaid és kezeld őket.
                </li>
                <li>
                  <strong>5. Elemzések megtekintése:</strong> Nézd meg a költségvetési trendeket és statisztikákat.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles['tools-section']}>
          <h2 className={styles['section-title']}>Eszközök & Beállítások</h2>
          <div className={styles['links-grid']}>
            {user.szerep === 'admin' && (
              <a href="/admin" className={styles['link-card']}>
                <div className={styles['link-icon']}>⚙️</div>
                <h3 className={styles['link-title']}>Admin Panel</h3>
                <p className={styles['link-description']}>Adminisztrációs beállítások</p>
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
    </>
  );
}
