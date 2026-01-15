'use client';

import React, { useState } from 'react';
import styles from './WelcomePrompt.module.css';

interface WelcomePromptProps {
  userName: string;
  onClose: () => void;
}

export default function WelcomePrompt({ userName, onClose }: WelcomePromptProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className={styles['modal-overlay']} onClick={handleClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <button className={styles['close-button']} onClick={handleClose}>
          ✕
        </button>

        <div className={styles['content-wrapper']}>
          <div className={styles['emoji']}>👋</div>

          <h2 className={styles['title']}>
            Üdvözöllek, {userName}!
          </h2>

          <p className={styles['description']}>
            A Kiadás Figyelő segít nyomon követni kiadásaidat és kezelni biztosítási dokumentumaidat egyszerűen és hatékonyan.
          </p>

          <div className={styles['info-box']}>
            <p className={styles['info-box-text']}>
              📬 Ellenőrizd az emaileket a postalád ikonra kattintva! Ott találod az összes fontos üzeneteket és frissítéseket.
            </p>
          </div>

          <button
            onClick={handleClose}
            className={styles['cta-button']}
          >
            Kezdjünk! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
