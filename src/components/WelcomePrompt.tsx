'use client';

import React, { useState } from 'react';
import styles from './Modal.module.css';

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

        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>👋</div>

          <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#333', marginBottom: '12px' }}>
            Üdvözöllek, {userName}!
          </h2>

          <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '32px' }}>
            A Kiadás Figyelő segít nyomon követni kiadásaidat és kezelni biztosítási dokumentumaidat egyszerűen és hatékonyan.
          </p>

          <div style={{
            backgroundColor: '#f0f3ff',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #e0e7ff',
          }}>
            <p style={{ fontSize: '14px', color: '#667eea', margin: 0, lineHeight: '1.5' }}>
              📬 Ellenőrizd az emaileket a postalád ikonra kattintva! Ott találod az összes fontos üzeneteket és frissítéseket.
            </p>
          </div>

          <button
            onClick={handleClose}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#764ba2')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#667eea')}
          >
            Kezdjünk! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
