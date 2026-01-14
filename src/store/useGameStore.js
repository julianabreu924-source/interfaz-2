import { create } from 'zustand'; // Zustand es una librería ligera para manejar el estado global

/**
 * STORE GLOBAL: useGameStore
 * Centraliza toda la información persistente y el estado del flujo del juego.
 * Permite que cualquier componente acceda o modifique gemas, personajes y pantallas.
 */
export const useGameStore = create((set) => ({
  
  // --- ESTADO DEL JUEGO (Pantalla actual) ---
  // Posibles valores: 'loading', 'menu', 'lobby', 'gacha', 'shop', 'mode_selection', 'story_intro'
  gameState: 'loading', 
  setGameState: (state) => set({ gameState: state }),

  // --- RECURSOS DEL JUGADOR (Monedas) ---
  gems: 5000, // Cantidad inicial para pruebas
  // Incrementa el balance de gemas (ej. tras una compra)
  addGems: (amount) => set((state) => ({ gems: state.gems + amount })),
  // Resta gemas asegurándose de que nunca sean menores a 0
  spendGems: (amount) => set((state) => ({ gems: Math.max(0, state.gems - amount) })),

  // --- COLECCIÓN DE PERSONAJES ---
  ownedCharacters: [], // Lista de IDs de personajes que el jugador ya posee
  // Añade un nuevo personaje a la colección (usado en el sistema Gacha)
  addCharacter: (char) => set((state) => ({ 
    ownedCharacters: [...state.ownedCharacters, char] 
  })),

  // --- ESTADO DE LA INTERFAZ (UI) ---
  showSettings: false, // Controla si el modal de ajustes está abierto o cerrado
  setShowSettings: (show) => set({ showSettings: show }),

}));
