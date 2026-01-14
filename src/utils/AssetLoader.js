/**
 * UTILIDAD: AssetLoader
 * Conjunto de funciones para descargar y cachear imágenes y sonidos antes de que el jugador
 * empiece la partida, evitando "parpadeos" o sonidos que no suenan al primer clic.
 */

/**
 * Función para precargar imágenes.
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    // Se resuelve cuando el navegador confirma que la imagen se descargó por completo
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Error al cargar la imagen: ${url}`));
  });
};

/**
 * Función para precargar archivos de audio (MP3/WAV).
 * Utiliza un método de "blob" para asegurar que el archivo esté en memoria.
 */
export const preloadAudio = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.preload = 'auto';
        // Se resuelve cuando el audio está listo para reproducirse sin interrupciones
        audio.oncanplaythrough = () => resolve(url);
        audio.oncanplay = () => resolve(url);
        audio.onerror = () => reject(new Error(`Error en el objeto de audio: ${url}`));
        
        audio.src = objectUrl;
        
        // Temporizador de seguridad: Si tarda demasiado, continúa de todos modos
        setTimeout(() => resolve(url), 2000);
    });
  } catch (err) {
    // Método alternativo si el servidor bloquea la petición fetch (CORS)
    console.warn(`La descarga de audio falló para ${url}, intentando carga directa...`);
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.src = url;
        audio.oncanplaythrough = () => resolve(url);
        audio.oncanplay = () => resolve(url);
        audio.onerror = () => reject(new Error(`Fallo al cargar audio tras reintento: ${url}`));
        setTimeout(() => resolve(url), 2000);
    });
  }
};

/**
 * FUNCIÓN COORDINADORA: preloadAssets
 * Recorre una lista de archivos y reporta el progreso (%) a la interfaz de carga.
 */
export const preloadAssets = async (assets, onProgress) => {
  const total = assets.length;
  let loaded = 0;

  // Procesa los archivos uno por uno para que la barra de progreso se mueva de forma fluida.
  for (const asset of assets) {
    try {
      if (asset.type === 'image') {
        await preloadImage(asset.url);
      } else if (asset.type === 'audio') {
        await preloadAudio(asset.url);
      }
    } catch (error) {
      console.warn(error.message);
    }
    
    loaded++;
    // Reporta el porcentaje actual de carga (ej. 25, 50, 75...)
    if (onProgress) onProgress((loaded / total) * 100);
    
    // Pequeño retraso artificial (120ms) para que el movimiento de la barra sea perceptible y agradable.
    await new Promise(r => setTimeout(r, 120));
  }
};
