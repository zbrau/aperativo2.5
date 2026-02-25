import React, { useState } from 'react';
import { X, ChevronDown, HelpCircle, MessageSquare, Sparkles } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenAI?: () => void;
}

const FAQ_ITEMS = [
    {
        q: '¿Cómo hago un pedido?',
        a: 'Ve al Menú, selecciona los platillos que quieras y haz clic en "Agregar". Luego abre tu carrito, elige hora de recogida y confirma el pedido.'
    },
    {
        q: '¿Cómo recargo saldo (Ucol Coins)?',
        a: 'Desde tu Perfil, toca "Recargar Saldo". Selecciona un monto, se generará un código. Muestra ese código al personal de la cafetería y paga en efectivo. El administrador acreditará tu saldo.'
    },
    {
        q: '¿Cómo uso mis puntos de recompensa?',
        a: 'Al hacer checkout, verás la opción de canjear puntos si tienes suficientes. Cada 200 puntos desbloquean un descuento. Los puntos se acumulan con cada compra.'
    },
    {
        q: '¿Dónde recojo mi pedido?',
        a: 'En la cafetería de tu plantel. Muestra el código de recolección que aparece en la sección "Pedidos" al personal de la cafetería.'
    },
    {
        q: '¿Puedo pagar en efectivo?',
        a: 'Sí. Al confirmar tu pedido, puedes elegir entre pagar con Ucol Coins (saldo digital) o en efectivo al recoger tu pedido.'
    },
    {
        q: '¿Qué pasa si mi pedido está incorrecto?',
        a: 'Acude directamente al personal de la cafetería con tu código de pedido. Ellos te ayudarán a resolver cualquier inconveniente.'
    },
    {
        q: '¿Cómo funciona el modo oscuro?',
        a: 'Desde tu Perfil, activa/desactiva el switch de "Modo Oscuro". Tu preferencia se guarda automáticamente.'
    }
];

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onOpenAI }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-white dark:bg-gray-900 w-full md:max-w-lg md:rounded-2xl rounded-t-3xl overflow-hidden animate-slide-up shadow-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative flex-shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-xl">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Ayuda y Soporte</h2>
                            <p className="text-blue-100 text-sm">Preguntas frecuentes</p>
                        </div>
                    </div>
                </div>

                {/* FAQ List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {FAQ_ITEMS.map((item, i) => (
                        <div
                            key={i}
                            className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <span className="font-semibold text-sm text-gray-800 dark:text-white pr-4">{item.q}</span>
                                <ChevronDown
                                    size={18}
                                    className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {openIndex === i && (
                                <div className="px-4 pb-4 animate-fade-in">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer - AI Assistant link */}
                {onOpenAI && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                        <button
                            onClick={() => { onClose(); onOpenAI(); }}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95"
                        >
                            <Sparkles size={16} />
                            Pregúntale a NutriBot
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpModal;
