'use client';
import React, { useState } from 'react';

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
  const [currentSlide, setCurrentSlide] = useState(0);

  // 6 months dummy data
  const performanceData = [
    { month: 'Jan', percent: 65 },
    { month: 'Feb', percent: 75 },
    { month: 'Mar', percent: 80 },
    { month: 'Apr', percent: 70 },
    { month: 'May', percent: 90 },
    { month: 'Jun', percent: 95 }
  ];

  // Map to points array
  const pointsArr = performanceData.map((d, i) => ({
    x: 15 + (i * 54),
    y: 90 - ((d.percent / 100) * 70)
  }));

  // Generate smooth cubic bezier path
  let smoothPath = `M ${pointsArr[0].x},${pointsArr[0].y}`;
  for (let i = 0; i < pointsArr.length - 1; i++) {
    const p0 = pointsArr[i];
    const p1 = pointsArr[i + 1];
    const cpx = (p0.x + p1.x) / 2;
    smoothPath += ` C ${cpx},${p0.y} ${cpx},${p1.y} ${p1.x},${p1.y}`;
  }

  // Generate area path for the gradient fill
  const areaPath = `${smoothPath} L ${pointsArr[pointsArr.length - 1].x},120 L ${pointsArr[0].x},120 Z`;

  return (
    <div style={{ margin: '20px 24px' }}>
      <div 
        className="herocard-slider"
        onScroll={(e) => {
          const scrollLeft = e.currentTarget.scrollLeft;
          const width = e.currentTarget.clientWidth;
          const newIndex = Math.round(scrollLeft / width);
          if (newIndex !== currentSlide) setCurrentSlide(newIndex);
        }}
        style={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          gap: '16px',
          paddingBottom: '8px'
        }}
      >
        <style>
          {`
            .herocard-slider::-webkit-scrollbar { display: none; }
            .herocard-slider { -ms-overflow-style: none; scrollbar-width: none; }
          `}
        </style>

        {/* Slide 1: Original Hero Card */}
        <div style={{
          flex: '0 0 100%',
          scrollSnapAlign: 'start',
          height: '220px',
          backgroundColor: '#363636',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
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
              fontSize: '32px', 
              color: 'var(--color-white)', 
              fontWeight: '700', 
              marginTop: '26px',
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
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderRadius: '24px 24px 0 0'
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

        {/* Slide 2: Line Graph */}
        <div style={{
          flex: '0 0 100%',
          scrollSnapAlign: 'start',
          height: '220px',
          backgroundColor: '#363636',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', margin: 0 }}>Attendance Performance</h3>
            <span style={{ color: '#4ADE80', fontSize: '12px', fontWeight: '600', padding: '4px 10px', backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: '12px' }}>+12%</span>
          </div>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4484FF" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4484FF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Gradient Area Under Curve */}
              <path 
                d={areaPath} 
                fill="url(#graphGradient)" 
              />

              {/* Smooth Line Graph */}
              <path 
                d={smoothPath} 
                fill="none" 
                stroke="#4484FF" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>

          {/* X-Axis Labels (Months) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 5px' }}>
            {performanceData.map((d, i) => (
              <span key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '500' }}>
                {d.month}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Pagination Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
        {[0, 1].map(index => (
          <div 
            key={index}
            style={{
              width: currentSlide === index ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: currentSlide === index ? '#ffffffff' : 'rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
