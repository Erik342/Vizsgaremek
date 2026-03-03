'use client';

import React, { useState, useRef } from 'react';
import styles from './OnboardingFlow.module.css';

interface OnboardingFlowProps {
  onComplete: (data: {
    profilePicture: string | null;
    currency: string;
    location: string;
  }) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function OnboardingFlow({ onComplete, isLoading = false, error = null }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [currency, setCurrency] = useState('HUF');
  const [location, setLocation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 3;

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({ profilePicture, currency, location });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete({ profilePicture, currency, location });
  };

  return (
    <div className={styles['onboarding-overlay']}>
      <div className={styles['onboarding-container']}>
        <div className={styles['onboarding-header']}>
          <h1 className={styles['onboarding-title']}>Üdvözöllek a Valoraban!</h1>
          <p className={styles['onboarding-subtitle']}>
            Lépj végig a fiók beállítási lépéseken
          </p>
          <div className={styles['progress-bar']}>
            <div
              className={styles['progress-fill']}
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <p className={styles['step-counter']}>
            {currentStep} / {totalSteps}
          </p>
        </div>

        <div className={styles['onboarding-content']}>
          {currentStep === 1 && (
            <div className={styles['step-content']}>
              <h2 className={styles['step-title']}>Profilkép (Opcionális)</h2>
              <p className={styles['step-description']}>
                Adj hozzá egy profilképet, hogy személyesebbé tedd az élményt
              </p>
              <div className={styles['profile-picture-container']}>
                <div className={styles['profile-picture-preview']}>
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profilkép előnézet"
                      className={styles['profile-image']}
                    />
                  ) : (
                    <div className={styles['profile-placeholder']}>
                      📷
                    </div>
                  )}
                </div>
                <button
                  className={styles['upload-button']}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePicture ? 'Kép módosítása' : 'Kép feltöltése'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className={styles['step-content']}>
              <h2 className={styles['step-title']}>Pénznem kiválasztása</h2>
              <p className={styles['step-description']}>
                Válassz egy alapértelmezett pénznemet az alkalmazásban
              </p>
              <div className={styles['currency-grid']}>
                {['USD', 'EUR', 'HUF'].map((curr) => (
                  <button
                    key={curr}
                    className={`${styles['currency-option']} ${
                      currency === curr ? styles['selected'] : ''
                    }`}
                    onClick={() => setCurrency(curr)}
                  >
                    <div className={styles['currency-symbol']}>
                      {curr === 'USD' && '$'}
                      {curr === 'EUR' && '€'}
                      {curr === 'HUF' && 'Ft'}
                    </div>
                    <div className={styles['currency-name']}>{curr}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={styles['step-content']}>
              <h2 className={styles['step-title']}>Hol laksz?</h2>
              <p className={styles['step-description']}>
                Írd be az országodat vagy település nevét
              </p>
              <input
                type="text"
                placeholder="pl. Magyarország, Budapest"
                className={styles['location-input']}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className={styles['onboarding-footer']}>
          {error && (
            <div className={styles['error-message']}>
              ⚠️ {error}
            </div>
          )}
          <div className={styles['button-group']}>
            <button
              className={styles['secondary-button']}
              onClick={handlePrev}
              disabled={isLoading}
              style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
            >
              ← Vissza
            </button>
            <button
              className={styles['secondary-button']}
              onClick={handleSkip}
              disabled={isLoading}
            >
              Kihagyás
            </button>
            <button
              className={styles['primary-button']}
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? 'Mentés...' : (currentStep === totalSteps ? 'Befejezés' : 'Tovább →')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
