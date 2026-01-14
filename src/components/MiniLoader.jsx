import React from 'react';
import { motion } from 'framer-motion';

/**
 * COMPONENTE: MiniLoader
 * Una versión simplificada de la pantalla de carga que se utiliza para transiciones rápidas
 * entre menús o cuando se cargan componentes bajo demanda (lazy loading).
 */
const MiniLoader = ({ text = "CARGANDO..." }) => {
  return (
    <div className="mini-loader-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      background: 'rgba(0,0,0,0.8)', // Fondo semi-transparente para oscurecer el fondo
      color: '#fff',
      fontFamily: "'Press Start 2P', cursive",
      zIndex: 50
    }}>
      {/* Texto informativo de carga */}
      <div style={{ marginBottom: '15px', fontSize: '0.8rem', textShadow: '2px 2px #000' }}>
        {text}
      </div>
      
      {/* BARRA DE PROGRESO INFINITA (BUCLE) */}
      <div className="mini-progress-bar" style={{
        width: '200px',
        height: '12px',
        border: '3px solid #fff',
        padding: '2px',
        background: '#000',
        position: 'relative'
      }}>
        <motion.div 
          style={{
            height: '100%',
            background: '#ffd700', // Color dorado característico
            boxShadow: '0 0 10px #ffd700'
          }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            repeatType: "reverse" // Efecto de ida y vuelta
          }}
        />
      </div>
    </div>
  );
};

export default MiniLoader;
