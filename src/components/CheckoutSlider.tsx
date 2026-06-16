'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function CheckoutSlider() {
  const [unlocked, setUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const thumb = thumbRef.current;
    const container = containerRef.current;
    if (!thumb || !container || unlocked) return;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    const getMax = () => container.getBoundingClientRect().width - thumb.getBoundingClientRect().width - 8;

    const moveTo = (clientX: number) => {
      const maxDrag = getMax();
      let newX = clientX - startX;
      if (newX < 0) newX = 0;
      if (newX > maxDrag) newX = maxDrag;
      
      currentX = newX;
      thumb.style.transition = 'none';
      thumb.style.transform = `translateX(${newX}px)`;

      if (newX >= maxDrag * 0.95) {
        isDragging = false;
        setUnlocked(true);
        currentX = maxDrag;
        thumb.style.transform = `translateX(${maxDrag}px)`;
      }
    };

    const snapBack = () => {
      isDragging = false;
      currentX = 0;
      thumb.style.transition = 'transform 0.3s ease';
      thumb.style.transform = 'translateX(0px)';
    };

    // Mobile Touch Events (Highly reliable)
    const handleTouchStart = (e: TouchEvent) => {
      isDragging = true;
      startX = e.touches[0].clientX - currentX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // Must not be passive
      moveTo(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (isDragging) snapBack();
    };

    // Desktop Mouse Events
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX - currentX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      moveTo(e.clientX);
    };

    const handleMouseUp = () => {
      if (isDragging) snapBack();
    };

    // Attach start events ONLY to the thumb
    thumb.addEventListener('touchstart', handleTouchStart, { passive: false });
    thumb.addEventListener('mousedown', handleMouseDown);

    // Attach move and end events to the DOCUMENT so they never drop if you drag fast outside the thumb
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
    
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      thumb.removeEventListener('touchstart', handleTouchStart);
      thumb.removeEventListener('mousedown', handleMouseDown);

      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [unlocked]);

  return (
    <div style={{ padding: '0 24px', marginTop: '24px' }}>
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '55px',
          backgroundColor: unlocked ? '#FD6579' : 'rgba(255, 255, 255, 0.05)',
          border: unlocked ? '1px solid #FD6579' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'background-color 0.3s ease, border 0.3s ease',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <span 
          className={!unlocked ? "shimmer-text" : ""}
          style={{ 
          color: unlocked ? '#fff' : undefined, 
          fontSize: '15px', 
          fontWeight: '500',
          letterSpacing: '1px',
          zIndex: 1,
          transition: 'opacity 0.3s',
          paddingLeft: unlocked ? '0' : '20px',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          {unlocked ? 'Checked Out' : 'Slide to Check Out'}
        </span>
        
        {/* Visual & Draggable Thumb */}
        <div
          ref={thumbRef}
          style={{
            position: 'absolute',
            left: '4px',
            top: '4px',
            bottom: '4px',
            width: '47px',
            borderRadius: '24px',
            backgroundColor: 'var(--color-white)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: unlocked ? 'default' : 'grab',
            touchAction: 'none',
            zIndex: 2,
            transform: 'translateX(0px)',
            transition: 'transform 0.3s ease'
          }}
        >
          {unlocked ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FD6579" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-black)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
              <polyline points="13 18 19 12 13 6" opacity="0.5"></polyline>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
