import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Control de animaciones y transiciones
import { useAudio } from '../context/AudioContext'; // Contexto de audio centralizado
import gameModesMusic from '../assets/audio/music/modos de juego.mp3'; // Música ambiental para la intro
import '../styles/StoryIntro.css'; // Estilos visuales de la introducción

/**
 * COMPONENTE: StoryIntro
 * Muestra el prólogo de la historia con un efecto de máquina de escribir pixel art.
 */
const StoryIntro = ({ onComplete }) => {
    const { playMusic, playSfx } = useAudio();
    const [step, setStep] = useState(0); // Controla el estado inicial de carga de la intro
    const [phase, setPhase] = useState(0); // Controla el párrafo actual que se muestra

    // Párrafos de la introducción
    const phases = [
        "EN UN MUNDO DE MAGIA Y CAOS,",
        "DONDE LOS ANTIGUOS HECHIZOS HAN DEJADO CICATRICES EN LA TIERRA Y EL EQUILIBRIO PENDE DE UN HILO,",
        "UN DESTINO OLVIDADO DESPIERTA PARA DESAFIAR A LA OSCURIDAD QUE AVANZA."
    ];

    // Efecto para iniciar la música y activar la intro tras un breve retraso
    useEffect(() => {
        playMusic(gameModesMusic, true);
        const timer = setTimeout(() => setStep(1), 500);
        return () => clearTimeout(timer);
    }, [playMusic]);

    /**
     * Avanza al siguiente párrafo o termina la intro al llegar al final.
     */
    const handleNext = () => {
        if (phase < phases.length - 1) {
            setPhase(prev => prev + 1);
        } else {
            onComplete(); // Llama a la función que cierra la intro (ir al lobby)
        }
    };

    return (
        <div className="story-intro-overlay" onClick={handleNext}>
            {/* AnimatePresence permite animar la salida de los elementos al cambiar de fase */}
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        key={phase}
                        className="intro-content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* EFECTO DE MÁQUINA DE ESCRIBIR: Descompone el texto en palabras y letras */}
                        <motion.h1 className="story-text-pixel">
                            {phases[phase].split(" ").map((word, wordIndex) => (
                                <span key={`word-${wordIndex}`} className="word-wrapper">
                                    {word.split("").map((char, charIndex) => (
                                        <motion.span
                                            key={`${phase}-${wordIndex}-${charIndex}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ 
                                                // Retraso escalonado para que las letras aparezcan una por una
                                                delay: (wordIndex * 0.1) + (charIndex * 0.02), 
                                                duration: 0.01
                                            }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                    {/* Espacio entre palabras utilizando una entidad HTML para que no se colapse */}
                                    <span className="space">&nbsp;</span>
                                </span>
                            ))}
                        </motion.h1>
                        
                        {/* Mensaje de navegación que aparece al terminar de escribir el párrafo */}
                        <motion.div 
                            className="tap-to-continue"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ delay: phases[phase].length * 0.04 + 1 }}
                        >
                            {phase === phases.length - 1 ? "TOCA PARA COMENZAR LA AVENTURA" : "TOCA PARA CONTINUAR"}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PARTÍCULAS DE AMBIENTE: Genera luces flotantes aleatorias en el fondo */}
            <div className="intro-particles">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="intro-particle"
                        initial={{ 
                            x: Math.random() * 100 + "%", 
                            y: Math.random() * 100 + "%",
                            opacity: 0,
                            scale: Math.random() * 2
                        }}
                        animate={{ 
                            y: ["0%", "-20%"], // Movimiento ascendente sutil
                            opacity: [0, 0.4, 0] // Desvanecimiento
                        }}
                        transition={{ 
                            duration: Math.random() * 4 + 3, 
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default StoryIntro;
