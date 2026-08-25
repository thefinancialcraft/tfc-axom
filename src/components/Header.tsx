'use client';

import React from 'react';
import LogoutButton from '@/components/LogoutButton';
import AuthHashCleaner from '@/components/AuthHashCleaner';
import TwinklingStars from '@/components/TwinklingStars';

interface HeaderProps {
  category?: string;
  title?: string;
  description?: string;
  actionButton?: React.ReactNode;
}

export default function Header({ category, title, description, actionButton }: HeaderProps) {
  return (
    <>
      <AuthHashCleaner />
      <TwinklingStars density="low" />
      <div className="top-right-pattern" />
      <LogoutButton />
      {title && (
        <div style={{ 
          padding: '90px 24px 40px 24px', 
          width: '100%', 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            {category && (
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '300',
                  margin: '0 0 8px 0',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: 'var(--font-lufga), sans-serif'
                }}
              >
                {category}
              </p>
            )}
            <h1
              style={{
                fontSize: '32px',
                fontWeight: '600',
                margin: '0 0 6px 0',
                background: 'linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0.7))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                lineHeight: '1.1',
                fontFamily: 'var(--font-lufga), sans-serif'
              }}
            >
              {title}
            </h1>
            {description && (
              <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px', margin: 0, fontFamily: 'var(--font-lufga), sans-serif' }}>
                {description}
              </p>
            )}
          </div>
          {actionButton && (
            <div>
              {actionButton}
            </div>
          )}
        </div>
      )}
    </>
  );
}
