import React from 'react';

const getLast6Days = () => {
  const days = [];
  const colors = ['#FD6579', '#FFE76B', '#34BB88', '#4484FF', '#FD6579', '#FFE76B']; // Provided hex codes
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 0; i <= 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.getDate().toString(),
      month: months[d.getMonth()],
      color: colors[i]
    });
  }
  return days;
};

export default function HeroCard() {
  return (
    <div style={{
      height: '200px',
      margin: '20px 24px',
      backgroundColor: '#363636',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
   // Remove left padding so the image div can touch the left end
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        width: '150px',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow:'hidden',
      }}>
        <img 
          src="/gg.png" 
          alt="gg" 
          style={{ 
            height: '280px', 
            width: 'auto', 
            objectFit: 'contain', 
            filter: 'grayscale(100%)', 
            transform: 'translateY(20px)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 85%)',
            maskImage: 'linear-gradient(to bottom, black 20%, transparent 85%)'
          }} 
        />
      </div>

      {/* Right Side Info: User ID & Role */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        height: '100%',
        paddingTop: '24px',
        zIndex: 5,
        paddingRight:'24px'
      }}>
        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
          User ID - <span style={{ color: 'var(--color-white)', fontWeight: '500' }}>TFC-011</span>
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>
          Role - <span style={{ color: 'var(--color-white)', fontWeight: '500' }}>Agent</span>
        </div>
        <div style={{ 
          fontSize: '28px', 
          color: 'var(--color-white)', 
          fontWeight: '700', 
          marginTop: '16px',
          letterSpacing: '1px'
        }}>
          12:12:12
        </div>
      </div>

      {/* Blurred Overlay Div */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '65px',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        {getLast6Days().map((item, index) => (
          <div key={index} suppressHydrationWarning style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1', color: '#ffffff' }}>{item.date}</span>
            <span style={{ fontSize: '10px', fontWeight: '400', lineHeight: '1', marginTop: '4px', color: 'rgba(255, 255, 255, 0.6)' }}>{item.month}</span>
            {/* Colored Indicator Dot */}
            <span style={{
              marginTop: '6px',
              width: '10px',
              height: '3px',
              borderRadius: '10px',
              backgroundColor: item.color
            }}></span>
          </div>
        ))}
      </div>
    </div>
  );
}
