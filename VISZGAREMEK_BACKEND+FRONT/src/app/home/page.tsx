'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './home.module.css';

export default function Home() {
  const router = useRouter();
  const { user, isLoggedIn, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading || !isLoggedIn || !user) {
    return <div className={styles['loading']}>Betöltés...</div>;
  }

  return (
    <div className={styles['home-container']}>
      <header className={styles['home-header']}>
        <div className={styles['header-content']}>
          <h1 className={styles['home-title']}>Üdvözöllek, {user.nev}!</h1>
          <button onClick={handleLogout} className={styles['logout-button']}>
            Kijelentkezés
          </button>
        </div>
      </header>

      <main className={styles['home-main']}>
        {/* Profile Card */}
        <section className={styles['profile-section']}>
          <h2 className={styles['section-title']}>Fiók Adatok</h2>
          <div className={styles['profile-card']}>
            <div className={styles['avatar']}>
              {user.nev?.charAt(0)?.toUpperCase()}
            </div>
            <div className={styles['profile-info']}>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Név:</span>
                <span className={styles['info-value']}>{user.nev}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Email:</span>
                <span className={styles['info-value']}>{user.email}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Szerepkör:</span>
                <span className={styles['info-value']}>
                  {user.szerep === 'admin' ? 'Adminisztrátor' : 'Felhasználó'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className={styles['stats-section']}>
          <h2 className={styles['section-title']}>Pénzügyi Áttekintés</h2>
          <div className={styles['stats-grid']}>
            <div className={styles['stat-card']}>
              <h3 className={styles['stat-label']}>Összes Egyenleg</h3>
              <p className={styles['stat-value']}>0 Ft</p>
            </div>

            <div className={styles['stat-card']}>
              <h3 className={styles['stat-label']}>Ezen a hónapon</h3>
              <p className={styles['stat-value']}>0 Ft</p>
            </div>

            <div className={styles['stat-card']}>
              <h3 className={styles['stat-label']}>Bankkártyák</h3>
              <p className={styles['stat-value']}>0</p>
            </div>

            <div className={styles['stat-card']}>
              <h3 className={styles['stat-label']}>Biztosítások</h3>
              <p className={styles['stat-value']}>0</p>
            </div>
          </div>
        </section>

        {/* Quick Access */}
        <section className={styles['quick-access-section']}>
          <h2 className={styles['section-title']}>Gyors Hozzáférés</h2>
          <div className={styles['access-grid']}>
            <a href="/wallet" className={styles['access-card']}>
              <div className={styles['access-icon']}>💼</div>
              <h3 className={styles['access-title']}>Pénztárca</h3>
              <p className={styles['access-desc']}>Kiadások kezelése</p>
            </a>

            <a href="/cards" className={styles['access-card']}>
              <div className={styles['access-icon']}>💳</div>
              <h3 className={styles['access-title']}>Bankkártyák</h3>
              <p className={styles['access-desc']}>Kártyáid kezelése</p>
            </a>

            <a href="/insurances" className={styles['access-card']}>
              <div className={styles['access-icon']}>🛡️</div>
              <h3 className={styles['access-title']}>Biztosítások</h3>
              <p className={styles['access-desc']}>Biztosítási szerződések</p>
            </a>

            <a href="/dashboard" className={styles['access-card']}>
              <div className={styles['access-icon']}>⚙️</div>
              <h3 className={styles['access-title']}>Beállítások</h3>
              <p className={styles['access-desc']}>Adminisztrációs eszközök</p>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
