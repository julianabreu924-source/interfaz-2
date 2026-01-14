import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Control de animaciones
import { X, ShoppingBag, CreditCard, Gem, Shield, Crown, Sword, Scroll, Ghost, Sparkles, FlaskConical, Anvil, Coins, Hammer } from 'lucide-react'; // Iconos de la interfaz
import gemIcon from '../assets/images/ui/gem_icon.png'; // Icono de la gema básico
import '../index.css';

/**
 * DATOS SIMULADOS DE LA TIENDA
 * Aquí definimos todos los paquetes de gemas, ofertas especiales, pociones y materiales.
 */

// Paquetes de gemas (Monedas premium del juego)
const GEM_PACKS = [
    { id: 1, amount: 60, bonus: 0, price: 'US$0.99', desc: 'Puñado de Cristales' },
    { id: 2, amount: 300, bonus: 30, price: 'US$4.99', desc: 'Bolsa de Cristales' },
    { id: 3, amount: 980, bonus: 110, price: 'US$14.99', desc: 'Saco de Cristales', popular: true },
    { id: 4, amount: 1980, bonus: 260, price: 'US$29.99', desc: 'Caja de Cristales' },
    { id: 5, amount: 3280, bonus: 600, price: 'US$49.99', desc: 'Cofre de Cristales' },
    { id: 6, amount: 6480, bonus: 1600, price: 'US$99.99', desc: 'Cámara de Cristales' },
    { id: 7, amount: 12800, bonus: 3500, price: 'US$199.99', desc: 'Tesoro de Dragón' },
    { id: 8, amount: 32000, bonus: 10000, price: 'US$499.99', desc: 'Montaña Divina' },
    { id: 9, amount: 64800, bonus: 25000, price: 'US$999.99', desc: 'Bóveda Celestial' },
];

// Packs combinados con objetos y gemas
const BUNDLES = [
    { id: 'b1', name: 'Pack Iniciado', price: 'US$4.99', icon: <Shield size={40} color="#fff" />, items: ['10x Sombrero Mago', '500 Gemas', 'Espada Rústica'] },
    { id: 'b2', name: 'Suministro Legendario', price: 'US$19.99', icon: <Crown size={40} color="#ffd700" />, items: ['1x Héroe 4★', '2000 Gemas', 'Pergaminos XP'] },
    { id: 'b3', name: 'Arsenal de Guerra', price: 'US$9.99', icon: <Sword size={40} color="#ff4444" />, items: ['Espada de Fuego', '1000 Gemas', 'Poción de Fuerza'] },
    { id: 'b4', name: 'Sabiduría Antigua', price: 'US$14.99', icon: <Scroll size={40} color="#44ff44" />, items: ['5x Grimorios', '1500 Gemas', 'Vara de Roble'] },
    { id: 'b5', name: 'Pacto Espectral', price: 'US$29.99', icon: <Ghost size={40} color="#aa00ff" />, items: ['Héroe: Nigromante', '3000 Gemas', 'Amuleto Oscuro'] },
    { id: 'b6', name: 'Bendición Astral', price: 'US$39.99', icon: <Sparkles size={40} color="#00ffff" />, items: ['Héroe: Invocador Astral', '5000 Gemas', 'Cristal Estelar'] },
];

// Consumibles (Pociones)
const POTIONS = [
    { id: 'p1', name: 'Poción de Vida', price: '100 Gemas', icon: <FlaskConical size={32} color="#ff4444" />, desc: 'Restaura 500 HP' },
    { id: 'p2', name: 'Poción de Maná', price: '100 Gemas', icon: <FlaskConical size={32} color="#4444ff" />, desc: 'Restaura 200 MP' },
    { id: 'p3', name: 'Elixir de Fuerza', price: '250 Gemas', icon: <Sword size={32} color="#ffaa00" />, desc: '+20 ATK por 10min' },
    { id: 'p4', name: 'Tónico de Velocidad', price: '250 Gemas', icon: <Sparkles size={32} color="#00ffaa" />, desc: '+15% VEL por 10min' },
    { id: 'p5', name: 'Elixir de Defensa', price: '300 Gemas', icon: <Shield size={32} color="#4488ff" />, desc: '+50 DEF por 5min' },
    { id: 'p6', name: 'Poción de Invisibilidad', price: '500 Gemas', icon: <Ghost size={32} color="#cccccc" />, desc: 'Invisible por 30s' },
];

// Materiales de artesanía y mejora
const MATERIALS = [
    { id: 'm1', name: 'Polvo Arcano', price: '50 Gemas', icon: <Sparkles size={32} color="#aa00ff" />, desc: 'Usado para encantamientos' },
    { id: 'm2', name: 'Hierro Estelar', price: '150 Gemas', icon: <Anvil size={32} color="#888" />, desc: 'Metal forjado en estrellas' },
    { id: 'm3', name: 'Esencia de Fuego', price: '300 Gemas', icon: <Hammer size={32} color="#ff4400" />, desc: 'Material de ascensión raro' },
    { id: 'm4', name: 'Cristal de Vacío', price: '500 Gemas', icon: <Gem size={32} color="#000" />, desc: 'Energía concentrada' },
    { id: 'm5', name: 'Escama de Dragón', price: '1000 Gemas', icon: <Shield size={32} color="#d32f2f" />, desc: 'Piel impenetrable' },
    { id: 'm6', name: 'Pluma de Fénix', price: '1200 Gemas', icon: <Crown size={32} color="#ff6d00" />, desc: 'Renacimiento eterno' },
];


import { BANNERS, ITEMS } from '../config/gameData';
import { useGameStore } from '../store/useGameStore'; // Repositorio global de estado del juego

/**
 * Componente Principal ShopSystem
 * Interfaz de la tienda donde el jugador puede adquirir gemas y objetos.
 */
const ShopSystem = ({ onBack }) => {
  // Conexión con el almacén global (Zustand) para gestionar las gemas
  const { gems, addGems, spendGems } = useGameStore(); 
  // Estado para controlar qué sección de la tienda se está visualizando
  const [activeTab, setActiveTab] = useState('gems'); // Opciones: gems, bundles, potions, materials

  return (
    <div className="shop-overlay">
        {/* Cabecera de estilo medieval */}
        <div className="shop-header">
            <div className="shop-title-group">
                <ShoppingBag size={28} className="shop-icon-gold" />
                <h1>MERCADO MÍSTICO</h1>
            </div>
            
            <div className="shop-header-controls">
                {/* Visualización de la moneda actual del jugador */}
                <div className="shop-currency-display">
                    <img src={gemIcon} className="pixel-crystal-icon-sm" alt="Gem" />
                    <span>{gems.toLocaleString()}</span>
                    {/* Botón rápido para ir a la sección de recarga de gemas */}
                    <button className="shop-add-btn" onClick={() => setActiveTab('gems')}>+</button>
                </div>

                {/* Botón para cerrar la tienda y volver al menú anterior */}
                <button className="shop-close-btn" onClick={onBack}>
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Estructura principal de la tienda */}
        <div className="shop-layout">
            {/* Barra lateral con pestañas de categorías */}
            <div className="shop-sidebar">
                <button 
                   onClick={() => setActiveTab('gems')}
                   className={`shop-sidebar-btn ${activeTab === 'gems' ? 'active' : ''}`}
                >
                    <Gem size={20} />
                    GEMAS
                </button>
                <button 
                   onClick={() => setActiveTab('bundles')}
                   className={`shop-sidebar-btn ${activeTab === 'bundles' ? 'active' : ''}`}
                >
                    <Crown size={20} />
                    OFERTAS
                </button>
                <button 
                   onClick={() => setActiveTab('potions')}
                   className={`shop-sidebar-btn ${activeTab === 'potions' ? 'active' : ''}`}
                >
                    <FlaskConical size={20} />
                    POCIONES
                </button>
                <button 
                   onClick={() => setActiveTab('materials')}
                   className={`shop-sidebar-btn ${activeTab === 'materials' ? 'active' : ''}`}
                >
                    <Anvil size={20} />
                    MATERIALES
                </button>
            </div>

            {/* Área central donde se muestran los productos */}
            <div className="shop-content-area">
                <div className="shop-scroll-decor-top" />
                <AnimatePresence mode="wait">
                    
                    {/* SECCIÓN DE GEMAS: Muestra los paquetes de recarga */}
                    {activeTab === 'gems' && (
                        <motion.div 
                            key="gems"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                            className="shop-grid"
                        >
                            {GEM_PACKS.map(pack => {
                                let visualContent;
                                
                                // Lógica visual para mostrar más o menos gemas según el tamaño del paquete
                                if (pack.amount < 300) {
                                    // Una gema grande
                                    visualContent = (
                                        <div className="gem-visual-container">
                                            <div className="gem-glow-bg" />
                                            <img src={gemIcon} className="gem-icon-xl" alt="Gem" />
                                        </div>
                                    );
                                } else if (pack.amount < 1000) {
                                    // Pequeña pila (3 gemas)
                                    visualContent = (
                                        <div className="gem-visual-container">
                                            <div className="gem-glow-bg" />
                                            <img src={gemIcon} className="gem-icon-lg" style={{ left: '50%', top: '40%', transform: 'translate(-50%, -50%)' }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-md" style={{ left: '30%', bottom: '15%' }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-md" style={{ right: '30%', bottom: '15%', filter: 'hue-rotate(-10deg)' }} alt="Gem" />
                                        </div>
                                    );
                                } else if (pack.amount < 5000) {
                                    // Pila mediana (5 gemas)
                                    visualContent = (
                                        <div className="gem-visual-container">
                                            <div className="gem-glow-bg" />
                                            <img src={gemIcon} className="gem-icon-lg" style={{ left: '50%', top: '35%', transform: 'translate(-50%, -50%)', zIndex: 2 }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-md" style={{ left: '20%', bottom: '20%', zIndex: 1 }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-md" style={{ right: '20%', bottom: '20%', zIndex: 1 }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-sm" style={{ left: '40%', bottom: '5%', zIndex: 3 }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-sm" style={{ right: '40%', bottom: '5%', zIndex: 3 }} alt="Gem" />
                                        </div>
                                    );
                                } else {
                                    // Montaña gigante de gemas
                                    visualContent = (
                                        <div className="gem-visual-container">
                                            <div className="gem-glow-bg" />
                                            <img src={gemIcon} className="gem-icon-lg" style={{ left: '50%', top: '20%', transform: 'translate(-50%, -50%)', zIndex: 1 }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-md" style={{ left: '25%', top: '40%', zIndex: 2 }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-md" style={{ right: '25%', top: '40%', zIndex: 2 }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-md" style={{ left: '10%', bottom: '20%', zIndex: 3 }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-md" style={{ right: '10%', bottom: '20%', zIndex: 3 }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-sm" style={{ left: '35%', bottom: '10%', zIndex: 4 }} alt="Gem" />
                                            <img src={gemIcon} className="gem-icon-sm" style={{ right: '35%', bottom: '10%', zIndex: 4 }} alt="Gem" />
                                        </div>
                                    );
                                }

                                return (
                                    <div key={pack.id} className="shop-card-medieval" style={pack.amount >= 6480 ? { border: '2px solid #ffd700', boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)' } : {}}>
                                        {/* Etiquetas especiales (Popular / Mejor Valor) */}
                                        <div className="shop-badge-spacer" style={{ minHeight: '60px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '4px' }}>
                                            {pack.popular && (
                                                <div className="shop-ribbon">POPULAR</div>
                                            )}
                                            {pack.amount >= 6480 && !pack.popular && (
                                                 <div className="shop-ribbon gold">MEJOR VALOR</div>
                                            )}
                                            
                                            {pack.bonus > 0 && (
                                                <div className="shop-bonus-badge">
                                                    +{pack.bonus} EXTRA
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Marco que contiene las gemas visuales */}
                                        <div className="shop-item-frame">
                                            {visualContent}
                                        </div>
                                        
                                        <h3 className="shop-item-amount">{pack.amount.toLocaleString()}</h3>
                                        <p className="shop-item-desc">{pack.desc}</p>
                                        
                                        {/* Botón de compra (Precio en dinero real ficticio) */}
                                        <button 
                                            className={`shop-buy-btn ${pack.amount >= 6480 ? 'gold' : ''}`}
                                            onClick={() => {
                                                alert(`Simulando compra de ${pack.amount} gemas...`);
                                                addGems(pack.amount + pack.bonus); // Añade las gemas al balance del jugador
                                            }}
                                        >
                                            {pack.price}
                                        </button>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                    
                    {/* SECCIÓN DE OFERTAS (BUNDLES): Muestra paquetes combinados */}
                    {activeTab === 'bundles' && (
                        <motion.div 
                            key="bundles"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                            className="shop-grid-wide"
                        >
                            {BUNDLES.map(bundle => (
                                <div key={bundle.id} className="shop-card-medieval wide">
                                    <div className="bundle-header">
                                        <div className="bundle-icon-frame">
                                            {bundle.icon}
                                        </div>
                                        <div className="bundle-info">
                                            <h3>{bundle.name}</h3>
                                            <span className="limited-tag">¡LÍMITADO!</span>
                                        </div>
                                    </div>
                                    
                                    {/* Lista de objetos incluidos en el paquete */}
                                    <div className="bundle-contents">
                                        {bundle.items.map((item, i) => (
                                            <div key={i} className="bundle-item-row">
                                                <div className="bullet-point" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>

                                    <button className="shop-buy-btn gold">
                                        {bundle.price}
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* SECCIÓN DE POCIONES: Objetos comprables con gemas del juego */}
                    {activeTab === 'potions' && (
                        <motion.div 
                            key="potions"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                            className="shop-grid"
                        >
                            {POTIONS.map(item => (
                                <div key={item.id} className="shop-card-medieval">
                                    <div className="shop-item-frame">
                                        <div className="shop-gem-visual">
                                            {item.icon}
                                        </div>
                                    </div>
                                    
                                    <h3 className="shop-item-amount" style={{ fontSize: '1rem' }}>{item.name}</h3>
                                    <p className="shop-item-desc">{item.desc}</p>
                                    
                                    {/* Botón de compra con gemas */}
                                    <button 
                                        className="shop-buy-btn"
                                        onClick={() => {
                                            const price = parseInt(item.price.replace(' Gemas', ''));
                                            if (gems >= price) {
                                                spendGems(price); // Resta las gemas del balance
                                                alert(`¡Compraste ${item.name}!`);
                                            } else {
                                                alert("¡No tienes suficientes gemas!");
                                            }
                                        }}
                                    >
                                        {item.price}
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* SECCIÓN DE MATERIALES: Recursos para mejorar equipo */}
                    {activeTab === 'materials' && (
                        <motion.div 
                            key="materials"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                            className="shop-grid"
                        >
                             {MATERIALS.map(item => (
                                <div key={item.id} className="shop-card-medieval">
                                    <div className="shop-item-frame">
                                        <div className="shop-gem-visual">
                                            {item.icon}
                                        </div>
                                    </div>
                                    
                                    <h3 className="shop-item-amount" style={{ fontSize: '1rem' }}>{item.name}</h3>
                                    <p className="shop-item-desc">{item.desc}</p>
                                    
                                    <button 
                                        className="shop-buy-btn"
                                        onClick={() => {
                                            const price = parseInt(item.price.replace(' Gemas', ''));
                                            if (gems >= price) {
                                                spendGems(price);
                                                alert(`¡Compraste ${item.name}!`);
                                            } else {
                                                alert("¡No tienes suficientes gemas!");
                                            }
                                        }}
                                    >
                                        {item.price}
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </div>
  );
};

export default ShopSystem;
