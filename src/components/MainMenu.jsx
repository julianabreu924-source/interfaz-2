import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Control de animaciones
import { Settings, LogOut, Map, User, Sparkles, ShoppingBag } from 'lucide-react'; // Iconos de la interfaz
import { useAudio } from '../context/AudioContext'; // Sistema de audio del juego

/**
 * Componente WizardHat (SVG)
 * Representa un sombrero de mago estilizado para la interfaz.
 */
const WizardHat = ({ size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    style={{ color: 'var(--pixel-gold)', filter: 'drop-shadow(0 0 5px var(--pixel-gold))', marginRight: '8px' }}
  >
    {/* Cuerpo del sombrero */}
    <path d="M12 3 L5 17 L19 17 Z" />
    {/* Cinta decorativa */}
    <rect x="6.5" y="14" width="11" height="2" fill="#8c52ff" />
    {/* Ala del sombrero */}
    <rect x="2" y="17" width="20" height="3" />
  </svg>
);

// Recursos de audio para el menú
import menuMusic from '../assets/audio/music/menu.mp3';
import clickSfx from '../assets/audio/sfx/click.mp3';

const BackgroundParticles = React.memo(({ count = 80, className = "magic-mote" }) => {
  // useMemo para calcular las propiedades únicas de cada partícula una sola vez
  const particles = useMemo(() => [...Array(count)].map((_, i) => {
    const rand = Math.random();
    
    // Tamaño
    let sizeClass = "medium";
    if (rand < 0.4) sizeClass = "small";
    else if (rand > 0.85) sizeClass = "large";

    // Forma
    let shapeClass = "";
    if (rand < 0.2) shapeClass = "diamond";
    else if (rand > 0.9) shapeClass = "sparkle";

    return {
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${15 + Math.random() * 25}s`, // Más lento para que se vea más fluido
      sizeClass,
      shapeClass,
      opacity: 0.1 + Math.random() * 0.4,
      blur: rand > 0.8 ? '1px' : '0px',
      wind: `${(Math.random() - 0.5) * 600}px` // Viento más extendido
    };
  }), [count]);

  return particles.map(p => (
    <div 
      key={p.id} 
      className={`${className} ${p.sizeClass} ${p.shapeClass} mote-twinkle`} 
      style={{ 
        left: p.left, 
        top: p.top, 
        animationDelay: p.delay,
        '--drift-duration': p.duration,
        '--base-opacity': p.opacity,
        '--mote-blur': p.blur,
        '--wind-direction': p.wind,
        '--pulse-duration': `${3 + Math.random() * 5}s`
      }} 
    />
  ));
});

// Importación de los estilos específicos para los botones tipo Undertale/Arcana
import '../styles/UndertaleButtons.css';

// Importación de la gema personalizada para los botones
import gemaBotones from '../assets/images/ui/gema.botones.png';

/**
 * Componente CrystalIcon
 * Muestra la gema personalizada que aparece junto a los botones al pasar el ratón.
 */
const CrystalIcon = () => (
  <img 
    src={gemaBotones} 
    className="crystal-icon" 
    alt="gem"
    style={{ imageRendering: 'pixelated' }} // Mantiene el estilo pixel art nítido
  />
);

/**
 * Componente MenuButton
 * Encapsula la lógica de cada botón del menú principal, incluyendo sonidos y tooltips.
 */
const MenuButton = React.memo(({ opt, onAction }) => {
  const { playSfx } = useAudio();
  return (
    <div className="undertale-btn-wrapper">
      {/* Icono de gema que aparece fuera del botón en hover */}
      <CrystalIcon />
      <motion.button
        className="undertale-btn"
        onClick={(e) => {
            playSfx(clickSfx); // Sonido al hacer clic
            onAction(); // Ejecuta la acción asignada (Jugar, Tienda, etc.)
        }}
        whileTap={{ scale: 0.98 }} // Pequeño efecto de presión al pulsar
      >
        <span>{opt.label}</span>
      </motion.button>
      {/* Cuadro de descripción (tooltip) que aparece a la derecha */}
      <div className="menu-btn-tooltip-undertale">
        <div>{opt.desc}</div>
      </div>
    </div>
  );
});

import { useTimeOfDay } from '../hooks/useTimeOfDay'; // Hook para el fondo dinámico

/**
 * Componente TitleParticles
 * Genera chispas doradas y púrpuras específicamente alrededor del título.
 */
const TitleParticles = React.memo(({ count = 12 }) => {
  const particles = useMemo(() => [...Array(count)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    color: Math.random() > 0.5 ? 'gold' : 'purple'
  })), [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div key={p.id} className={`title-mote ${p.color === 'purple' ? 'purple' : ''}`} 
             style={{ left: p.left, top: p.top, animationDelay: p.delay }} />
      ))}
    </div>
  );
});

/**
 * Componente Principal MainMenu
 * Es la estructura base del menú de inicio del juego.
 */
const MainMenu = ({ onStart, onTutorial, onCharacters, onSettings, onGacha, onShop }) => {
  // Estado para el modal de confirmación de salida
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Obtiene el fondo actual (Día, Tarde o Noche)
  const { bg } = useTimeOfDay();
  
  // Controles de audio
  const { playMusic, stopMusic, playSfx } = useAudio();

  // Control de la música al montar/desmontar el menú
  useEffect(() => {
    playMusic(menuMusic, true); // true indica que se repita en bucle
    return () => { stopMusic(); };
  }, [playMusic, stopMusic]);

  // Configuración de las opciones del menú
  const menuOptions = [
    { id: 'start', label: 'JUGAR', desc: 'Inicia tu aventura en este mundo de luz y sombra.', action: onStart },
    { id: 'tutorial', label: 'ESCRIBIR', desc: 'Aprende los fundamentos de la magia.', action: onTutorial },
    { id: 'characters', label: 'PERSONAJE', desc: 'Configura tu alma y equipo.', action: onCharacters },
    { id: 'gacha', label: 'INVOCAR', desc: 'Llama a los antiguos mediante los cristales.', action: onGacha },
    { id: 'shop', label: 'TIENDA', desc: 'Intercambia tus gemas por artefactos.', action: onShop }
  ];

  return (
    <div className="menu-container" style={{ '--lobby-bg': `url(${bg})` }}>
      {/* Sección del Título con sus propias partículas */}
      <div className="title-section">
        <TitleParticles />
        <h1 className="menu-title-v2">RUNES OF THE REBORN</h1>
      </div>

      {/* Contenedor central de los botones principales */}
      <div className="undertale-menu-container">
        {menuOptions.map((opt) => (
          <MenuButton key={opt.id} opt={opt} onAction={opt.action} />
        ))}
      </div>

      {/* Botón de Ajustes (esquina superior derecha) */}
      <button 
        className="settings-btn-image" 
        onClick={onSettings}
      >
        <Settings size={22} color="#fff" />
      </button>

      {/* Botón de Salir (esquina superior izquierda) */}
      <button 
        className="exit-btn-v2" 
        onClick={() => setShowExitConfirm(true)}
      >
        <LogOut size={22} />
      </button>

      {/* MODAL DE CONFIRMACIÓN DE SALIDA (Estilo Undertale) */}
      <AnimatePresence>
        {showExitConfirm && (
            <motion.div 
                className="undertale-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="undertale-modal-box">
                    <p className="undertale-text">
                        ¿Estás seguro de que quieres salir?
                    </p>
                    <div className="undertale-buttons">
                        <button 
                            className="undertale-btn" 
                            onClick={() => {
                                playSfx(clickSfx);
                                window.close(); // Intenta cerrar la pestaña
                                // Mensaje de respaldo si el navegador bloquea el cierre automático
                                alert("No se puede cerrar la pestaña automáticamente. Por favor cierra el navegador.");
                                setShowExitConfirm(false);
                            }}
                        >
                            SÍ
                        </button>
                        <button 
                            className="undertale-btn" 
                            onClick={() => {
                                playSfx(clickSfx);
                                setShowExitConfirm(false);
                            }}
                        >
                            NO
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainMenu;
