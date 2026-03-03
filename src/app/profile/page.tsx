'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './profile.module.css';

export default function Profile() {
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
    <div className={styles['profile-container']}>
      <header className={styles['profile-header']}>
        <div className={styles['header-content']}>
          <h1 className={styles['profile-title']}>Profil - {user.nev}</h1>
          <button onClick={handleLogout} className={styles['logout-button']}>
            Kijelentkezés
          </button>
        </div>
      </header>

      <main className={styles['profile-main']}>
        <section className={styles['user-info-section']}>
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
          <h2 className={styles['section-title']}>Pénzügyi Eszközök</h2>
          <div className={styles['links-grid']}>
            <a href="/cards" className={styles['link-card']}>
              <div className={styles['link-icon']}>💳</div>
              <h3 className={styles['link-title']}>Bankkártyák</h3>
              <p className={styles['link-description']}>Kezeld a kártyáidat</p>
            </a>

            <a href="/wallet" className={styles['link-card']}>
              <div className={styles['link-icon']}>💰</div>
              <h3 className={styles['link-title']}>Pénztárca</h3>
              <p className={styles['link-description']}>Pénzügyi áttekintés</p>
            </a>

            <a href="/insurances" className={styles['link-card']}>
              <div className={styles['link-icon']}>🛡️</div>
              <h3 className={styles['link-title']}>Biztosítások</h3>
              <p className={styles['link-description']}>Biztosítási kezelés</p>
            </a>

            <a href="/dashboard" className={styles['link-card']}>
              <div className={styles['link-icon']}>📊</div>
              <h3 className={styles['link-title']}>Irányítópult</h3>
              <p className={styles['link-description']}>Vissza az irányítópultra</p>
            </a>
          </div>
        </section>

        {user.szerep === 'admin' && (
          <section className={styles['admin-section']}>
            <h2 className={styles['section-title']}>Adminisztráció</h2>
            <div className={styles['links-grid']}>
              <a href="/admin" className={styles['link-card']}>
                <div className={styles['link-icon']}>⚙️</div>
                <h3 className={styles['link-title']}>Admin Panel</h3>
                <p className={styles['link-description']}>Adminisztrációs beállítások</p>
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
