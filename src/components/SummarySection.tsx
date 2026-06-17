'use client';
import React, { useState } from 'react';

export default function SummarySection() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isJustificationTick, setIsJustificationTick] = useState(true);
  const [isClAppliedTick, setIsClAppliedTick] = useState(true);

  const handlePrev = () => {
    const prevDate = new Date(currentDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    setCurrentDate(prevDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    setCurrentDate(nextDate);
  };

  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
                         currentDate.getFullYear() === today.getFullYear();

  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonth = `${monthsShort[currentDate.getMonth()]} ${currentDate.getFullYear().toString().slice(-2)}`;
  const displayString = formattedMonth;

  // Inner Ring Percentages
  const innerRadius = 42;
  const innerCircumference = 2 * Math.PI * innerRadius; // ~263.89
  
  const innerSegments = [
    { id: 1, percent: 45, color: '#FD6579' }, // Segment 1
    { id: 2, percent: 20, color: '#FFE76B' }, // Segment 2
    { id: 3, percent: 15, color: '#34BB88' }, // Segment 3
    { id: 4, percent: 20, color: '#4484FF' }, // Segment 4
  ];

  let currentAngle = 0;

  return (
    <div style={{ marginTop: '32px', padding: '0 24px', paddingBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: 0 }}>Summary</h2>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={handlePrev}
            style={{ 
            background: 'transparent', 
            border: '1px solid rgba(255, 255, 255, 0.4)', 
            color: 'var(--color-white)', 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <span suppressHydrationWarning style={{ color: '#fff', fontSize: '15px', fontWeight: '500', minWidth: '55px', textAlign: 'center', marginLeft: '12px' }}>
            {displayString}
          </span>
          
          <div style={{
            width: isCurrentMonth ? '0px' : '32px',
            marginLeft: isCurrentMonth ? '0px' : '12px',
            opacity: isCurrentMonth ? 0 : 1,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            display: 'flex',
          }}>
            <button 
              onClick={handleNext}
              style={{ 
              background: 'transparent', 
              border: '1px solid rgba(255, 255, 255, 0.4)', 
              color: 'var(--color-white)', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Slide Container Wrapper */}
      <div 
        className="summary-slider" 
        onScroll={(e) => {
          const scrollLeft = e.currentTarget.scrollLeft;
          const width = e.currentTarget.clientWidth;
          const newIndex = Math.round(scrollLeft / width);
          if (newIndex !== currentSlide) {
            setCurrentSlide(newIndex);
          }
        }}
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          scrollSnapType: 'x mandatory', 
          gap: '16px',
          marginTop: '20px',
          paddingBottom: '8px', // Space for invisible scrollbar 
        }}
      >
        <style>
          {`
            .summary-slider::-webkit-scrollbar {
              display: none;
            }
            .summary-slider {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>

        {/* Slide 1: Progress Circle */}
        <div style={{ 
          flex: '0 0 100%', 
          scrollSnapAlign: 'start',
          height: '180px', 
          backgroundColor: '#363636', 
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '10px',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px', zIndex: 0 }}></div>
          {/* 31 Days Badge */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            31 Days
          </div>
          {/* Left Half: Progress Circle */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div className="progress-container" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg className="progress-svg" width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <circle 
                className="bg-circle" 
                cx="70" cy="70" r="60"
                style={{ stroke: '#e0e0e05a', strokeWidth: '10px', fill: 'none' }}
              ></circle>
              <circle 
                className="progress-circle" 
                cx="70" cy="70" r="60"
                style={{ stroke: '#4ADE80', strokeWidth: '10px', fill: 'none', strokeDasharray: 2 * Math.PI * 60, strokeDashoffset: '0', strokeLinecap: 'round' }}
              ></circle>
            </svg>

              <div className="progress-text" id="progress-text" style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>100%</span>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', marginTop: '-4px' }}>Attendance</span>
              </div>

              {/* Inner child bar */}
              <div className="chld-bar flex" style={{ position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="105" height="105" style={{ transform: 'rotate(-90deg)' }}>
                  <circle className="circle-background" cx="52.5" cy="52.5" r="42" style={{ stroke: '#e0e0e05a', strokeWidth: '10px', fill: 'none' }}></circle>
                  {innerSegments.map((seg) => {
                    const arcLength = (seg.percent / 100) * innerCircumference;
                    // Gap offset for rounded caps so they don't overlap as much (optional, using strict math for now)
                    const offset = innerCircumference - arcLength;
                    const rotate = currentAngle;
                    
                    // Advance angle for next segment
                    currentAngle += (seg.percent / 100) * 360;

                    return (
                      <circle 
                        key={seg.id}
                        className={`circle-foreground segment${seg.id}`} 
                        cx="52.5" cy="52.5" r="42" 
                        style={{ 
                          stroke: seg.color, 
                          strokeWidth: '10px', 
                          fill: 'none', 
                          strokeDasharray: innerCircumference, 
                          strokeDashoffset: offset, 
                          transformOrigin: 'center', 
                          transform: `rotate(${rotate}deg)`, 
                          strokeLinecap: 'round',
                          transition: 'stroke-dashoffset 1s ease, transform 1s ease'
                        }}
                      ></circle>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div style={{ width: '3px', height: '120px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px' }}></div>

          {/* Right Half */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="col-dta" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p className="col-val" style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fff' }}>27 Days</p>
                <p className="col-titl" style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>Working Days</p>
              </div>
              <div>
                <p className="col-val" style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fff' }}>04 Days</p>
                <p className="col-titl" style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>Holidays</p>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2: Bar Graph */}
        <div style={{ 
          flex: '0 0 100%', 
          scrollSnapAlign: 'start',
          height: '180px', 
          backgroundColor: '#363636', 
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '20px 10px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px', zIndex: 0 }}></div>
          {[
            { label: 'P', value: 24, max: 31, color: '#4ADE80' },
            { label: 'L', value: 3, max: 31, color: '#FFE76B' },
            { label: 'H', value: 4, max: 31, color: '#FF9800' },
            { label: 'A', value: 0, max: 31, color: '#FD6579' }
          ].map((bar, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px', position: 'relative', zIndex: 1 }}>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                {bar.value.toString().padStart(2, '0')}
              </span>
              <div style={{ 
                width: '28px', 
                height: '100px', // Track height
                backgroundColor: 'rgba(255,255,255,0.05)', 
                borderRadius: '6px', 
                display: 'flex', 
                alignItems: 'flex-end',
                position: 'relative'
              }}>
                <div style={{ 
                  width: '100%', 
                  height: `${(bar.value / bar.max) * 100}%`, 
                  backgroundColor: bar.color, 
                  borderRadius: '6px',
                  transition: 'height 1s ease',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 40%, rgba(0,0,0,0.15) 100%)',
                  maskImage: 'linear-gradient(to bottom, black 40%, rgba(0,0,0,0.15) 100%)'
                }}></div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '500' }}>
                {bar.label}
              </span>
            </div>
          ))}
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
              borderRadius: '25%',
              backgroundColor: currentSlide === index ? '#ffffffff' : 'rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease'
            }}
          ></div>
        ))}
      </div>
      {/* New Section Below Indicator */}
      <div style={{ 
        marginTop: '120px', // Extra margin so the overflowing image doesn't get cut off by elements above
        backgroundColor: '#363636', 
        borderRadius: '24px', 
        position: 'relative',
        height: '85px',
      }}>
        {/* We use a wrapper with strict overflow to clip the pattern, allowing the image to overflow the parent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '24px', overflow: 'hidden', zIndex: 0 }}>
          <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px' }}></div>
        </div>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          clipPath: 'inset(-200px 0 0 0 round 24px)', // Allows overflow up to 200px on top, clips left/right/bottom strictly to the card with a 24px radius
          zIndex: 10,
          filter: 'grayscale(100%)'
        }}>
          <img 
            src="/chill.png" 
            alt="Chill" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              position: 'absolute',
              bottom: '-125px', // Adjust to slide image down
              left:'-100px',
            }} 
          />
        </div>
        
        {/* "Salary" Label Above the Div */}
        <div style={{ 
          position: 'absolute', 
          right: '24px', 
          top: '-60px', 
          zIndex: 11,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}>
          <span style={{ color: '#fff', fontSize: '22px', fontWeight: '400', lineHeight: 1 }}>Salary</span>
          <span style={{ color: '#fff', fontSize: '22px', fontWeight: '400', lineHeight: 1, marginTop: '6px' }}>Conversion</span>
        </div>
        
        {/* Amount Text at the Right End */}
        <div style={{ 
          position: 'absolute', 
          right: '24px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          zIndex: 11,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}>
          <span style={{ color: '#fff', fontSize: '32px', fontWeight: '700' }}>₹65,000</span>
        </div>

      </div>

      {/* 4 Stats Below Salary */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '16px',
        gap: '8px'
      }}>
        {[
          { label: 'Present', value: '24', color: '#4ADE80' },
          { label: 'Halfday', value: '02', color: '#FFE76B' },
          { label: 'Absent', value: '01', color: '#FD6579' },
          { label: 'P. Leave', value: '03', color: '#4484FF' }
        ].map((stat, i) => (
          <div key={i} style={{ 
            flex: 1, 
            backgroundColor: '#363636', 
            borderRadius: '16px', 
            padding: '12px 4px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-10px', top: '-10px', zIndex: 0 }}></div>
            <span style={{ color: stat.color, fontSize: '18px', fontWeight: 'bold', zIndex: 1, position: 'relative' }}>{stat.value}</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '4px', whiteSpace: 'nowrap', zIndex: 1, position: 'relative' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Horizontal Line Graph (Segmented Progress Bar for the 4 stats) */}
      <div style={{ marginTop: '24px' }}>
        {/* Labels Above Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '500' }}>Justification</span>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>80%</span>
        </div>

        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#363636', 
          borderRadius: '4px',
          display: 'flex',
          overflow: 'hidden',
          gap: '2px' // slight gap between segments for modern look
        }}>
          <div style={{ width: '80%', backgroundColor: '#4ADE80', borderRadius: '4px' }}></div>
          <div style={{ width: '20%', backgroundColor: '#FFE76B', borderRadius: '4px' }}></div>
        </div>
      </div>

      {/* Two Transparent Border Divs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '20px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}>
        {/* Justification Div */}
        <div 
          onClick={() => setIsJustificationTick(!isJustificationTick)}
          style={{
            flex: 1,
            height: '48px',
            position: 'relative',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '30px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            overflow: 'hidden',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {/* Text sliding animation */}
          <span style={{ 
            position: 'absolute', 
            top: '50%', 
            left: isJustificationTick ? '16px' : '46px',
            transform: 'translateY(-50%)',
            transition: 'left 0.3s ease',
            color: '#fff', 
            fontSize: '13px', 
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}>
            Justification
          </span>

          {/* Icon sliding & crossfade animation */}
          <div style={{ 
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: isJustificationTick ? 'calc(100% - 38px)' : '16px',
            transition: 'left 0.3s ease, background-color 0.3s ease',
            width: '22px', height: '22px', 
            borderRadius: '50%', 
            backgroundColor: isJustificationTick ? 'rgba(74, 222, 128, 0.15)' : 'rgba(253, 101, 121, 0.15)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <svg style={{ position: 'absolute', opacity: isJustificationTick ? 1 : 0, transition: 'opacity 0.3s ease' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <svg style={{ position: 'absolute', opacity: !isJustificationTick ? 1 : 0, transition: 'opacity 0.3s ease' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FD6579" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>

        {/* CL Applied Div */}
        <div 
          onClick={() => setIsClAppliedTick(!isClAppliedTick)}
          style={{
            flex: 1,
            height: '48px',
            position: 'relative',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '30px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            overflow: 'hidden',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {/* Text sliding animation */}
          <span style={{ 
            position: 'absolute', 
            top: '50%', 
            left: isClAppliedTick ? '16px' : '46px',
            transform: 'translateY(-50%)',
            transition: 'left 0.3s ease',
            color: '#fff', 
            fontSize: '13px', 
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}>
            CL Applied
          </span>

          {/* Icon sliding & crossfade animation */}
          <div style={{ 
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: isClAppliedTick ? 'calc(100% - 38px)' : '16px',
            transition: 'left 0.3s ease, background-color 0.3s ease',
            width: '22px', height: '22px', 
            borderRadius: '50%', 
            backgroundColor: isClAppliedTick ? 'rgba(74, 222, 128, 0.15)' : 'rgba(253, 101, 121, 0.15)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <svg style={{ position: 'absolute', opacity: isClAppliedTick ? 1 : 0, transition: 'opacity 0.3s ease' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <svg style={{ position: 'absolute', opacity: !isClAppliedTick ? 1 : 0, transition: 'opacity 0.3s ease' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FD6579" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
}
