'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useInbox } from '@/context/InboxContext';
import styles from './InboxDropdown.module.css';

export default function InboxDropdown() {
  const { messages, unreadCount, markAsRead, deleteMessage, markAllAsRead } = useInbox();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIconByType = (type: string) => {
    switch (type) {
      case 'welcome':
        return '👋';
      case 'feature':
        return '✨';
      case 'notification':
        return '🔔';
      case 'update':
        return '📢';
      default:
        return '📩';
    }
  };

  return (
    <div ref={dropdownRef} className={styles['inbox-container']}>
      <button
        className={styles['inbox-button']}
        onClick={() => setIsOpen(!isOpen)}
        title="Posta"
        aria-label="Posta"
      >
        📬
        {unreadCount > 0 && (
          <span className={styles['unread-badge']}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles['inbox-dropdown']}>
          <div className={styles['inbox-header']}>
            <h3>📬 Postalád</h3>
            {messages.length > 0 && (
              <button
                className={styles['mark-all-read']}
                onClick={() => {
                  markAllAsRead();
                }}
              >
                Mindent olvasottnak jelöl
              </button>
            )}
          </div>

          <div className={styles['inbox-messages']}>
            {messages.length === 0 ? (
              <div className={styles['empty-inbox']}>
                <p>📭</p>
                <p>Nincs üzeneted</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={`msg_${message.id}`}
                  className={`${styles['message-item']} ${!message.read ? styles['unread'] : ''}`}
                  onClick={() => !message.read && markAsRead(message.id)}
                >
                  <div className={styles['message-icon']}>
                    {message.icon || getIconByType(message.type)}
                  </div>
                  <div className={styles['message-content']}>
                    <p className={styles['message-title']}>{message.title}</p>
                    <p className={styles['message-text']}>{message.message}</p>
                    <span className={styles['message-time']}>
                      {new Date(message.timestamp).toLocaleString('hu-HU', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <button
                    className={styles['delete-button']}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(message.id);
                    }}
                    title="Törlés"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {messages.length > 0 && (
            <div className={styles['inbox-footer']}>
              <p style={{ fontSize: '12px', color: '#999' }}>
                {messages.length} üzenet összesen
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
