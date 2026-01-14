import React from 'react';
import { motion } from 'framer-motion';
import { X, Volume2, VolumeX, Music, Download } from 'lucide-react'; // Iconos de Lucide
import { useAudio } from '../context/AudioContext'; // Acceso al control de audio global
import '../styles/global.css'; 

/**
 * COMPONENTE: SettingsModal
 * Ventana emergente que permite al usuario ajustar el sonido, la música y descargar la aplicación.
 */
const SettingsModal = ({ onClose, onInstall, canInstall }) => {
  // Extrae funciones y estados del contexto de audio
  const { 
    musicVolume, setMusicVolume, 
    sfxVolume, setSfxVolume, 
    isMuted, setIsMuted 
  } = useAudio();

  return (
    <div className="settings-overlay">
      {/* Contenedor animado del modal */}
      <motion.div 
        className="settings-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Cabecera del modal con el título y botón de cierre */}
        <div className="settings-header">
          <h2>CONFIGURACIÓN</h2>
          <button className="pixel-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          {/* INTERRUPTOR DE SILENCIO (Mute) */}
          <div className="settings-row">
            <label>Sonido General</label>
            <button 
              className={`pixel-toggle-btn ${isMuted ? 'muted' : ''}`} 
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              <span>{isMuted ? 'OFF' : 'ON'}</span>
            </button>
          </div>

          {/* CONTROL DE VOLUMEN DE MÚSICA */}
          <div className="settings-row">
            <div className="label-group">
                <Music size={16} />
                <label>Música</label>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={musicVolume} 
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="pixel-slider"
              disabled={isMuted} // Deshabilitado si el sonido está en silencio
            />
            <span className="volume-value">{Math.round(musicVolume * 100)}%</span>
          </div>

          {/* CONTROL DE VOLUMEN DE EFECTOS (SFX) */}
          <div className="settings-row">
            <div className="label-group">
                <Volume2 size={16} />
                <label>Efectos</label>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={sfxVolume} 
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="pixel-slider"
              disabled={isMuted}
            />
            <span className="volume-value">{Math.round(sfxVolume * 100)}%</span>
          </div>

          {/* BOTÓN DE INSTALACIÓN PWA (Solo aparece si el navegador es compatible) */}
          {canInstall && (
            <div className="settings-row install-row">
              <label>App de Escritorio</label>
              <button className="pixel-install-btn" onClick={onInstall}>
                <Download size={20} />
                <span>INSTALAR JUEGO</span>
              </button>
            </div>
          )}
        </div>

        {/* Pie de página con información de la versión */}
        <div className="settings-footer">
            <p className="version-text">Version 0.3.5 (Alpha)</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
