import React, { useState, useEffect } from 'react';
import { X, Clock, ShoppingBag, Coins, AlertCircle, Gift, Sparkles, Banknote } from 'lucide-react';
import { CartItem, PickupTime } from '../types';

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    loyaltyPoints: number;
    onUpdateQuantity: (id: string, delta: number) => void;
    onCheckout: (pickupTime: string, pointsRedeemed: number, discount: number, paymentMethod: 'CASH' | 'COINS') => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, loyaltyPoints, onUpdateQuantity, onCheckout }) => {
    const [selectedOption, setSelectedOption] = useState<PickupTime>(PickupTime.NOW);
    const [customTime, setCustomTime] = useState<string>('');
    const [timeError, setTimeError] = useState<string>('');
    
    // Reward State
    const [redeemReward, setRedeemReward] = useState(false);

    const REWARD_COST = 200;
    const MAX_DISCOUNT = 100;

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate Discount
    let discount = 0;
    if (redeemReward && loyaltyPoints >= REWARD_COST) {
        discount = Math.min(subtotal, MAX_DISCOUNT);
    }
    
    const total = Math.max(0, subtotal - discount);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setSelectedOption(PickupTime.NOW);
            setCustomTime('');
            setTimeError('');
            setRedeemReward(false);
        }
    }, [isOpen]);

    const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = e.target.value;
        setCustomTime(time);
        
        if (!time) {
            setTimeError('');
            return;
        }

        const [hours, minutes] = time.split(':').map(Number);
        
        // Logic: Must be before 11:00 AM
        // Assuming 24h format from input type="time"
        if (hours > 11 || (hours === 11 && minutes > 0)) {
            setTimeError('La hora límite para pedir es 11:00 AM');
        } else if (hours < 7) {
            setTimeError('La cafetería abre a las 7:00 AM');
        } else {
            setTimeError('');
        }
    };

    const handleCheckoutClick = (method: 'CASH' | 'COINS') => {
        const pickupTimeString = selectedOption === PickupTime.CUSTOM ? `Personalizado (${customTime})` : selectedOption;

        if (selectedOption === PickupTime.CUSTOM) {
            if (!customTime) {
                setTimeError('Selecciona una hora');
                return;
            }
            if (timeError) return;
        }
        
        const pointsToRedeem = discount > 0 ? REWARD_COST : 0;
        onCheckout(pickupTimeString, pointsToRedeem, discount, method);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 transition-colors">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
                        Tu Pedido
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950 transition-colors">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 space-y-4">
                            <ShoppingBag className="w-16 h-16 opacity-20" />
                            <p>Tu carrito está vacío</p>
                            <button onClick={onClose} className="text-green-600 dark:text-green-400 font-medium hover:underline">
                                Ir al menú
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3 transition-colors">
                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800 dark:text-white text-sm">{item.name}</h4>
                                    <p className="text-green-700 dark:text-green-400 font-bold text-sm flex items-center gap-1">
                                        <Coins className="w-3 h-3" />
                                        {item.price * item.quantity} UC
                                    </p>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg px-2 py-1 border border-gray-200 dark:border-gray-700">
                                        <button 
                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                            className="text-gray-500 dark:text-gray-400 hover:text-red-500 disabled:opacity-50"
                                        >
                                            -
                                        </button>
                                        <span className="text-sm font-medium w-4 text-center text-gray-800 dark:text-white">{item.quantity}</span>
                                        <button 
                                            onClick={() => onUpdateQuantity(item.id, 1)}
                                            className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors">
                        {/* Reward Section */}
                        <div className="mb-4 p-3 rounded-xl border border-dashed border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-sm">
                                    <Gift className="w-4 h-4" />
                                    <span>Aperativo Rewards</span>
                                </div>
                                <span className="text-xs font-medium text-orange-600 dark:text-orange-300">
                                    Tienes {loyaltyPoints} pts
                                </span>
                            </div>

                            {loyaltyPoints >= REWARD_COST ? (
                                <label className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-800 dark:text-white font-medium group-hover:text-green-600 transition-colors">
                                            Canjear comida gratis
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Usa {REWARD_COST} pts para -{MAX_DISCOUNT} UC
                                        </span>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={redeemReward}
                                            onChange={(e) => setRedeemReward(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                    </div>
                                </label>
                            ) : (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>Meta: {REWARD_COST} pts</span>
                                        <span>Faltan {REWARD_COST - loyaltyPoints} pts</span>
                                    </div>
                                    <div className="w-full bg-orange-200 dark:bg-orange-900/30 rounded-full h-2">
                                        <div 
                                            className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.min(100, (loyaltyPoints / REWARD_COST) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-center text-orange-600/80 dark:text-orange-400/80 pt-1">
                                        ¡Sigue pidiendo para desbloquear tu comida gratis!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pre-order Section */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ¿Para cuándo lo quieres?
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                {Object.values(PickupTime).map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedOption(time)}
                                        className={`text-xs py-2 px-3 rounded-lg border transition-all text-center ${
                                            selectedOption === time
                                                ? 'bg-green-50 dark:bg-green-900/30 border-green-600 dark:border-green-400 text-green-800 dark:text-green-300 font-medium'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-200 dark:hover:border-green-800'
                                        }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                            
                            {selectedOption === PickupTime.CUSTOM && (
                                <div className="mt-2 animate-fade-in">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Selecciona hora (Máx 11:00 AM):</label>
                                    <input 
                                        type="time" 
                                        value={customTime}
                                        onChange={handleCustomTimeChange}
                                        className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ${timeError ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 dark:border-gray-700 focus:ring-green-200'}`}
                                    />
                                    {timeError && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {timeError}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Calculation Area */}
                        <div className="space-y-2 mb-4 text-sm">
                            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 text-xs">
                                <span>Subtotal</span>
                                <span>{subtotal.toFixed(0)} UC</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between items-center text-orange-600 dark:text-orange-400 font-medium text-xs">
                                    <span className="flex items-center gap-1"><Sparkles size={12} /> Recompensa</span>
                                    <span>-{discount.toFixed(0)} UC</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-800 dark:text-white font-bold">Total a Pagar</span>
                                <div className="flex items-center gap-1 text-2xl font-bold text-gray-800 dark:text-white">
                                    <Coins className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    {total.toFixed(0)} UC
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handleCheckoutClick('CASH')}
                                disabled={!!timeError}
                                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-1">
                                    <Banknote size={18} />
                                    <span className="text-sm">Efectivo</span>
                                </div>
                                <span className="text-[10px] text-gray-500">Pagas al recoger</span>
                            </button>

                            <button 
                                onClick={() => handleCheckoutClick('COINS')}
                                disabled={!!timeError}
                                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 dark:shadow-none active:scale-[0.98] transition-transform flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-1">
                                    <Coins size={18} />
                                    <span className="text-sm">Ucol Coins</span>
                                </div>
                                <span className="text-[10px] text-green-200">Descontar saldo</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;