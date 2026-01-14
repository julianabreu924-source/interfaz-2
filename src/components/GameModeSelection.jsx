import React from 'react';
import { motion } from 'framer-motion'; // Librería para animaciones fluidas
import { ArrowLeft, BookOpen, Users, Skull, Sword, Castle } from 'lucide-react'; // Iconos para los modos
import { useGameStore } from '../store/useGameStore'; // Repositorio de estado global
import { useAudio } from '../context/AudioContext'; // Contexto para manejar música y efectos
import clickSfx from '../assets/audio/sfx/click.mp3'; // Sonido de clic
import gameModesMusic from '../assets/audio/music/modos de juego.mp3'; // Música de fondo de esta sección
import '../styles/GameMode.css'; // Estilos específicos para la selección de modo
import { useTimeOfDay } from '../hooks/useTimeOfDay'; // Hook para fondo dinámico según la hora

/**
 * COMPONENTE: GameModeSelection
 * Permite al jugador elegir entre diferentes modos de juego (Historia, Multijugador, etc.)
 */
const GameModeSelection = ({ onBack }) => {
  const { setGameState } = useGameStore(); // Función para cambiar el estado general del juego
  const { playMusic, playSfx } = useAudio(); // Funciones de audio
  const { bg } = useTimeOfDay(); // Obtiene la imagen de fondo adecuada para la hora actual

  // Al montar el componente, inicia la música de fondo de selección de modo
  React.useEffect(() => {
    playMusic(gameModesMusic, true);
  }, [playMusic]);

  // Definición de los modos de juego disponibles y bloqueados
  const modes = [
    {
      id: 'story',
      title: 'MODO HISTORIA',
      subtitle: 'La Leyenda de los Cristales',
      desc: 'Embárcate en una aventura épica para restaurar el equilibrio del mundo. Descubre secretos antiguos y enfrenta bestias míticas.',
      icon: <BookOpen size={48} color="#ffd700" />, 
      color: '#ffd700',
      locked: false // Este modo está activo
    },
    {
      id: 'multiplayer',
      title: 'MULTIJUGADOR',
      subtitle: 'Arena de Batalla',
      desc: 'PRÓXIMAMENTE',
      icon: <Users size={48} color="#4488ff" />,
      color: '#4488ff',
      locked: true // Bloqueado por ahora
    },
    {
      id: 'dungeon',
      title: 'MODO MAZMORRA',
      subtitle: 'La Torre Infinita',
      desc: 'PRÓXIMAMENTE',
      icon: <Castle size={48} color="#a855f7" />,
      color: '#a855f7',
      locked: true
    },
    {
      id: 'survival',
      title: 'SUPERVIVENCIA',
      subtitle: 'El Abismo Infinito',
      desc: 'PRÓXIMAMENTE',
      icon: <Skull size={48} color="#ff4444" />,
      color: '#ff4444',
      locked: true
    }
  ];

  /**
   * MANEJADOR: Selección de modo
   * Ejecuta la lógica dependiendo de si el modo está bloqueado o es el modo Historia.
   */
  const handleSelect = (mode) => {
    playSfx(clickSfx); // Sonido de interacción
    if (mode.locked) {
        alert("Este modo estará disponible próximamente.");
        return;
    }
    
    if (mode.id === 'story') {
        setGameState('story_intro'); // Cambia el estado a la introducción de la historia
    } else {
        alert(`Iniciando ${mode.title}...`);
    }
  };

  return (
    <div className="game-mode-overlay" style={{ '--lobby-bg': `url(${bg})` }}>
      {/* Imagen de fondo con brillo reducido para que resalte la interfaz */}
      <div className="lobby-bg-image" style={{ filter: 'brightness(0.3)' }} />

      <motion.div 
        className="mode-select-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Título de la sección con animación de entrada */}
        <motion.h1 
            className="lobby-title"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            MODOS DE JUEGO
        </motion.h1>

        {/* Cuadrícula de tarjetas de modos de juego */}
        <div className="modes-grid">
            {modes.map((mode, index) => (
                <motion.div 
                    key={mode.id}
                    className={`mode-card ${mode.locked ? 'locked' : ''}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                    onClick={() => handleSelect(mode)}
                    // Escala la tarjeta al pasar el ratón si no está bloqueada
                    whileHover={!mode.locked ? { scale: 1.05, borderColor: mode.color } : {}}
                    whileTap={!mode.locked ? { scale: 0.95 } : {}}
                >
                    {/* Marco del icono con el color representativo del modo */}
                    <div className="mode-icon-frame" style={{ borderColor: mode.color }}>
                        {mode.icon}
                    </div>
                    
                    <div className="mode-content">
                        <h2 className="mode-title" style={{ color: mode.locked ? '#888' : '#fff' }}>
                            {mode.title}
                        </h2>
                        <h3 className="mode-subtitle" style={{ color: mode.color }}>
                            {mode.subtitle}
                        </h3>
                        <p className="mode-desc">
                            {mode.desc}
                        </p>
                    </div>

                    {/* Mostrar icono de espada solo en modos desbloqueados */}
                    {!mode.locked && (
                        <div className="mode-arrow">
                            <Sword size={24} className="sword-icon" />
                        </div>
                    )}
                </motion.div>
            ))}
        </div>

        {/* Botón para regresar al menú principal */}
        <button className="crystal-button secondary mode-back-btn" onClick={() => { playSfx(clickSfx); onBack(); }}>
            <ArrowLeft size={20} />
            <span>VOLVER AL MENÚ</span>
        </button>
      </motion.div>
    </div>
  );
};

export default GameModeSelection;
