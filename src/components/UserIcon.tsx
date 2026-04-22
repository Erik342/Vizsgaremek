'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import InboxDropdown from './InboxDropdown';
import styles from './UserIcon.module.css';

interface UserIconProps {
  onLoginClick?: () => void;
}

export default function UserIcon({ onLoginClick }: UserIconProps) {
  const { isLoggedIn, user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowMenu(false);
  };

  const handleUserClick = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuClick = (href: string) => {
    window.location.href = href;
    setShowMenu(false);
  };

  if (!isMounted) {
    return (
      <div className={styles['user-actions']}>
        <button
          className={styles['user-button']}
          title="Bejelentkezés"
          aria-label="Bejelentkezés"
        >
          👤
        </button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={styles['user-actions']}>
        <button
          className={styles['user-button']}
          onClick={onLoginClick}
          title="Bejelentkezés"
          aria-label="Bejelentkezés"
        >
          👤
        </button>
      </div>
    );
  }

  return (
    <div className={styles['user-actions']}>
      <div className={styles['inbox-wrapper']}>
        <InboxDropdown />
      </div>
      <button
        className={styles['user-button']}
        onClick={handleUserClick}
        title="Profil menü"
        aria-label="Felhasználó profil"
        aria-expanded={showMenu}
      >
        👤
      </button>

      {showMenu && (
        <div className={styles['menu-overlay']} onClick={() => setShowMenu(false)} />
      )}

      {showMenu && (
        <div className={styles['menu-container']}>
          <div className={styles['menu-header']}>
            <div className={styles['user-avatar']}>
              {user?.nev?.charAt(0)?.toUpperCase()}
            </div>
            <div className={styles['user-info']}>
              <div className={styles['user-name']}>{user?.nev}</div>
              <div className={styles['user-email']}>{user?.email}</div>
              {user?.szerep === 'admin' && (
                <div className={styles['admin-badge']}>Adminisztrátor</div>
              )}
            </div>
          </div>

          <div className={styles['menu-divider']} />

          <div className={styles['menu-items']}>
            <button
              onClick={() => handleMenuClick('/profile')}
              className={styles['menu-item']}
            >
              <span className={styles['menu-icon']}></span>
              <span className={styles['menu-text']}>Profil</span>
            </button>

            {user?.szerep === 'admin' && (
              <button
                onClick={() => handleMenuClick('/admin')}
                className={styles['menu-item']}
              >
                <span className={styles['menu-icon']}></span>
                <span className={styles['menu-text']}>Admin Panel</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className={`${styles['menu-item']} ${styles['menu-item-logout']}`}
            >
              <span className={styles['menu-icon']}></span>
              <span className={styles['menu-text']}>Kijelentkezés</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
