'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './dashboard.module.css';

export default function Dashboard() {
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
    <>
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
          <h2 className={styles['section-title']}>Eszközök és Funkciók</h2>
          <div className={styles['links-grid']}>
            {}
            <a href="/cards" className={styles['link-card']}>
              <div className={styles['link-icon']}>💳</div>
              <h3 className={styles['link-title']}>Bankkártyák</h3>
              <p className={styles['link-description']}>Készítsd el első bankkártyádat</p>
            </a>

            <a href="/wallet" className={styles['link-card']}>
              <div className={styles['link-icon']}>💰</div>
              <h3 className={styles['link-title']}>Pénztárca</h3>
              <p className={styles['link-description']}>Add hozzá első kiadásod</p>
            </a>

            <a href="/insurances" className={styles['link-card']}>
              <div className={styles['link-icon']}>🛡️</div>
              <h3 className={styles['link-title']}>Biztosítások</h3>
              <p className={styles['link-description']}>Kösd meg első biztosításodat</p>
            </a>

            {/* admin only */}
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
