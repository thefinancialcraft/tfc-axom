'use client';
import { useRef, useEffect } from 'react';

interface ScrollPickerProps {
  items: string[];
  value: string;
  onChange: (val: string) => void;
  width?: string;
}

export default function ScrollPicker({ items, value, onChange, width = '80px' }: ScrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 44; // px
  
  useEffect(() => {
    // Scroll to the initially selected item immediately
    if (containerRef.current) {
      const initialIndex = items.indexOf(value);
      if (initialIndex !== -1) {
        containerRef.current.scrollTop = initialIndex * itemHeight;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollY = containerRef.current.scrollTop;
    const index = Math.round(scrollY / itemHeight);
    
    if (items[index] && items[index] !== value) {
      onChange(items[index]);
    }
  };

  return (
    <div style={{ position: 'relative', width, height: `${itemHeight * 3}px`, overflow: 'hidden' }}>
      {/* Center highlight box */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: `${itemHeight}px`,
        transform: 'translateY(-50%)',
        borderTop: '1px solid rgba(52, 187, 136, 0.3)',
        borderBottom: '1px solid rgba(52, 187, 136, 0.3)',
        backgroundColor: 'rgba(52, 187, 136, 0.05)',
        pointerEvents: 'none',
        borderRadius: '8px',
        zIndex: 1
      }} />
      
      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: '100%',
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          position: 'relative',
          zIndex: 2,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)',
          maskImage: 'linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)'
        }}
        className="hide-scrollbar"
      >
        {/* Padding items to allow scrolling first and last items to center */}
        <div style={{ height: `${itemHeight}px` }} />
        
        {items.map((item) => (
          <div 
            key={item}
            style={{
              height: `${itemHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'center',
              fontSize: item === value ? '22px' : '13px',
              fontWeight: item === value ? '600' : '400',
              color: item === value ? 'var(--color-green, #34BB88)' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => {
              const idx = items.indexOf(item);
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  top: idx * itemHeight,
                  behavior: 'smooth'
                });
              }
            }}
          >
            {item}
          </div>
        ))}
        
        <div style={{ height: `${itemHeight}px` }} />
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
