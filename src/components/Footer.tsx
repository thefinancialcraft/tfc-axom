import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <div style={{ marginTop: '140px', paddingBottom: '30px', textAlign: 'center', paddingLeft: '24px', paddingRight: '24px' }}>
      <div style={{ color: '#888', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>
        One Platform
      </div>
      <div style={{ color: '#fff', fontSize: '22px', fontWeight: '600', marginBottom: '30px', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Infinite Possibilities
      </div>
      
      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', width: '60%', margin: '0 auto 30px' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#A3A3A3', fontSize: '14px', fontWeight: '500' }}>
        Made with
        <Heart size={16} color="#EF4444" fill="#EF4444" style={{ animation: 'pulse-heart 1.5s infinite' }} />
        by TFC Axom
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-heart {
          0% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1); }
          75% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}} />
    </div>
  );
}
