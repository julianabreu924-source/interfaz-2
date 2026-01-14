import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext'; // Sistema de audio global
import { motion, AnimatePresence } from 'framer-motion'; // Librería para animaciones fluidas
import { ArrowLeft, User, Shield, Zap, Sword, ChevronLeft, ChevronRight, Lock } from 'lucide-react'; // Iconos modernos
// Importación de imágenes de los personajes
import wizardImg from '../assets/images/characters/wizard.png';
import warriorImg from '../assets/images/characters/MAGO_DE_BATALLA_2D-removebg-preview.png';
import elfImg from '../assets/images/characters/CAZADORA_ELFO-removebg-preview.png';
import curanderaImg from '../assets/images/characters/personaje.curandera.png';
import minotauroImg from '../assets/images/characters/minotauro.personaje.png';
// Importación de recursos de audio
import lobbyMusic from '../assets/audio/music/lobby.mp3';
import clickSfx from '../assets/audio/sfx/click.mp3';
import { useTimeOfDay } from '../hooks/useTimeOfDay'; // Hook para fondo según la hora

const BackgroundParticles = React.memo(({ count = 80, className = "magic-mote" }) => {
  const [particles, setParticles] = React.useState([]);
  
  React.useEffect(() => {
    setParticles([...Array(count)].map((_, i) => {
      const rand = Math.random();
      
      let sizeClass = "medium";
      if (rand < 0.4) sizeClass = "small";
      else if (rand > 0.85) sizeClass = "large";

      let shapeClass = "";
      if (rand < 0.2) shapeClass = "diamond";
      else if (rand > 0.9) shapeClass = "sparkle";

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${18 + Math.random() * 22}s`,
        sizeClass,
        shapeClass,
        opacity: 0.1 + Math.random() * 0.35,
        blur: rand > 0.85 ? '1px' : '0px',
        wind: `${(Math.random() - 0.5) * 700}px`
      };
    }));
  }, [count]);

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
        '--pulse-duration': `${4 + Math.random() * 4}s`
      }} 
    />
  ));
});

/**
 * Componente Principal CharacterLobby
 * Gestiona la selección de personajes, visualización de estadísticas y fondos dinámicos.
 */
const CharacterLobby = ({ onBack, onSelect }) => {
  // Estados para el personaje seleccionado y la visibilidad de la información
  const [selectedChar, setSelectedChar] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  
  // Obtiene el fondo actual según la hora del día (Día, Tarde, Noche)
  const { bg } = useTimeOfDay();
  
  // Funciones del sistema de audio
  const { playMusic, stopMusic, playSfx } = useAudio();

  // Al entrar al lobby se reproduce la música, y se detiene al salir
  useEffect(() => {
    playMusic(lobbyMusic);
    return () => stopMusic();
  }, []);

  // Base de datos local de personajes disponibles
  const characters = [
    {
      id: 0,
      name: "MAGO DE BATALLA",
      role: "HECHICERO ARCANO",
      description: "Un maestro de las artes místicas, capaz de controlar los elementos y doblegar la realidad.",
      stats: {
        attack: 40,
        defense: 30,
        magic: 95,
        speed: 60
      },
      image: wizardImg
    },
    {
      id: 1,
      name: "MAGO DE BATALLA",
      role: "COMBATIENTE",
      description: "Combinando acero y hechicería para dominar el campo de batalla.",
      stats: { attack: 75, defense: 55, magic: 65, speed: 50 },
      image: warriorImg
    },
    {
      id: 2,
      name: "CAZADORA ELFO",
      role: "TIRADOR DE ARCO",
      description: "Maestra de la precisión y el ataque a distancia, guardiana de los bosques antiguos.",
      stats: { attack: 75, defense: 30, magic: 30, speed: 90 },
      image: elfImg
    },
    {
      id: 3,
      name: "CURANDERA REAL",
      role: "CURANDERA",
      description: "Sabia de la luz, especialista en restauración y protección divina.",
      stats: { attack: 20, defense: 50, magic: 85, speed: 50 },
      image: curanderaImg,
      locked: false
    },
    {
      id: 4,
      name: "SEÑOR OSCURO",
      role: "DEMONIO",
      description: "Próximamente: Poder destructivo alimentado por las sombras.",
      stats: { attack: 95, defense: 40, magic: 70, speed: 65 },
      image: null,
      locked: true
    },
    {
      id: 5,
      name: "MINOTAURO COLOSAL",
      role: "TANQUE",
      description: "Una fuerza imparable de la naturaleza, protector inquebrantable.",
      stats: { attack: 40, defense: 95, magic: 5, speed: 20 },
      image: minotauroImg,
      locked: false
    }
  ];

  // Cambia al siguiente personaje en la lista de forma circular
  const handleNext = () => {
    setSelectedChar((prev) => (prev + 1) % characters.length);
    setShowInfo(false); // Oculta la info al cambiar de personaje
  };

  // Cambia al personaje anterior en la lista de forma circular
  const handlePrev = () => {
    setSelectedChar((prev) => (prev - 1 + characters.length) % characters.length);
    setShowInfo(false);
  };

  return (
    <motion.div 
      className="lobby-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ '--lobby-bg': `url(${bg})` }} // Aplica el fondo dinámico mediante CSS variable
    >
      {/* Elementos de fondo decorativos */}
      
      <div className="lobby-content">
        {/* Título de la pantalla con animación de entrada */}
        <motion.h1 
          className="lobby-title"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          SELECCIÓN DE HÉROE
        </motion.h1>

        {/* Escenario principal de selección */}
        <div className="char-selection-stage">
          {/* Botón de navegación izquierda */}
          <button className="nav-arrow left" onClick={() => { playSfx(clickSfx); handlePrev(); }}>
            <ChevronLeft size={48} color="#fff" />
          </button>

          {/* CONTENEDOR DE EXHIBICIÓN DE HÉROE: Gestiona la imagen y efectos visuales */}
          <motion.div 
            className="hero-showcase-container"
            key={selectedChar} // Clave necesaria para refrescar la animación al cambiar de personaje
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            {/* 1. Área de Imagen del Héroe */}
            <div className="hero-image-wrapper">
               <div className="hero-image-placeholder">
                  {characters[selectedChar].image ? (
                     <img 
                       src={characters[selectedChar].image} 
                       alt={characters[selectedChar].name} 
                       className="hero-full-img"
                     />
                  ) : (
                     // Si el personaje está bloqueado, muesta un icono de candado
                     <div className="locked-hero-state">
                         <Lock size={80} color="#555" />
                         <span>CLASIFICADO</span>
                     </div>
                  )}
               </div>
               
               {/* Efecto de viñeta para dar profundidad a la imagen */}
               <div className="hero-vignette" />
            </div>

            {/* 2. Panel de Información (Solo visible si showInfo es verdadero) */}
            <AnimatePresence>
              {showInfo && (
                <motion.div 
                  className="hero-info-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                   {/* Encabezado: Nombre y Rol del personaje */}
                   <div className="hero-header-group">
                     <h1 className="hero-name-large">{characters[selectedChar].name}</h1>
                     <div className="hero-role-badge">
                        <Sword size={16} />
                        <span>{characters[selectedChar].role}</span>
                     </div>
                   </div>

                   {/* Descripción corta o "Lore" */}
                   <p className="hero-lore">{characters[selectedChar].description}</p>
                   
                   {/* Rejilla de estadísticas con barras de progreso animadas */}
                   <div className="hero-stats-grid">
                      <div className="stat-unit">
                         <span className="stat-label">ATK</span>
                         <div className="stat-track-large">
                            <motion.div className="stat-fill-large atk" initial={{width: 0}} animate={{width: `${characters[selectedChar].stats.attack}%`}} />
                         </div>
                      </div>
                      <div className="stat-unit">
                         <span className="stat-label">DEF</span>
                         <div className="stat-track-large">
                            <motion.div className="stat-fill-large def" initial={{width: 0}} animate={{width: `${characters[selectedChar].stats.defense}%`}} />
                         </div>
                      </div>
                      <div className="stat-unit">
                         <span className="stat-label">MAG</span>
                         <div className="stat-track-large">
                            <motion.div className="stat-fill-large mag" initial={{width: 0}} animate={{width: `${characters[selectedChar].stats.magic}%`}} />
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Botón flotante para activar/desactivar el panel de INFO */}
          <div style={{position: 'absolute', bottom: '20px', right: '50px', zIndex: 100}}>
             <button 
                className="crystal-button secondary" 
                style={{
                  minWidth: 'auto', 
                  padding: '8px 16px', 
                  height: '36px',
                  gap: '8px',
                  borderRadius: '20px',
                  background: 'rgba(0,0,0,0.8)', 
                  border: '1px solid var(--pixel-gold)'
                }}
                onClick={() => { playSfx(clickSfx); setShowInfo(!showInfo); }}
             >
                <User size={14} color="var(--pixel-gold)" />
                <span style={{fontSize: '0.6rem', color: 'var(--pixel-gold)'}}>{showInfo ? 'CERRAR' : 'INFO'}</span>
             </button>
          </div>

          {/* Botón de navegación derecha */}
          <button className="nav-arrow right" onClick={() => { playSfx(clickSfx); handleNext(); }}>
            <ChevronRight size={48} color="#fff" />
          </button>
        </div>

        {/* Controles inferiores: Volver y Seleccionar */}
        <div className="lobby-controls">
          <button className="crystal-button secondary" onClick={() => { playSfx(clickSfx); onBack(); }}>
            <ArrowLeft size={20} />
            <span>VOLVER</span>
          </button>
          
          <button 
            className={`crystal-button ${characters[selectedChar].locked ? 'locked' : 'primary'}`} 
            onClick={() => { playSfx(clickSfx); !characters[selectedChar].locked && onSelect(characters[selectedChar]); }}
            disabled={characters[selectedChar].locked}
            style={{ opacity: characters[selectedChar].locked ? 0.5 : 1, cursor: characters[selectedChar].locked ? 'not-allowed' : 'pointer' }}
          >
            {/* Si está bloqueado muestra icono de candado, si no, es el botón de selección final */}
            {characters[selectedChar].locked ? <Lock size={16} /> : null}
            <span>{characters[selectedChar].locked ? 'BLOQUEADO' : 'SELECCIONAR'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterLobby;
