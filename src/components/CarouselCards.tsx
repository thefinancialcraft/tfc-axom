import React from 'react';

export interface CardData {
  title: string;
  image: string;
  time?: string;
  status?: string;
  message?: string;
  flipImage?: boolean;
  marginLeft?: string;
}

interface Props {
  cards?: CardData[];
}

export default function CarouselCards({ cards = [] }: Props) {
  if (cards.length === 0) return null;

  return (
    <div>
      <div 
        className="hide-scrollbar"
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollPaddingLeft: '24px', // Aligns the snap to the padding
          scrollPaddingRight: '24px',
          gap: '16px',
          padding: '32px 24px', // Added vertical padding to allow image overflow
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE/Edge
      }}>
        {cards.map((card, idx) => (
          <div key={idx} style={{
            flex: '0 0 80%',
            height: '150px',
            backgroundColor: '#363636',
            borderRadius: '24px',
            scrollSnapAlign: 'start',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            position: 'relative',
            clipPath: 'inset(-200px -200px 0 0)',
          }}>
            {/* Image */}
            <div style={{ flexShrink: 0, marginLeft: card.marginLeft || '-50px', zIndex: 2, position: 'relative' }}>
              <img src={card.image} alt={card.title} style={{ width: 'auto', height: '200px', objectFit: 'contain', transform: card.flipImage ? 'scaleX(-1)' : 'none', filter: 'grayscale(100%)' }} />
            </div>

            {/* Top Right Text */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 3
            }}>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500', background: 'transparent' }}>
                {card.title}
              </span>
            </div>

            {/* Bottom Blur Box */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '65px',
              background: 'linear-gradient(to right, transparent 0%, transparent 20%, rgba(255, 255, 255, 0.1) 70%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 20%, black 70%)',
              maskImage: 'linear-gradient(to right, transparent 0%, transparent 20%, black 70%)',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              zIndex: 1, // Sits behind the image
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '0 20px',
              borderBottomLeftRadius: '24px',
              borderBottomRightRadius: '24px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', zIndex: 3 }}>
                {card.message ? (
                  <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{card.message}</span>
                ) : (
                  <>
                    <span style={{ color: '#fff', fontSize: '26px', fontWeight: '500' }}>{card.time}</span>
                    <span style={{ color: '#4ADE80', fontSize: '10px', fontWeight: '400', letterSpacing: '0.5px' }}>{card.status}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
