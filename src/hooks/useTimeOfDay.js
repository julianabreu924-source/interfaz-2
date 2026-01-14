import { useState, useEffect } from 'react';

// IMPORTACIÓN DE RECURSOS VISUALES
// Estas imágenes representan el fondo del lobby según el momento del día.
import diaImg from '../assets/images/environment/dia.jpeg';
import tardeImg from '../assets/images/environment/tarde.jpeg';
import nocheImg from '../assets/images/environment/noche.jpeg';

/**
 * HOOK PERSONALIZADO: useTimeOfDay
 * Determina qué imagen de fondo y qué "tipo de luz" se debe aplicar a la interfaz
 * basándose en la hora local ajustada (UTC-4).
 */
export const useTimeOfDay = () => {
    // ESTADO INICIAL: Por defecto se asume que es de día
    const [timeState, setTimeState] = useState({
        bg: diaImg,
        type: 'day' // Posibles valores: 'day', 'afternoon', 'night'
    });

    useEffect(() => {
        /**
         * LÓGICA DE ACTUALIZACIÓN DEL FONDO
         * Obtiene la hora actual, la ajusta a la zona horaria del usuario y cambia el estado.
         */
        const updateBackground = () => {
            const now = new Date();
            const utcHour = now.getUTCHours();
            
            // Ajuste manual a UTC-4 (Hora Estándar del Atlántico)
            let hour = utcHour - 4;
            
            // Si la hora es negativa (antes de la medianoche UTC), se corrige para el ciclo de 24h
            if (hour < 0) hour += 24;

            let newBg;
            let type;

            // DEFINICIÓN DE FRANJAS HORARIAS
            if (hour >= 7 && hour < 17) {
                // DÍA: De 7 AM a 5 PM - Luz clara y brillante
                newBg = diaImg;
                type = 'day';
            } else if (hour >= 17 && hour < 19) {
                // TARDE/ATARDECER: De 5 PM a 7 PM - Tonos anaranjados y cálidos
                newBg = tardeImg;
                type = 'afternoon';
            } else {
                // NOCHE: De 7 PM a 7 AM - Tonos púrpuras y oscuros
                newBg = nocheImg;
                type = 'night';
            }

            // Actualiza el estado solo si hay un cambio para evitar renderizados innecesarios
            setTimeState({ bg: newBg, type });
        };

        // Ejecuta la comprobación al cargar el hook
        updateBackground();

        // Configura un intervalo para revisar la hora cada minuto (60,000 ms)
        // Esto permite que el fondo cambie automáticamente si el jugador deja el juego abierto.
        const interval = setInterval(updateBackground, 60000); 

        // Limpieza del intervalo al desmontar el componente para evitar fugas de memoria
        return () => clearInterval(interval);
    }, []);

    // Devuelve el objeto con la imagen y el tipo para ser usado en los componentes
    return timeState;
};
