import React, { useCallback, useRef } from 'react';

const MAX_TILT = 9; // degrees

// Only tilt for fine pointers (mouse/trackpad) and when the user hasn't
// asked for reduced motion — same guard as the original vanilla-JS build.
function tiltEnabled() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function StepCard({ num, icon, title, children, tag }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!tiltEnabled() || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 2 * MAX_TILT;
    const rotateX = (0.5 - py) * 2 * MAX_TILT;
    ref.current.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
    ref.current.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
    ref.current.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    ref.current.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--rx', '0deg');
    ref.current.style.setProperty('--ry', '0deg');
  }, []);

  return (
    <div className="step-card" ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <span className="step-badge">{num}</span>
      <div className="step-icon-wrap">{icon}</div>
      <h3>{title}</h3>
      <p>{children}</p>
      <span className="step-tag">{tag}</span>
    </div>
  );
}
