'use client';

import React, { useState, useEffect } from 'react';
import styles from './FeatureShowcase.module.css';

const features = [
  {
    id: 1,
    title: 'Valós idejű Nyomkövetés',
    description: 'Kövesd nyomon minden tranzakciót valós időben és lásd pontosan, hogy hova megy a pénzed.',
    icon: '📊',
  },
  {
    id: 2,
    title: 'Részletes Elemzések',
    description: 'Használd az okos grafikonokat és jelentéseket a költségvetési trendek megértéséhez.',
    icon: '📈',
  },
  {
    id: 3,
    title: 'Költségvetés Tervezés',
    description: 'Állítsd be költségvetési célokat és kapj értesítéseket, ha túllépsz azokat.',
    icon: '🎯',
  },
  {
    id: 4,
    title: 'Több Számla Kezelés',
    description: 'Kezeld több banki számládat és kreditkártyádat egy helyen.',
    icon: '💳',
  },
  {
    id: 5,
    title: 'Biztonságos & Privát',
    description: 'Az adataid védve vannak a legmodernebb titkosítási technológiák használatával.',
    icon: '🔒',
  },
  {
    id: 6,
    title: 'Ahol Vagy, Otthonosnak Lenni',
    description: 'Hozzáférj a pénzügyeidhez bármikor, bárhonnan, bármilyen eszközről.',
    icon: '🌍',
  },
];

export default function FeatureShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showWave, setShowWave] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);

  useEffect(() => {
    // Start wave animation immediately
    setShowWave(true);
    
    // Start slideshow after wave completes
    const waveTimer = setTimeout(() => {
      setShowSlideshow(true);
    }, 1500);

    return () => clearTimeout(waveTimer);
  }, []);

  useEffect(() => {
    if (!showSlideshow) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000); // Change feature every 5 seconds

    return () => clearInterval(interval);
  }, [showSlideshow]);

  const currentFeature = features[currentIndex];

  return (
    <div className={styles['showcase-container']}>
      {/* Wave effect */}
      {showWave && <div className={styles['wave-circle']}></div>}

      {/* Slideshow content */}
      <div className={`${styles['slideshow-content']} ${showSlideshow ? styles['visible'] : ''}`}>
        <div className={styles['feature-display']}>
          <div className={styles['feature-icon-large']}>{currentFeature.icon}</div>
          <h2 className={styles['feature-title-large']}>{currentFeature.title}</h2>
          <p className={styles['feature-description-large']}>{currentFeature.description}</p>
        </div>

        {/* Indicator dots */}
        <div className={styles['indicator-dots']}>
          {features.map((_, index) => (
            <button
              key={index}
              className={`${styles['dot']} ${index === currentIndex ? styles['active'] : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Feature ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className={styles['navigation-buttons']}>
          <button
            className={styles['nav-button']}
            onClick={() => setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)}
          >
            ←
          </button>
          <a href="/dashboard" className={styles['dashboard-button']}>
            Irányítópult
          </a>
          <button
            className={styles['nav-button']}
            onClick={() => setCurrentIndex((prev) => (prev + 1) % features.length)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
