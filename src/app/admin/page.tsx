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

export default function AdminPanel() {
  const router = useRouter();
  const { user, isLoggedIn, logout, isLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const response = await fetch('/api/users');
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

        <section className={styles['navigation-section']}>
          <a href="/profile" className={styles['nav-link']}>
            ← Vissza a Profilra
          </a>
        </section>
      </main>
    </div>
  );
}
