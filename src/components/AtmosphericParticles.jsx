import React, { useMemo } from 'react';

/**
 * COMPONENTE: AtmosphericParticles
 * Genera un sistema de partículas mágico que flota por toda la pantalla.
 * Estas partículas son globales y persisten durante todo el juego.
 */
const AtmosphericParticles = React.memo(({ count = 70 }) => {
  // Generamos las propiedades de las partículas una sola vez para optimizar rendimiento
  const particles = useMemo(() => [...Array(count)].map((_, i) => {
    const rand = Math.random();
    
    // Clasificación por tamaño
    let sizeClass = "medium";
    if (rand < 0.4) sizeClass = "small";
    else if (rand > 0.85) sizeClass = "large";

    // Clasificación por forma (para que no parezcan burbujas)
    let shapeClass = "";
    if (rand < 0.2) shapeClass = "diamond";
    else if (rand > 0.85) shapeClass = "sparkle";

    return {
      id: i,
      // Posición inicial aleatoria por toda la pantalla para que el viento las "atrape"
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * -60}s`, 
      duration: `${25 + Math.random() * 35}s`, 
      sizeClass,
      shapeClass,
      opacity: 0.1 + Math.random() * 0.4,
      blur: rand > 0.85 ? '1px' : '0px',
      vStart: `${(Math.random() - 0.5) * 300}px`,
      pulseDuration: `${3 + Math.random() * 4}s`
    };
  }), [count]);

  return (
    <div className="atmospheric-container" style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 10000,
      overflow: 'hidden'
    }}>
      {particles.map(p => (
        /* El div externo se encarga de la trayectoria del viento (Drift) */
        <div 
          key={p.id} 
          className={`magic-mote ${p.sizeClass} ${p.shapeClass}`} 
          style={{ 
            left: p.left, 
            top: p.top, 
            animationDelay: p.delay,
            '--drift-duration': p.duration,
            '--base-opacity': p.opacity,
            '--mote-blur': p.blur,
            '--v-start': p.vStart
          }} 
        >
          {/* El div interno se encarga del parpadeo y escala (Pulse) */}
          <div className="mote-twinkle-inner" style={{
             width: '100%',
             height: '100%',
             backgroundColor: 'inherit',
             clipPath: 'inherit',
             borderRadius: 'inherit',
             animation: `motePulse ${p.pulseDuration} infinite ease-in-out alternate`
          }} />
        </div>
      ))}
    </div>
  );
});

export default AtmosphericParticles;
