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

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX - currentX;
      thumb.setPointerCapture(e.pointerId); // ✅ yahi sabse important hai
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const maxDrag = container.getBoundingClientRect().width - thumb.getBoundingClientRect().width - 8;
      let newX = e.clientX - startX;
      if (newX < 0) newX = 0;
      if (newX > maxDrag) newX = maxDrag;
      currentX = newX;
      thumb.style.transition = 'none';
      thumb.style.transform = `translateX(${newX}px)`;

      if (newX >= maxDrag * 0.95) {
        isDragging = false;
        setUnlocked(true);
      }
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      currentX = 0;
      thumb.style.transition = 'transform 0.3s ease';
      thumb.style.transform = 'translateX(0px)';
    };

    thumb.addEventListener('pointerdown', onPointerDown);
    thumb.addEventListener('pointermove', onPointerMove);
    thumb.addEventListener('pointerup', onPointerUp);
    thumb.addEventListener('pointercancel', onPointerUp);

    return () => {
      thumb.removeEventListener('pointerdown', onPointerDown);
      thumb.removeEventListener('pointermove', onPointerMove);
      thumb.removeEventListener('pointerup', onPointerUp);
      thumb.removeEventListener('pointercancel', onPointerUp);
    };
  }, [unlocked]);

  return (
    <div style={{ padding: '0 24px', marginTop: '24px' }}>
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '60px',
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
        <span style={{ 
          color: unlocked ? '#fff' : 'rgba(255, 255, 255, 0.5)', 
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
            width: '52px',
            borderRadius: '26px',
            backgroundColor: 'var(--color-white)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: unlocked ? 'default' : 'grab',
            touchAction: 'none', // As requested
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
