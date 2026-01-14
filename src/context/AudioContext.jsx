import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

/**
 * CONTEXTO DE AUDIO: Gestión centralizada de música y efectos de sonido (SFX).
 * Permite que cualquier componente del juego reproduzca sonidos sin preocuparse por la configuración.
 */
const AudioContext = createContext();

// Hook personalizado para acceder fácilmente al contexto de audio
export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  // CONFIGURACIÓN INICIAL: Volúmenes por defecto y estado de silencio
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  // REFERENCIA: Mantiene el objeto Audio de la música actual para poder ajustarlo en tiempo real
  const musicRef = useRef(null);

  /**
   * FUNCIÓN: playMusic
   * Reproduce una pista de música de fondo.
   * - No reinicia la canción si ya se está reproduciendo.
   * - Pausa y limpia la canción anterior si se cambia de pista.
   */
  const playMusic = async (src, loop = true) => {
    try {
      // Evita reiniciar si es la misma canción que ya está sonando
      if (musicRef.current && musicRef.current.src.includes(src.split('/').pop())) {
        return;
      }

      // Detiene la música anterior de forma segura
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
      
      // Crea un nuevo objeto de audio
      const audio = new Audio(src);
      audio.loop = loop;
      audio.volume = isMuted ? 0 : musicVolume;
      musicRef.current = audio;
      
      try {
        await audio.play();
      } catch (e) {
        // Ignora errores por interrupciones rápidas (muy comunes al navegar menús)
        if (e.name !== 'AbortError') {
            console.warn("Reproducción de audio bloqueada por el navegador:", e);
        }
      }
    } catch (err) {
      console.warn("Error en el contexto de audio:", err);
    }
  };

  /**
   * FUNCIÓN: stopMusic
   * Detiene inmediatamente cualquier música de fondo que se esté reproduciendo.
   */
  const stopMusic = () => {
    if (musicRef.current) {
      try {
        musicRef.current.pause();
      } catch (e) {
        // Silencioso si ya está pausado
      }
      musicRef.current = null;
    }
  };

  /**
   * FUNCIÓN: playSfx
   * Reproduce un efecto de sonido corto (disparo, clic, impacto).
   * No interfiere con la música de fondo.
   */
  const playSfx = (src) => {
    const audio = new Audio(src);
    audio.volume = isMuted ? 0 : sfxVolume;
    audio.play().catch(e => console.warn("SFX bloqueado:", e));
  };

  /**
   * EFECTO: Sincronización de Volumen
   * Actualiza el volumen de la música activa automáticamente cuando el usuario mueve los controles de ajustes.
   */
  useEffect(() => {
    if (musicRef.current) {
        musicRef.current.volume = isMuted ? 0 : musicVolume;
    }
  }, [musicVolume, isMuted]);

  // Valores expuestos a través del contexto
  const value = {
    musicVolume,
    setMusicVolume,
    sfxVolume,
    setSfxVolume,
    isMuted,
    setIsMuted,
    playMusic,
    stopMusic,
    playSfx
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
