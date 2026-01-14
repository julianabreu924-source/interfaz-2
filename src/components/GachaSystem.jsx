import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Librería para animaciones complejas
import { X, Sparkles, Star, ChevronLeft, ChevronRight } from 'lucide-react'; // Iconografía de la interfaz
import swordImg from '../assets/images/ui/sword_icon.png';
import gemIcon from '../assets/images/ui/gem_icon.png';
import '../index.css';

import { BANNERS, ITEMS } from '../config/gameData'; // Datos de banners y objetos del juego
import { useGameStore } from '../store/useGameStore'; // Repositorio global del estado del jugador

/**
 * COMPONENTE: GachaSystem
 * Gestiona el sistema de invocaciones (deseos) del juego.
 * Permite a los jugadores gastar gemas para obtener personajes legendarios u objetos comunes.
 */
const GachaSystem = ({ onBack }) => {
  const { spendGems, addCharacter, gems } = useGameStore();
  
  // ESTADOS DEL SISTEMA
  const [phase, setPhase] = useState('idle'); // idle (menú), wishing (animación), result (revelación)
  const [rewards, setRewards] = useState([]); // Lista de objetos obtenidos en la tirada
  const [legendaryQueue, setLegendaryQueue] = useState([]); // Cola de personajes 5 estrellas para mostrar por separado
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0); // Índice del banner que se está visualizando
  
  const currentBanner = BANNERS[currentBannerIdx]; // Datos del banner actual

  // Funciones de navegación entre banners
  const nextBanner = () => setCurrentBannerIdx(prev => (prev + 1) % BANNERS.length);
  const prevBanner = () => setCurrentBannerIdx(prev => (prev - 1 + BANNERS.length) % BANNERS.length);
  
  /**
   * FUNCIÓN: generatePull
   * Calcula de forma aleatoria qué objeto se obtiene en una tirada individual.
   * Probabilidades: 5% Legendario, 20% Raro, 75% Común.
   */
  const generatePull = () => {
      const rand = Math.random() * 100;
      let baseItem;
      if (rand < 5) baseItem = currentBanner.character; // Personaje protagonista del banner
      else if (rand < 25) baseItem = ITEMS.find(i => i.rarity === 4) || ITEMS[0]; // Objeto épico
      else {
          const commons = ITEMS.filter(i => i.rarity === 3); // Objetos comunes
          baseItem = commons[Math.floor(Math.random() * commons.length)];
      }
      
      // Si el objeto es un personaje (rareza 5), se añade permanentemente a la colección del jugador
      if (baseItem.rarity === 5) {
          addCharacter(baseItem);
      }

      // Se devuelve el objeto con una ID única para evitar errores de renderizado en React
      return { ...baseItem, instanceId: `${baseItem.id}_${Date.now()}_${Math.random()}` };
  };

  /**
   * FUNCIÓN: pullGacha
   * Inicia el proceso de invocación tras comprobar si el jugador tiene gemas suficientes.
   */
  const pullGacha = (count) => {
    const cost = count === 1 ? 160 : 1600;
    if (gems < cost) {
        alert("¡No tienes suficientes gemas!");
        return;
    }

    spendGems(cost); // Resta el coste del balance del jugador
    const newRewards = [];
    for (let i = 0; i < count; i++) {
        newRewards.push(generatePull());
    }
    
    // Ordena los resultados para que los mejores aparezcan primero
    newRewards.sort((a, b) => b.rarity - a.rarity);

    // Identifica tiradas legendarias para la cinemática especial
    const legendaries = newRewards.filter(r => r.rarity === 5);
    setLegendaryQueue(legendaries);
    setRewards(newRewards);
    setPhase('wishing'); // Cambia a la fase de animación del meteoro
  };

  // Temporizador para controlar cuánto dura la cinemática del meteoro
  useEffect(() => {
    if (phase === 'wishing') {
        const timer = setTimeout(() => {
            setPhase('result');
        }, 2500); 
        return () => clearTimeout(timer);
    }
  }, [phase]);

  const reset = () => {
    setPhase('idle');
    setRewards([]);
    setLegendaryQueue([]);
  };
  
  // Avanza en la lista de personajes legendarios recién obtenidos
  const nextLegendary = () => {
      setLegendaryQueue(prev => prev.slice(1));
  };

  /**
   * Determina el color del meteoro principal según la rareza más alta de la tirada.
   */
  const getUpdateMeteorColor = () => {
      if (rewards.length === 0) return '#fff';
      const maxRarity = Math.max(...rewards.map(r => r.rarity));
      if (maxRarity === 5) return '#ffd700'; // Dorado (Legendario)
      if (maxRarity === 4) return '#a855f7'; // Púrpura (Épico)
      return '#4488ff'; // Azul (Común)
  };
  
  const revealItem = legendaryQueue[0]; // Personaje que se está revelando en la cinemática

  return (
    <div className="gacha-overlay">
       {phase === 'idle' && (
           <div className="stars-bg-layer" />
       )}

       {/* FASE 1: MENÚ DE BANNERS (IDLE) */}
       <AnimatePresence mode="wait">
         {phase === 'idle' && (
           <motion.div 
             key={currentBanner.id} 
             className="wish-banner pixel-panel"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.3 }}
           >
              {/* Botón para cerrar el sistema de deseos */}
              <button className="close-btn-corner pixel-btn-close" onClick={onBack} style={{ zIndex: 100 }}>
                <X size={24} />
              </button>

              {/* Controles de navegación de banners */}
              <button onClick={prevBanner} className="banner-nav-btn left">
                  <ChevronLeft size={32} />
              </button>
              <button onClick={nextBanner} className="banner-nav-btn right">
                  <ChevronRight size={32} />
              </button>

              {/* Sección visual del personaje protagonista */}
              <div className="banner-art-section">
                 <div className="banner-art-frame">
                     <motion.img 
                       key={currentBanner.character.image}
                       src={currentBanner.character.image} 
                       className="banner-char-img"
                       animate={{ x: [0, -10, 0] }}
                       transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                     />
                 </div>
              </div>

              {/* Panel de información y botones de invocación */}
              <div className="banner-info-section">
                  <div className="banner-attributes">
                      <span className="up-rate-badge pixel-badge">PROBABILIDAD AUMENTADA</span>
                  </div>
                  <h1 className="banner-title pixel-text-title">{currentBanner.title}</h1>
                  <div className="banner-subtitle pixel-text-subtitle" style={{ color: currentBanner.color }}>{currentBanner.subTitle}</div>
                  
                  <div className="wish-controls">
                      <button className="wish-btn pixel-btn" onClick={() => pullGacha(1)}>
                          <span className="wish-btn-label">INVOCAR x1</span>
                          <span className="wish-cost">
                              <img src={gemIcon} className="pixel-gem-icon-sm" alt="Gem" /> 
                              160
                          </span>
                      </button>
                      <button className="wish-btn pixel-btn gold" onClick={() => pullGacha(10)}>
                          <span className="wish-btn-label">INVOCAR x10</span>
                          <span className="wish-cost">
                              <img src={gemIcon} className="pixel-gem-icon-sm" alt="Gem" /> 
                              1600
                          </span>
                      </button>
                  </div>
              </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* FASE 2: ANIMACIÓN DE INVOCACIÓN (METEORO) */}
       {phase === 'wishing' && rewards.length > 0 && (
           <div className="summon-animation-layer">
               {/* Destello inicial de luz blanca */}
               <motion.div 
                   style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 999 }}
                   initial={{ opacity: 1 }}
                   animate={{ opacity: 0 }}
                   transition={{ duration: 0.5 }}
               />

               {/* Estrella fugaz que cruza la pantalla */}
               <motion.div 
                   className="meteor-star"
                   style={{ '--meteor-color': getUpdateMeteorColor() }}
                   initial={{ x: '120vw', y: '-20vh', scale: 0.5, rotate: 15 }}
                   animate={{ x: '-20vw', y: '120vh', scale: [1, 2, 0], rotate: 45 }}
                   transition={{ duration: 2.0, ease: "easeInOut" }}
               >
                   <div className="meteor-trail" />
               </motion.div>
               
               {/* Rastro de partículas para tiradas múltiples */}
                {rewards.length > 1 && [...Array(15)].map((_, i) => (
                    <motion.div 
                        key={i}
                        className="meteor-star"
                        style={{ 
                            '--meteor-color': i % 2 === 0 ? '#4488ff' : '#fff', 
                            width: Math.random() * 10 + 5, 
                            height: Math.random() * 10 + 5,
                            borderRadius: 0 
                        }}
                        initial={{ x: '120vw', y: '-20vh', opacity: 0 }}
                        animate={{ 
                            x: '-25vw', 
                            y: '125vh', 
                            opacity: [0, 1, 0],
                            rotate: Math.random() * 360
                        }}
                        transition={{ 
                            duration: 2.0 + Math.random() * 0.5, 
                            delay: Math.random() * 0.5, 
                            ease: "easeInOut" 
                        }}
                    />
                ))}
               
                {/* Flash final de impacto antes de revelar los resultados */}
               <motion.div 
                  style={{ position: 'absolute', inset: 0, background: '#fff' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1] }}
                  transition={{ delay: 1.8, duration: 0.2 }}
               />
           </div>
       )}

       {/* FASE 3: REVELACIÓN DE RESULTADOS */}
       {phase === 'result' && rewards.length > 0 && (
           <>
              {/* ESCENA DE REVELACIÓN LEGENDARIA (Si hay personajes 5 estrellas) */}
              {legendaryQueue.length > 0 ? (
                  <div key={revealItem.instanceId} className="legendary-reveal-overlay" onClick={nextLegendary}>
                      <div className="legendary-rays" />
                      <div className="legendary-burst" />
                      
                      <div className="legendary-char-container">
                          <img src={revealItem.image} className="legendary-char-img" />
                          <div className="legendary-title">{revealItem.name}</div>
                          <div className="legendary-stars">
                               {[...Array(5)].map((_, i) => (
                                   <Star key={i} size={40} fill="#ffd700" color="#ffd700" />
                               ))}
                          </div>
                      </div>
                  </div>
              ) : (
                  // MOSTRAR TODOS LOS RESULTADOS (Cuadrícula o tarjeta individual)
                   <div className="gacha-result-scene" onClick={reset} style={{ overflowY: 'auto', alignItems: rewards.length > 1 ? 'flex-start' : 'center', paddingTop: rewards.length > 1 ? 40 : 0 }}>
                       <div className="stars-bg-layer" style={{ position: 'fixed' }} />
                       
                       {rewards.length === 1 ? (
                            // RESULTADO INDIVIDUAL
                            <motion.div 
                                className="result-card-container"
                                initial={{ scale: 0, opacity: 0, rotateY: 90 }}
                                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                                transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                            >
                                <img 
                                    src={rewards[0].image} 
                                    className={`result-art-full frame-${rewards[0].rarity}`} 
                                />
                                
                                <div className="result-meta">
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, gap: 5 }}>
                                        {[...Array(rewards[0].rarity)].map((_, i) => (
                                            <Star key={i} size={20} fill="#ffd700" color="#ffd700" />
                                        ))}
                                    </div>
                                    <h2 style={{ fontSize: '1.2rem', marginBottom: 5 }}>{rewards[0].name}</h2>
                                    <p style={{ fontSize: '0.7rem', color: '#ccc' }}>{rewards[0].desc}</p>
                                    <p style={{ fontSize: '0.6rem', marginTop: 15, opacity: 0.5 }}>Toca en cualquier lugar para cerrar</p>
                                </div>
                            </motion.div>
                       ) : (
                           // CUADRÍCULA DE 10 INVOCACIONES
                           <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(5, 1fr)', 
                                gap: '20px', 
                                maxWidth: '1000px', 
                                margin: 'auto', 
                                zIndex: 850,
                                paddingBottom: 40
                            }}>
                               {rewards.map((item, idx) => (
                                   <motion.div 
                                        key={idx}
                                        className={`result-card-mini frame-${item.rarity}`}
                                        style={{ 
                                            width: '100%', 
                                            aspectRatio: '3/5', 
                                            background: '#1a1a1a', 
                                            position: 'relative',
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: 10,
                                            borderRadius: 4
                                        }}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                   >
                                        <img src={item.image} style={{ width: '80%', flex: 1, objectFit: 'contain' }} />
                                        <div style={{ fontSize: '0.6rem', color: '#fff', textAlign: 'center', marginTop: 5 }}>{item.name}</div>
                                        <div style={{ display: 'flex', marginTop: 5 }}>
                                            {[...Array(item.rarity)].map((_, i) => (
                                                <Star key={i} size={8} fill="#ffd700" color="#ffd700" />
                                            ))}
                                        </div>
                                   </motion.div>
                               ))}
                           </div>
                       )}
                   </div>
              )}
           </>
       )}
    </div>
  );
};
export default GachaSystem;
