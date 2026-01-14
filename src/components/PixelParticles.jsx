import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SUB-COMPONENTE: Particle
 * Representa un único fragmento de píxel que surge tras un clic.
 * Se mueve hacia una dirección aleatoria y desaparece.
 */
const Particle = ({ x, y, color }) => {
  // Genera un destino aleatorio para la explosión en un radio de 150px
  const destinationX = (Math.random() - 0.5) * 150;
  const destinationY = (Math.random() - 0.5) * 150;
  
  return (
    <motion.div
      initial={{ 
        left: x, 
        top: y, 
        opacity: 1, 
        scale: 1,
        width: 6,
        height: 6
      }}
      animate={{ 
        left: x + destinationX, 
        top: y + destinationY, 
        opacity: 0,
        scale: 0,
        rotate: Math.random() * 360
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: 'fixed',
        backgroundColor: color,
        zIndex: 9999,
        pointerEvents: 'none', // Las partículas no interfieren con los clics reales
        boxShadow: '2px 2px 0px #000', // Sombra pixelada
        imageRendering: 'pixelated'
      }}
    />
  );
};

/**
 * COMPONENTE: PixelParticles
 * Sistema global de emisión de partículas. 
 * Detecta clics y genera fragmentos visuales para dar una sensación de "crunchy UI".
 */
const PixelParticles = () => {
  const [particles, setParticles] = useState([]); // Almacena las partículas activas en pantalla

  /**
   * FUNCIÓN: createParticles
   * Crea un grupo de nuevas partículas en la posición del clic.
   */
  const createParticles = useCallback((e) => {
    // Determina el color basado en si el botón clicado es primario o no
    const color = e.target.classList.contains('primary') ? '#ffffff' : '#ffde59';
    
    // Genera 6 fragmentos con IDs únicos
    const newParticles = Array.from({ length: 6 }).map(() => ({
      id: Math.random(),
      x: e.clientX,
      y: e.clientY,
      color: color
    }));

    setParticles(prev => [...prev, ...newParticles]);
    
    // LIMPIEZA: Elimina las partículas del DOM tras medio segundo para liberar memoria
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 600);
  }, []);

  // EXPONE LA FUNCIÓN AL OBJETO WINDOW:
  // Esto permite que cualquier botón en CUALQUIER archivo pueda invocar "window.spawnParticles(e)" 
  // sin tener que pasar la función a través de props.
  React.useEffect(() => {
    window.spawnParticles = createParticles;
    return () => delete window.spawnParticles;
  }, [createParticles]);

  return (
    <AnimatePresence>
      {particles.map(p => (
        <Particle key={p.id} x={p.x} y={p.y} color={p.color} />
      ))}
    </AnimatePresence>
  );
};

export default PixelParticles;
