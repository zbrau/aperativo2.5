import React, { useState } from 'react';
import { Plus, Clock, Flame, TrendingDown, Heart } from 'lucide-react';
import { MenuItem } from '../types';

interface FoodItemProps {
    item: MenuItem;
    onAdd: (item: MenuItem, variety?: string) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (itemId: string) => void;
}

const FoodItem: React.FC<FoodItemProps> = ({ item, onAdd, isFavorite = false, onToggleFavorite }) => {
    const [heartPulse, setHeartPulse] = useState(false);
    const [showVarieties, setShowVarieties] = useState(false);

    // Simulación: El precio en la cafetería física es 5 UC más caro
    const storePrice = item.price + 5;

    const handleAddItem = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (item.varieties && item.varieties.length > 0) {
            setShowVarieties(true);
        } else {
            onAdd(item);
        }
    };

    const handleToggleFav = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (onToggleFavorite) {
            setHeartPulse(true);
            setTimeout(() => setHeartPulse(false), 300);
            onToggleFavorite(item.id);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-fade-in">
            {/* Sección de Imagen */}
            <div className="relative h-32 sm:h-40 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                
                {/* Badges / Etiquetas */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {item.isPopular && (
                        <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10 w-fit">
                            <Flame size={10} className="fill-current" />
                            <span>POPULAR</span>
                        </div>
                    )}
                    <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10 w-fit">
                        <TrendingDown size={10} />
                        <span>AHORRA 5 UC</span>
                    </div>
                </div>

                {/* Heart / Favorite Button */}
                {onToggleFavorite && (
                    <button
                        onClick={handleToggleFav}
                        className={`absolute top-2 right-2 p-1.5 rounded-full z-10 transition-all shadow-sm ${
                            isFavorite
                                ? 'bg-red-500 text-white'
                                : 'bg-white/80 dark:bg-gray-900/80 text-gray-400 hover:text-red-500 backdrop-blur-sm'
                        } ${heartPulse ? 'animate-heart' : ''}`}
                    >
                        <Heart size={14} className={isFavorite ? 'fill-current' : ''} />
                    </button>
                )}
                
                <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 shadow-sm z-10">
                    <Clock size={10} />
                    <span>{item.prepTime} min</span>
                </div>
            </div>
            
            {/* Sección de Contenido */}
            <div className="p-3 flex flex-col flex-1 justify-between">
                <div className="mb-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-gray-800 dark:text-white text-sm leading-tight line-clamp-2">
                            {item.name}
                        </h3>
                    </div>
                    
                    {/* Precios Comparativos */}
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs text-gray-400 line-through decoration-red-400 decoration-2">
                            {storePrice} UC
                        </span>
                        <span className="font-bold text-base text-green-700 dark:text-green-400">
                            {item.price} UC
                        </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {item.description}
                    </p>
                </div>
                
                {showVarieties ? (
                    <div className="flex flex-col gap-2 animate-fade-in mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Selecciona de qué lo quieres:</div>
                        <div className="flex flex-wrap gap-1.5">
                            {item.varieties?.map(v => (
                                <button key={v} onClick={(e) => { e.stopPropagation(); onAdd(item, v); setShowVarieties(false); }} className="px-2 py-1.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-lg text-xs font-bold hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                                    {v}
                                </button>
                            ))}
                            <button onClick={(e) => { e.stopPropagation(); setShowVarieties(false); }} className="px-2 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={handleAddItem}
                        className="w-full bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 active:bg-green-200 border border-green-200 dark:border-green-800 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95 transform mt-2"
                    >
                        <Plus size={14} strokeWidth={3} />
                        AGREGAR
                    </button>
                )}
            </div>
        </div>
    );
};

export default FoodItem;