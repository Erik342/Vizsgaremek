'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isLoggedIn || !user) {
    return <div className={styles['loading']}>Betöltés...</div>;
  }

  return (
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
        <section className={styles['welcome-section']}>
          <h2 className={styles['section-title']}>Fiók Adatok</h2>
          <div className={styles['user-info-card']}>
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
        </section>

        <section className={styles['quick-links-section']}>
          <h2 className={styles['section-title']}>Gyors Linkek</h2>
          <div className={styles['links-grid']}>
            <a href="/" className={styles['link-card']}>
              <div className={styles['link-icon']}>🏠</div>
              <h3 className={styles['link-title']}>Kezdőlap</h3>
              <p className={styles['link-description']}>Vissza a főoldalra</p>
            </a>

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
  );
}
