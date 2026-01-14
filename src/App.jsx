import React, { useState, Suspense, lazy, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import MainMenu from './components/MainMenu';
import PixelParticles from './components/PixelParticles';
import { AnimatePresence, motion } from 'framer-motion';
import { GAME_CONFIG } from './config/constants'; // Variables de configuración base (resolución lógica)

import CharacterLobby from './components/CharacterLobby';

// CARGA DIFERIDA (Lazy Loading): Los componentes pesados solo se cargan cuando se necesitan.
// Esto mejora drásticamente el tiempo de carga inicial.
const GachaSystem = lazy(() => import('./components/GachaSystem'));
const ShopSystem = lazy(() => import('./components/ShopSystem'));
const GameModeSelection = lazy(() => import('./components/GameModeSelection'));
const StoryIntro = lazy(() => import('./components/StoryIntro'));
import MiniLoader from './components/MiniLoader';

import { AudioProvider } from './context/AudioContext'; // Proveedor central de música y efectos
import SettingsModal from './components/SettingsModal';
import AtmosphericParticles from './components/AtmosphericParticles';
import { useGameStore } from './store/useGameStore'; // Repositorio global del estado del juego

/**
 * COMPONENTE PRINCIPAL: App
 * Actúa como el orquestador del juego, manejando la navegación entre pantallas,
 * el escalado de resolución, la pantalla completa y la orientación en móviles.
 */
function App() {
  // Conexión al estado global para saber qué pantalla mostrar
  const { 
    gameState, setGameState, 
    showSettings, setShowSettings 
  } = useGameStore();

  const [scale, setScale] = useState(1); // Factor de escala para adaptar la UI al tamaño de ventana
  const [dimensions, setDimensions] = useState({ 
    width: GAME_CONFIG.LOGICAL_WIDTH, 
    height: GAME_CONFIG.LOGICAL_HEIGHT 
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null); // Captura el evento de instalación PWA
  const [showOrientationWarning, setShowOrientationWarning] = useState(false); // Aviso para móviles en vertical
  const [isPortrait, setIsPortrait] = useState(false);

  /**
   * LÓGICA DE ESCALADO DINÁMICO (Responsive)
   * Calcula cuánto debe estirarse o encogerse la interfaz para ajustarse a la ventana del navegador
   * manteniendo la proporción lógica de píxeles.
   */
  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      // Debounce: Evita recalcular cientos de veces por segundo al arrastrar la ventana
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // El escalado se basa en la altura para garantizar que todo el contenido vertical sea visible
        const h = GAME_CONFIG.LOGICAL_HEIGHT;
        const newScale = windowHeight / h;
        
        // Calculamos el ancho lógico necesario para cubrir toda la ventana con el nuevo escalado
        const newWidth = Math.ceil(windowWidth / newScale);
        
        setScale(newScale);
        setDimensions({ width: newWidth, height: h });
      }, 50); // Reducido el delay para una respuesta más rápida
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Ejecución inicial

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  /**
   * CONTROL DE PANTALLA COMPLETA (Atajo F11)
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.warn(err));
        } else {
          document.exitFullscreen().catch(err => console.warn(err));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * INSTALACIÓN PWA (Progessive Web App)
   * Captura el evento para que los botones de "Instalar" funcionen en los ajustes.
   */
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Lanza el diálogo de instalación del navegador
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // FUNCIONES DE NAVEGACIÓN RÁPIDA
  const handleExit = () => setGameState('menu');
  const handleLobby = () => setGameState('lobby');
  const handleGacha = () => setGameState('gacha');
  const handleShop = () => setGameState('shop');
  const handleModeSelect = () => setGameState('mode_selection');
  const handleSettings = () => setShowSettings(true);

  const handleCharacterSelect = (char) => {
    console.log("Personaje seleccionado:", char);
    setGameState('menu');
  };
  
  /**
   * ORIENTACIÓN EN MÓVILES
   * Intenta forzar el modo horizontal (landscape) si el dispositivo lo permite.
   */
  const lockOrientation = async () => {
    try {
      if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen().catch(() => {});
        }
        
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      }
    } catch (err) {
      console.warn("No se pudo bloquear la orientación:", err);
    }
  };

  useEffect(() => {
    lockOrientation();
    document.addEventListener('fullscreenchange', lockOrientation);
    return () => document.removeEventListener('fullscreenchange', lockOrientation);
  }, []);

  // Cierra el aviso de orientación si el usuario ya lo vio
  const handleDismissWarning = () => {
    sessionStorage.setItem('arcana_orientation_warning_seen', 'true');
    setShowOrientationWarning(false);
  };

  /**
   * DETECCIÓN DE ORIENTACIÓN
   * Muestra un aviso si el usuario está en vertical, ya que el diseño es 100% horizontal.
   */
  useEffect(() => {
    const checkOrientation = () => {
      const isP = window.innerHeight > window.innerWidth;
      setIsPortrait(isP);
      
      const hasSeen = sessionStorage.getItem('arcana_orientation_warning_seen');
      
      if (isP && !hasSeen) {
        setShowOrientationWarning(true);
      } 
      
      if (!isP && showOrientationWarning) {
        sessionStorage.setItem('arcana_orientation_warning_seen', 'true');
        setShowOrientationWarning(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, [showOrientationWarning]);

  return (
    <AudioProvider>
      <div className="game-wrapper" onClick={() => {
        // En móviles, el primer clic debe desbloquear el audio
        const audioCtx = window.AudioContext || window.webkitAudioContext;
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        // Intento sutil de forzar orientación al hacer clic si el usuario está en vertical
        if (window.innerHeight > window.innerWidth) {
          lockOrientation();
        }
      }}>
        {/* Partículas de ambiente y partículas tras clic */}
        <AtmosphericParticles />
        <PixelParticles />
        
        {/* AVISO DE ORIENTACIÓN (Solo móviles) */}
        <AnimatePresence>
          {showOrientationWarning && (
            <motion.div 
              className="portrait-warning"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="rotate-icon" />
              <h2 className="warning-text-large">MODO HORIZONTAL REQUERIDO</h2>
              <p className="warning-text-small">
                Por favor, rota tu dispositivo para una mejor experiencia arcana.
              </p>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  className="force-landscape-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    lockOrientation();
                  }}
                >
                  FORZAR ROTACIÓN
                </button>
                <button 
                  className="force-landscape-btn"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '2px solid #555' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismissWarning();
                  }}
                >
                  ENTENDIDO
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PANTALLA DE CARGA INICIAL */}
        <AnimatePresence mode="wait">
            {gameState === 'loading' && (
              <LoadingScreen key="loading" onComplete={() => setGameState('menu')} />
            )}
        </AnimatePresence>

        {/* CONTENEDOR ESCALABLE (Viewport)
            Aquí es donde ocurre la magia: todo lo que está dentro se escala matemáticamente
            para verse igual sin importar el tamaño físico de la pantalla.
        */}
        <div 
          className="game-scaler"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transform: `scale(${scale}) translateX(-50%)`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: '50%', // Centrado horizontal
            overflow: 'hidden',
            imageRendering: 'pixelated'
          }}
        >
          {/* Capa de viñeta para dar profundidad visual (bordes oscuros) */}
          <div className="vignette-overlay" />
          
          <AnimatePresence mode="wait">
            {/* LÓGICA DE CAMBIO DE PANTALLAS (Router Manual) */}
            
            {gameState === 'menu' && (
              <MainMenu 
                key="menu"
                onStart={handleModeSelect}
                onTutorial={() => alert('Tutorial próximamente...')}
                onCharacters={handleLobby}
                onSettings={handleSettings}
                onGacha={handleGacha}
                onShop={handleShop}
              />
            )}
            
            {/* Componentes cargados dinámicamente con Suspense */}
            {gameState === 'mode_selection' && (
              <Suspense fallback={<MiniLoader text="CARGANDO REINOS..." />}>
                  <GameModeSelection onBack={handleExit} />
              </Suspense>
            )}

            {gameState === 'story_intro' && (
              <Suspense fallback={<MiniLoader text="PREPARANDO VISIONES..." />}>
                  <StoryIntro onComplete={() => setGameState('lobby')} />
              </Suspense>
            )}

            {gameState === 'lobby' && (
              <CharacterLobby 
                key="lobby"
                onBack={() => setGameState('menu')}
                onSelect={handleCharacterSelect}
              />
            )}

            {gameState === 'gacha' && (
              <Suspense fallback={<MiniLoader text="PREPARANDO ALTAR..." />}>
                  <GachaSystem onBack={handleExit} />
              </Suspense>
            )}

            {gameState === 'shop' && (
              <Suspense fallback={<MiniLoader text="ABRIENDO TIENDA..." />}>
                  <ShopSystem onBack={handleExit} />
              </Suspense>
            )}
          </AnimatePresence>

          {/* CAPAS SUPERPUESTAS GLOBALES (Ajustes) */}
          <AnimatePresence>
              {showSettings && (
                  <SettingsModal 
                    onClose={() => setShowSettings(false)} 
                    onInstall={handleInstallClick}
                    canInstall={!!deferredPrompt}
                  />
              )}
          </AnimatePresence>
        </div>
      </div>
    </AudioProvider>
  );
}

export default App;
