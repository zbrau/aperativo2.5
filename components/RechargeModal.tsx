
import React from 'react';
import { X, Coins, ArrowLeft, QrCode } from 'lucide-react';

interface RechargeModalProps {
    showRechargeModal: boolean;
    setShowRechargeModal: (show: boolean) => void;
    rechargeStep: 'SELECT_AMOUNT' | 'SHOW_CODE';
    setRechargeStep: (step: 'SELECT_AMOUNT' | 'SHOW_CODE') => void;
    selectedRechargeAmount: number;
    handleSelectAmount: (amount: number) => void;
    customRechargeInput: string;
    setCustomRechargeInput: (input: string) => void;
    handleFinishRecharge: () => void;
    rechargeCode: string;
}

const RechargeModal: React.FC<RechargeModalProps> = ({
    showRechargeModal,
    setShowRechargeModal,
    rechargeStep,
    setRechargeStep,
    selectedRechargeAmount,
    handleSelectAmount,
    customRechargeInput,
    setCustomRechargeInput,
    handleFinishRecharge,
    rechargeCode
}) => {
    if (!showRechargeModal) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRechargeModal(false)} />
            <div className="bg-[#1e2330] rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl animate-scale-in border border-gray-700/50 text-white overflow-hidden">
                <button onClick={() => setShowRechargeModal(false)} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors z-50"><X size={24} /></button>

                {rechargeStep === 'SELECT_AMOUNT' ? (
                    <div className="flex flex-col items-center space-y-6 animate-fade-in pt-4">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 bg-green-900/30 rounded-full flex items-center justify-center border border-green-500/20">
                                <Coins className="w-7 h-7 text-green-500" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white">Elige la cantidad</h3>
                                <p className="text-xs text-gray-400 mt-1">¿Cuántos Ucol Coins quieres recargar hoy?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            {[20, 50, 100, 200].map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => handleSelectAmount(amount)}
                                    className="bg-[#2a3040] hover:bg-[#323a4d] border border-gray-700 hover:border-green-500/50 rounded-xl py-4 px-2 flex flex-col items-center gap-1 transition-all group"
                                >
                                    <span className="text-green-500 font-bold text-lg group-hover:scale-105 transition-transform">{amount} UC</span>
                                    <span className="text-[10px] text-gray-400 font-medium">${amount}.00 MXN</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handleSelectAmount(500)}
                            className="w-full bg-[#2a3040] hover:bg-[#323a4d] border border-gray-700 hover:border-green-500/50 rounded-xl py-4 flex flex-row items-center justify-center gap-3 transition-all group"
                        >
                            <span className="text-green-500 font-bold text-lg group-hover:scale-105 transition-transform">500 UC</span>
                            <span className="text-xs text-gray-400 font-medium">($500.00 MXN)</span>
                        </button>

                        <div className="w-full border-t border-gray-700 pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-400">Monto Personalizado</span>
                                <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-300">1 MXN = 1 UC</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">UC</span>
                                    <input
                                        type="number"
                                        value={customRechargeInput}
                                        onChange={(e) => setCustomRechargeInput(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-[#2a3040] border border-gray-600 rounded-lg pl-10 pr-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-green-500/50 transition-colors"
                                    />
                                </div>
                                <button
                                    onClick={() => { const val = Math.floor(parseFloat(customRechargeInput)); if (val > 0) handleSelectAmount(val); }}
                                    disabled={!customRechargeInput}
                                    className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white px-5 rounded-lg font-bold text-sm transition-colors"
                                >
                                    Generar
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-6 animate-slide-up pt-4">
                        <button onClick={() => setRechargeStep('SELECT_AMOUNT')} className="absolute top-4 left-4 p-1 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>

                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 bg-green-900/30 rounded-full flex items-center justify-center border border-green-500/20">
                                <QrCode className="w-7 h-7 text-green-500" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white">Código de Recarga</h3>
                                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Muestra este código en la <span className="font-bold text-white">Dirección Escolar</span>.</p>
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="bg-[#153e24]/40 border border-green-800/50 rounded-xl p-4 text-center">
                                <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">Monto a Pagar</p>
                                <p className="text-3xl font-bold text-green-500">${selectedRechargeAmount}.00</p>
                            </div>

                            <div className="bg-[#232936] border-2 border-dashed border-gray-600 rounded-xl p-6 text-center group relative overflow-hidden">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Código</p>
                                <p className="text-xl font-mono font-bold text-white tracking-wider">{rechargeCode}</p>
                            </div>

                            <p className="text-[10px] text-center text-gray-500">
                                Tu saldo se actualizará en cuanto pagues.
                            </p>
                        </div>

                        <button
                            onClick={handleFinishRecharge}
                            className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3.5 rounded-xl border border-gray-800 transition-all active:scale-95 shadow-lg"
                        >
                            Listo, Entendido
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RechargeModal;
