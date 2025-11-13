'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import UserIcon from '@/components/UserIcon';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userName, setUserName] = useState('USER');

  useEffect(() => {
    if (user?.nev) {
      setUserName(user.nev);
    } else {
      setUserName('USER');
    }
  }, [user]);

  return (
    <div className={styles.container}>
      {}
      <section className={styles['hero-section']}>
        <video
          className={styles['video-background']}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className={styles['video-overlay']}></div>

        <div className={styles['hero-content']}>
          <h1 className={styles['hero-title']}>Üdvözöllek, {userName}</h1>
          <p className={styles['hero-subtitle']}>Kövesd nyomon kiadásaidat egyszerűen és hatékonyan</p>
        </div>

        <div className={styles['scroll-indicator']}>
          <div className={styles['scroll-arrow']}></div>
        </div>
      </section>

      {}
      <section className={styles['about-section']}>
        <div className={styles['about-container']}>
          <h2 className={styles['section-title']}>Rólunk</h2>
          <p className={styles['section-description']}>
            A Kiadás Figyelő egy modern, felhasználó-barát alkalmazás, amely segít neked
            kontrollt szerezni a pénzügyi helyzetedről. Egyszerű kezelőfelülettel és
            hatékony eszközökkel támogatunk minden lépésedet a spórolás útján.
          </p>
          <p className={styles['section-description']}>
            Legyen szó egy tanár, aki költségvetést kell készítenie, vagy egy vállalkozó,
            aki nyomon akarja követni bevételeit és kiadásait, a Kiadás Figyelő az ideális
            megoldás számodra.
          </p>
        </div>
      </section>

      {}
      <section className={styles['features-section']}>
        <div className={styles['features-container']}>
          <h2 className={styles['section-title']}>Miért válaszd a Kiadás Figyelőt?</h2>

          <div className={styles['features-grid']}>
            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>📊</div>
              <h3 className={styles['feature-title']}>Valós idejű Nyomkövetés</h3>
              <p className={styles['feature-text']}>
                Kövesd nyomon minden tranzakciót valós időben és lásd pontosan, hogy hova
                megy a pénzed.
              </p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>📈</div>
              <h3 className={styles['feature-title']}>Részletes Elemzések</h3>
              <p className={styles['feature-text']}>
                Használd az okos grafikonokat és jelentéseket a költségvetési trendek
                megértéséhez.
              </p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>🎯</div>
              <h3 className={styles['feature-title']}>Költségvetés Tervezés</h3>
              <p className={styles['feature-text']}>
                Állítsd be költségvetési célokat és kapj értesítéseket, ha túllépsz azokat.
              </p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>💳</div>
              <h3 className={styles['feature-title']}>Több Számla Kezelés</h3>
              <p className={styles['feature-text']}>
                Kezeld több banki számládat és kreditkártyádat egy helyen.
              </p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>🔐</div>
              <h3 className={styles['feature-title']}>Biztonságos & Privát</h3>
              <p className={styles['feature-text']}>
                Az adataid védve vannak a legmodernebb titkosít��si technológiák használatával.
              </p>
            </div>

            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>📱</div>
              <h3 className={styles['feature-title']}>Ahol Vagy, Otthonosnak Lenni</h3>
              <p className={styles['feature-text']}>
                Hozzáférj a pénzügyeidhez bármikor, bárhonnan, bármilyen eszközről.
              </p>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className={styles['cta-section']}>
        <div className={styles['cta-container']}>
          <h2 className={styles['cta-title']}>Készen állsz a kezdésre?</h2>
          <p className={styles['section-description']}>
            Csatlakozz százak közé, akik már kontrollt szereztek pénzügyi helyzetükről.
          </p>
          <button className={styles['cta-button']} onClick={() => setShowRegisterModal(true)}>
            Regisztrálj most
          </button>
        </div>
      </section>

      <UserIcon onLoginClick={() => setShowLoginModal(true)} />

      {}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
          onRegisterClick={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => setShowRegisterModal(false)}
          onLoginClick={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
}
