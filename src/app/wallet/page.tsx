'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/currency';
import styles from './wallet.module.css';

interface Expense {
  id: number;
  nev: string;
  tipus: string;
  osszeg: number | string;
  leiras?: string | null;
  letrehozasi_ido: string;
}

export default function Wallet() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nev: '',
    tipus: '',
    osszeg: '',
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/');
      return;
    }

    if (!isLoading && isLoggedIn) {
      fetchExpenses();
    }
  }, [isLoggedIn, isLoading, router]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses', {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setExpenses(data.expenses || []);
      } else {
        setError(data.error || 'Hiba a kiadások betöltésekor');
      }
    } catch (err) {
      setError('Hiba a kiadások betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nev || !formData.tipus || !formData.osszeg) {
      setError('Kérjük töltsd ki az összes mezőt');
      return;
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nev: formData.nev,
          tipus: formData.tipus,
          osszeg: parseFloat(formData.osszeg),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ nev: '', tipus: '', osszeg: '' });
        setError('');
        fetchExpenses();
      } else {
        setError(data.error || 'Hiba a kiadás hozzáadásakor');
      }
    } catch (err) {
      setError('Hiba a kiadás hozzáadásakor');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
      } else {
        const data = await response.json();
        setError(data.error || 'Hiba a kiadás törléssekor');
      }
    } catch (err) {
      setError('Hiba a kiadás törléssekor');
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.osszeg as any), 0);

  if (isLoading || !isLoggedIn || !user) {
    return <div className={styles['loading']}>Betöltés...</div>;
  }

  return (
    <div className={styles['wallet-container']}>
      <header className={styles['wallet-header']}>
        <div className={styles['header-content']}>
          <div className={styles['header-left']}>
            <h1 className={styles['wallet-title']}>Tárca - Kiadások Kezelése</h1>
            <p className={styles['wallet-subtitle']}>Kövesd nyomon a te kiadásaidat</p>
          </div>
          <a href="/profile" className={styles['back-link']}>
            ← Vissza a Profilra
          </a>
        </div>
      </header>

      <main className={styles['wallet-main']}>
        <div className={styles['wallet-layout']}>
          <section className={styles['form-section']}>
            <h2 className={styles['section-title']}>Új Kiadás Hozzáadása</h2>
            
            {error && <div className={styles['error-message']}>{error}</div>}
            
            <form onSubmit={handleAddExpense} className={styles['expense-form']}>
              <div className={styles['form-group']}>
                <label htmlFor="nev" className={styles['form-label']}>Kiadás Neve</label>
                <input
                  id="nev"
                  type="text"
                  name="nev"
                  value={formData.nev}
                  onChange={handleInputChange}
                  placeholder="pl. Élelmiszer"
                  className={styles['form-input']}
                />
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="tipus" className={styles['form-label']}>Típus</label>
                <select
                  id="tipus"
                  name="tipus"
                  value={formData.tipus}
                  onChange={handleInputChange}
                  className={styles['form-select']}
                >
                  <option value="">Válassz kategóriát</option>
                  <option value="Élelmiszer">Élelmiszer</option>
                  <option value="Közlekedés">Közlekedés</option>
                  <option value="Szórakozás">Szórakozás</option>
                  <option value="Bérlés">Bérlés</option>
                  <option value="Bizosítás">Biztosítás</option>
                  <option value="Egyéb">Egyéb</option>
                </select>
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="osszeg" className={styles['form-label']}>Összeg ({user.currency || 'HUF'})</label>
                <input
                  id="osszeg"
                  type="number"
                  name="osszeg"
                  value={formData.osszeg}
                  onChange={handleInputChange}
                  placeholder="0"
                  step="0.01"
                  className={styles['form-input']}
                />
              </div>

              <button type="submit" className={styles['submit-button']}>
                Hozzáadás
              </button>
            </form>
          </section>

          <section className={styles['stats-section']}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>Összes Kiadás</div>
              <div className={styles['stat-value']}>{formatCurrency(totalExpenses, user.currency || 'HUF')}</div>
            </div>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>Kiadások Száma</div>
              <div className={styles['stat-value']}>{expenses.length}</div>
            </div>
          </section>
        </div>

        <section className={styles['expenses-section']}>
          <h2 className={styles['section-title']}>Kiadások Listája</h2>
          
          {loading ? (
            <div className={styles['loading-text']}>Betöltés...</div>
          ) : expenses.length === 0 ? (
            <div className={styles['empty-state']}>Nincsenek kiadásaid</div>
          ) : (
            <div className={styles['expenses-container']}>
              {expenses.map((expense) => (
                <div key={expense.id} className={styles['expense-item']}>
                  <div className={styles['expense-info']}>
                    <div className={styles['expense-name']}>{expense.nev}</div>
                    <div className={styles['expense-type']}>{expense.tipus}</div>
                    <div className={styles['expense-date']}>
                      {new Date(expense.letrehozasi_ido).toLocaleDateString('hu-HU')}
                    </div>
                  </div>
                  <div className={styles['expense-amount']}>{formatCurrency(parseFloat(expense.osszeg as any), user.currency || 'HUF')}</div>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className={styles['delete-button']}
                  >
                    Törlés
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
