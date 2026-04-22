'use client';

import { useAuth } from '@/context/AuthContext';
import styles from '@/app/page.module.css';

export default function HeroGreeting() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <h1 className={styles['hero-title']}>Üdvözöllek</h1>;
  }

  return (
    <h1 className={styles['hero-title']}>
      {user?.nev ? `Üdvözöllek, ${user.nev}` : 'Üdvözöllek'}
    </h1>
  );
}
