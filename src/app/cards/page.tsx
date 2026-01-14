'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './cards.module.css';

export default function Cards() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading || !isLoggedIn || !user) {
    return <div className={styles['loading']}>Betöltés...</div>;
  }

  const cards = [
    {
      id: 'premium',
      name: 'Premium',
      description: 'Prémium kártya extra előnyökkel',
      color: '#FFD700',
      accent: '#FFA500',
      icon: '⭐',
      features: ['Cashback 2%', 'Lounge hozzáférés', 'Utazási biztosítás'],
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Klasszikus kártya mindennapi használatra',
      color: '#1C1C1C',
      accent: '#00D4FF',
      icon: '💳',
      features: ['Alapvető biztosítás', 'Ügyfélszolgálat 24/7', 'Online kezelés'],
    },
    {
      id: 'student',
      name: 'Student',
      description: 'Hallgatók számára speciális kedvezmények',
      color: '#9933FF',
      accent: '#FF33FF',
      icon: '🎓',
      features: ['50% kedvezmény díjak', 'Hallgatói előnyök', 'Szociális programok'],
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Üzleti és vállalkozások számára',
      color: '#00AA44',
      accent: '#00FF88',
      icon: '💼',
      features: ['API integráció', 'Csoportos kezelés', 'Analitika dashboard'],
    },
  ];

  return (
    <div className={styles['cards-container']}>
      <header className={styles['cards-header']}>
        <div className={styles['header-content']}>
          <div className={styles['header-left']}>
            <h1 className={styles['cards-title']}>Kártyák Választása</h1>
            <p className={styles['cards-subtitle']}>Válassz a kártyák közül, amely a legjobban megfelel az igényeidnek</p>
          </div>
          <a href="/profile" className={styles['back-link']}>
            ← Vissza a Profilra
          </a>
        </div>
      </header>

      <main className={styles['cards-main']}>
        <section className={styles['cards-section']}>
          <div className={styles['cards-grid']}>
            {cards.map((card) => (
              <div
                key={card.id}
                className={`${styles['card-wrapper']} ${selectedCard === card.id ? styles['selected'] : ''}`}
                onClick={() => setSelectedCard(card.id)}
              >
                <div
                  className={styles['card-visual']}
                  style={{
                    background: `linear-gradient(135deg, ${card.color} 0%, ${card.accent} 100%)`,
                  }}
                >
                  <div className={styles['card-icon']}>{card.icon}</div>
                  <div className={styles['card-number']}>•••• •••• •••• 4242</div>
                  <div className={styles['card-holder']}>
                    <div className={styles['card-label']}>Kártyatulajdonos</div>
                    <div className={styles['card-name']}>{user.nev}</div>
                  </div>
                  <div className={styles['card-expiry']}>
                    <div className={styles['card-label']}>Lejárat</div>
                    <div className={styles['card-date']}>12/26</div>
                  </div>
                </div>

                <div className={styles['card-info']}>
                  <h3 className={styles['card-name-title']}>{card.name}</h3>
                  <p className={styles['card-description']}>{card.description}</p>

                  <div className={styles['card-features']}>
                    <h4 className={styles['features-title']}>Előnyök:</h4>
                    <ul className={styles['features-list']}>
                      {card.features.map((feature, index) => (
                        <li key={index} className={styles['feature-item']}>
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedCard === card.id && (
                    <div className={styles['selected-badge']}>
                      ✓ Kiválasztva
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles['custom-card-section']}>
          <h2 className={styles['section-title']}>Kártya Tervezése</h2>
          <div className={styles['custom-card-container']}>
            <div className={styles['custom-card-preview']}>
              <div
                className={styles['custom-card-visual']}
                style={{
                  background: selectedCard
                    ? `linear-gradient(135deg, ${
                        cards.find((c) => c.id === selectedCard)?.color
                      } 0%, ${cards.find((c) => c.id === selectedCard)?.accent} 100%)`
                    : 'linear-gradient(135deg, #333333 0%, #666666 100%)',
                }}
              >
                <div className={styles['custom-card-icon']}>
                  {cards.find((c) => c.id === selectedCard)?.icon || '💳'}
                </div>
                <div className={styles['custom-card-number']}>•••• •••• •••• 4242</div>
                <div className={styles['custom-card-holder']}>
                  <div className={styles['custom-card-label']}>Kártyatulajdonos</div>
                  <div className={styles['custom-card-name']}>{user.nev}</div>
                </div>
              </div>
            </div>

            <div className={styles['custom-card-info']}>
              <p className={styles['custom-description']}>
                Ez a funkció lehetőséget nyújt arra, hogy teljesen egyéni kártyát tervezz. Kiválaszthatod a színeket, az ikonokat, és még a fiók nevét is módosíthatod.
              </p>
              <div className={styles['custom-disclaimer']}>
                <strong>Jelenlegi állapot:</strong> Ez egy prototípus. Az automatikus költségfelvétel és a valódi kártya funkciók még nem érhetőek el. A valós banki integrációhoz szükséges a saját szerver és megfelelő banki API-k.
              </div>
            </div>
          </div>
        </section>

        <section className={styles['info-section']}>
          <h2 className={styles['section-title']}>Miért újak ezek a kártyák?</h2>
          <div className={styles['info-grid']}>
            <div className={styles['info-card']}>
              <h3 className={styles['info-title']}>Egyedi Tervezés</h3>
              <p className={styles['info-description']}>Teljes kontroll a kártya megjelenéséről és funkcionalitásáról</p>
            </div>

            <div className={styles['info-card']}>
              <h3 className={styles['info-title']}>Személyes Stílus</h3>
              <p className={styles['info-description']}>Válaszd ki a színeket és ikonokat, amelyek tükrözik a személyiségedet</p>
            </div>

            <div className={styles['info-card']}>
              <h3 className={styles['info-title']}>Azonnali Aktiválás</h3>
              <p className={styles['info-description']}>Válassz egy kártyát és azonnal kezdhetsz használni</p>
            </div>

            <div className={styles['info-card']}>
              <h3 className={styles['info-title']}>Biztonságos</h3>
              <p className={styles['info-description']}>Korszerű titkosítás és biztonsági protokollok</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
