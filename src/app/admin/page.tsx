'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './admin.module.css';

interface UserRow {
  id: number;
  nev: string;
  email: string;
  letrehozasi_ido: string;
  szerep: 'user' | 'admin';
}

interface BroadcastFormData {
  type: 'welcome' | 'feature' | 'notification' | 'update';
  title: string;
  message: string;
  icon: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const { user, isLoggedIn, logout, isLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [broadcastForm, setBroadcastForm] = useState<BroadcastFormData>({
    type: 'notification',
    title: '',
    message: '',
    icon: '',
  });
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastError, setBroadcastError] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isLoggedIn) {
      router.push('/');
      return;
    }

    if (user?.szerep !== 'admin') {
      router.push('/profile');
      return;
    }

    fetchUsers();
  }, [isLoading, isLoggedIn, user, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Hiba a felhasználók betöltésekor');
      }
    } catch (err) {
      setError('Hiba a felhasználók betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: 'user' | 'admin') => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, szerep: newRole }),
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, szerep: newRole } : u));
      } else {
        const data = await response.json();
        setError(data.error || 'Hiba az átállítás során');
      }
    } catch (err) {
      setError('Hiba az átállítás során');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleBroadcastChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBroadcastForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      setBroadcastError('Kérjük, töltsd ki az összes mezőt!');
      return;
    }

    try {
      setBroadcastLoading(true);
      setBroadcastError('');
      setBroadcastSuccess('');

      const response = await fetch('/api/inbox/broadcast', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastForm),
      });

      const data = await response.json();

      if (response.ok) {
        setBroadcastSuccess(`Üzenet sikeresen elküldve ${data.count} felhasználónak!`);
        setBroadcastForm({
          type: 'notification',
          title: '',
          message: '',
          icon: '',
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setBroadcastSuccess('');
        }, 3000);
      } else {
        setBroadcastError(data.error || 'Hiba az üzenet küldésekor');
      }
    } catch (err) {
      setBroadcastError('Hiba az üzenet küldésekor');
    } finally {
      setBroadcastLoading(false);
    }
  };

  if (isLoading || !isLoggedIn || !user || user.szerep !== 'admin') {
    return <div className={styles['loading']}>Betöltés...</div>;
  }

  return (
    <div className={styles['admin-container']}>
      <header className={styles['admin-header']}>
        <div className={styles['header-content']}>
          <h1 className={styles['admin-title']}>Admin Panel</h1>
          <button onClick={handleLogout} className={styles['logout-button']}>
            Kijelentkezés
          </button>
        </div>
      </header>

      <main className={styles['admin-main']}>
        <section className={styles['users-section']}>
          <div className={styles['section-header']}>
            <h2 className={styles['section-title']}>Felhasználók Kezelése</h2>
            <button onClick={fetchUsers} className={styles['refresh-button']}>
              Frissítés
            </button>
          </div>

          {error && <div className={styles['error-message']}>{error}</div>}

          {loading ? (
            <div className={styles['loading-text']}>Betöltés...</div>
          ) : users.length === 0 ? (
            <div className={styles['empty-state']}>Nincs regisztrált felhasználó</div>
          ) : (
            <div className={styles['table-wrapper']}>
              <table className={styles['users-table']}>
                <thead>
                  <tr>
                    <th className={styles['col-id']}>ID</th>
                    <th className={styles['col-name']}>Név</th>
                    <th className={styles['col-email']}>Email</th>
                    <th className={styles['col-role']}>Szerep</th>
                    <th className={styles['col-date']}>Regisztráció</th>
                    <th className={styles['col-actions']}>Akciók</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className={styles['col-id']}>{u.id}</td>
                      <td className={styles['col-name']}>{u.nev}</td>
                      <td className={styles['col-email']}>{u.email}</td>
                      <td className={styles['col-role']}>
                        <span className={`${styles['role-badge']} ${styles[`role-${u.szerep}`]}`}>
                          {u.szerep === 'admin' ? 'Admin' : 'Felhasználó'}
                        </span>
                      </td>
                      <td className={styles['col-date']}>
                        {new Date(u.letrehozasi_ido).toLocaleDateString('hu-HU')}
                      </td>
                      <td className={styles['col-actions']}>
                        {u.szerep === 'admin' ? (
                          <span className={styles['admin-badge']}>Nem módosítható</span>
                        ) : (
                          <button
                            className={styles['promote-button']}
                            onClick={() => handleRoleChange(u.id, 'admin')}
                          >
                            Adminná Tétel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={styles['stats-section']}>
          <h2 className={styles['section-title']}>Statisztika</h2>
          <div className={styles['stats-grid']}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-icon']}>👥</div>
              <div className={styles['stat-content']}>
                <div className={styles['stat-label']}>Összes Felhasználó</div>
                <div className={styles['stat-value']}>{users.length}</div>
              </div>
            </div>

            <div className={styles['stat-card']}>
              <div className={styles['stat-icon']}></div>
              <div className={styles['stat-content']}>
                <div className={styles['stat-label']}>Admin Felhasználók</div>
                <div className={styles['stat-value']}>{users.filter(u => u.szerep === 'admin').length}</div>
              </div>
            </div>

            <div className={styles['stat-card']}>
              <div className={styles['stat-icon']}></div>
              <div className={styles['stat-content']}>
                <div className={styles['stat-label']}>Normál Felhasználók</div>
                <div className={styles['stat-value']}>{users.filter(u => u.szerep === 'user').length}</div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['broadcast-section']}>
          <h2 className={styles['section-title']}>Üzenet Küldése Összes Felhasználónak</h2>

          {broadcastError && (
            <div className={styles['error-message']}>{broadcastError}</div>
          )}

          {broadcastSuccess && (
            <div className={styles['success-message']}>{broadcastSuccess}</div>
          )}

          <form onSubmit={handleBroadcastSubmit} className={styles['broadcast-form']}>
            <div className={styles['form-group']}>
              <label htmlFor="type" className={styles['form-label']}>
                Üzenet típusa
              </label>
              <select
                id="type"
                name="type"
                value={broadcastForm.type}
                onChange={handleBroadcastChange}
                className={styles['form-select']}
              >
                <option value="notification">Értesítés</option>
                <option value="update">Frissítés</option>
                <option value="feature">Új funkció</option>
                <option value="welcome">Üdvözlés</option>
              </select>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="icon" className={styles['form-label']}>
                Ikon (opcionális, emoji vagy szöveg)
              </label>
              <input
                id="icon"
                name="icon"
                type="text"
                value={broadcastForm.icon}
                onChange={handleBroadcastChange}
                placeholder="pl. Új frissítés!"
                maxLength={3}
                className={styles['form-input']}
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="title" className={styles['form-label']}>
                Cím *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={broadcastForm.title}
                onChange={handleBroadcastChange}
                placeholder="Üzenet címe"
                className={styles['form-input']}
                required
              />
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="message" className={styles['form-label']}>
                Üzenet szövege *
              </label>
              <textarea
                id="message"
                name="message"
                value={broadcastForm.message}
                onChange={handleBroadcastChange}
                placeholder="Írj az üzeneteidet itt..."
                rows={5}
                className={styles['form-textarea']}
                required
              />
            </div>

            <button
              type="submit"
              disabled={broadcastLoading}
              className={styles['submit-button']}
            >
              {broadcastLoading ? 'Küldés...' : 'Üzenet Kiküldése'}
            </button>
          </form>

          <div className={styles['broadcast-info']}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
              <strong>Tipp:</strong> Az itt létrehozott üzenet az összes felhasználó postalájában megjelenik.
            </p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              Az üzenet típusa alapján különböző ikonokkal jelenik meg a felhasználók felé.
            </p>
          </div>
        </section>

        <section className={styles['navigation-section']}>
          <a href="/profile" className={styles['nav-link']}>
            ← Vissza a Profilra
          </a>
        </section>
      </main>
    </div>
  );
}
