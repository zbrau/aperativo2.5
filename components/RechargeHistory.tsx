import React, { useEffect, useState } from 'react';
import { X, History, Check, Clock, Loader2 } from 'lucide-react';
import { db } from '../services/firebase';

interface RechargeRecord {
    id: string;
    code: string;
    amount: number;
    status: 'PENDING' | 'COMPLETED';
    createdAt: string;
    processedAt?: number;
}

interface RechargeHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
}

const RechargeHistory: React.FC<RechargeHistoryProps> = ({ isOpen, onClose, userEmail }) => {
    const [records, setRecords] = useState<RechargeRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !userEmail) return;
        setLoading(true);

        const unsub = db.collection('recharge_requests')
            .where('userId', '==', userEmail)
            .onSnapshot((snap: any) => {
                const items: RechargeRecord[] = snap.docs.map((doc: any) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setRecords(items);
                setLoading(false);
            }, () => setLoading(false));

        return () => unsub();
    }, [isOpen, userEmail]);

    if (!isOpen) return null;

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 bg-white dark:bg-gray-900 w-full md:max-w-lg md:rounded-2xl rounded-t-3xl overflow-hidden animate-slide-up shadow-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white relative flex-shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-xl">
                            <History size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Historial de Recargas</h2>
                            <p className="text-orange-100 text-sm">{records.length} registro{records.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Sin recargas aún</p>
                            <p className="text-sm mt-1">Tus recargas aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {records.map(record => (
                                <div
                                    key={record.id}
                                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${record.status === 'COMPLETED'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                            }`}>
                                            {record.status === 'COMPLETED' ? <Check size={18} /> : <Clock size={18} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">+{record.amount} UC</p>
                                            <p className="text-xs text-gray-400 font-mono truncate">{record.code}</p>
                                            <p className="text-xs text-gray-400">{formatDate(record.createdAt)}</p>
                                        </div>
                                    </div>
                                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${record.status === 'COMPLETED'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                        }`}>
                                        {record.status === 'COMPLETED' ? 'Acreditado' : 'Pendiente'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RechargeHistory;
