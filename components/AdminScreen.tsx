
import React from 'react';
import { ArrowLeft, ChefHat, History, DollarSign, Menu as MenuIcon, Plus, Edit3, Trash2, Check, AlertCircle, Loader2, Save, User as UserIcon, Clock } from 'lucide-react';
import { Category, MenuItem, Order, OrderStatus, Screen, PendingRecharge } from '../types';

interface AdminScreenProps {
    orders: Order[];
    menuItems: MenuItem[];
    adminTab: 'ACTIVE' | 'HISTORY' | 'RECHARGE' | 'MENU';
    setAdminTab: (tab: 'ACTIVE' | 'HISTORY' | 'RECHARGE' | 'MENU') => void;
    adminRechargeCode: string;
    setAdminRechargeCode: (code: string) => void;
    adminFeedback: { type: 'success' | 'error', msg: string } | null;
    isAdminProcessing: boolean;
    isEditingItem: boolean;
    setIsEditingItem: (isEditing: boolean) => void;
    editingItem: Partial<MenuItem>;
    setEditingItem: (item: Partial<MenuItem>) => void;
    setActiveScreen: (screen: Screen) => void;
    handleAdminRecharge: () => void;
    handleCompleteRecharge: (recharge: PendingRecharge) => void;
    pendingRecharges: PendingRecharge[];
    handleUpdateOrderStatus: (id: string, status: OrderStatus) => void;
    openEditItemModal: (item?: MenuItem) => void;
    handleSaveItem: () => void;
    handleDeleteItem: (id: string) => void;
    handleLogout: () => void;
    adminSelectedSchool: string;
    onBackToSchoolSelect: () => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({
    orders,
    menuItems,
    adminTab,
    setAdminTab,
    adminRechargeCode,
    setAdminRechargeCode,
    adminFeedback,
    isAdminProcessing,
    isEditingItem,
    setIsEditingItem,
    editingItem,
    setEditingItem,
    setActiveScreen,
    handleAdminRecharge,
    handleCompleteRecharge,
    pendingRecharges,
    handleUpdateOrderStatus,
    openEditItemModal,
    handleSaveItem,
    handleDeleteItem,
    handleLogout,
    adminSelectedSchool,
    onBackToSchoolSelect
}) => {
    const activeOrders = orders.filter(o => o.status !== OrderStatus.COMPLETED);
    const historyOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);

    return (
        <div className="bg-[#0f1218] min-h-screen text-white p-6">
            {/* Admin Header */}
            <div className="bg-[#1e2330] p-6 rounded-[2.5rem] shadow-lg border border-gray-800 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto pl-2">
                    <button onClick={() => setActiveScreen('HOME')} className="p-3 hover:bg-gray-700/50 rounded-2xl transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Panel de Cocina
                            </h2>
                            <button 
                                onClick={onBackToSchoolSelect} 
                                className="bg-gray-800 hover:bg-gray-700 text-xs font-bold text-green-400 px-3 py-1 rounded-full transition-colors border border-gray-700"
                            >
                                Cambiar Plantel
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            Administrando: <span className="font-bold text-white">{adminSelectedSchool}</span>
                        </p>
                    </div>
                </div>

                <div className="flex bg-[#13161f] p-2 rounded-full overflow-x-auto w-full md:w-auto">
                    <button onClick={() => setAdminTab('ACTIVE')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${adminTab === 'ACTIVE' ? 'bg-[#2f364a] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
                        <ChefHat size={16} /> Activos ({activeOrders.length})
                    </button>
                    <button onClick={() => setAdminTab('HISTORY')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${adminTab === 'HISTORY' ? 'bg-[#2f364a] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
                        <History size={16} /> Historial
                    </button>
                    <button onClick={() => setAdminTab('RECHARGE')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${adminTab === 'RECHARGE' ? 'bg-[#22c55e] text-black shadow-md shadow-green-900/20' : 'text-gray-500 hover:text-gray-300'}`}>
                        <DollarSign size={16} /> Recargas
                    </button>
                    <button onClick={() => setAdminTab('MENU')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${adminTab === 'MENU' ? 'bg-[#2f364a] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
                        <MenuIcon size={16} /> Menú
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* --- TAB: MENU MANAGEMENT --- */}
                {adminTab === 'MENU' && (
                    <div className="animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-white">Gestión de Platillos</h3>
                            <button
                                onClick={() => openEditItemModal()}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                            >
                                <Plus size={20} /> Nuevo Platillo
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menuItems.map(item => (
                                <div key={item.id} className="bg-[#1e2330] rounded-3xl p-5 shadow-sm border border-gray-800 flex flex-col group hover:border-gray-700 transition-colors">
                                    <div className="flex gap-4 mb-4">
                                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover bg-gray-900" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <h4 className="font-bold text-white line-clamp-1">{item.name}</h4>
                                                    {!item.school && <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full w-fit mt-1 border border-gray-700">Global</span>}
                                                </div>
                                                <span className="font-bold text-green-500 text-sm whitespace-nowrap">{item.price} UC</span>
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex gap-2 pt-3 border-t border-gray-800">
                                        <button
                                            onClick={() => openEditItemModal(item)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-[#2f364a] text-blue-400 py-2.5 rounded-2xl font-bold text-xs hover:bg-[#374151] transition-colors"
                                        >
                                            <Edit3 size={14} /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-[#2f364a] text-red-400 py-2.5 rounded-2xl font-bold text-xs hover:bg-[#374151] transition-colors"
                                        >
                                            <Trash2 size={14} /> Borrar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: ACTIVE ORDERS --- */}
                {adminTab === 'ACTIVE' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                        {activeOrders.map(order => (
                            <div key={order.id} className="bg-[#1e2330] rounded-3xl shadow-lg border-l-4 border-l-green-500 overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow">
                                <div className="p-5 border-b border-gray-800 bg-[#2f364a]/50 flex justify-between">
                                    <div>
                                        <span className="font-mono text-xl font-bold text-white">#{order.pickupCode || order.id.slice(0, 4)}</span>
                                        <p className="text-xs text-gray-400">{order.userId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono text-gray-300">{order.pickupTime}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${order.status === 'Pendiente' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>{order.status}</span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 space-y-2">
                                    {order.items.map((i, idx) => <div key={idx} className="flex gap-2 text-sm text-gray-300"><span className="font-bold text-white">{i.quantity}x</span> <span>{i.name}</span></div>)}
                                </div>
                                <div className="p-4 bg-[#13161f] border-t border-gray-800 flex flex-col gap-2">
                                    {order.status === OrderStatus.PENDING && <button onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.READY)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-colors">Marcar Listo</button>}
                                    {order.status === OrderStatus.READY && <button onClick={() => handleUpdateOrderStatus(order.id, OrderStatus.COMPLETED)} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-colors">Entregar</button>}
                                </div>
                            </div>
                        ))}
                        {activeOrders.length === 0 && (
                            <div className="col-span-full py-24 text-center text-gray-500 bg-[#1e2330] rounded-[2.5rem] border border-dashed border-gray-800">
                                <div className="bg-[#2f364a] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                    <ChefHat size={40} />
                                </div>
                                <p>No hay pedidos activos por el momento.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB: HISTORY --- */}
                {adminTab === 'HISTORY' && (
                    <div className="bg-[#1e2330] rounded-[2.5rem] shadow-lg border border-gray-800 overflow-hidden animate-fade-in p-2">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-[#13161f]">
                                <tr><th className="px-6 py-4 rounded-tl-2xl">Código</th><th className="px-6 py-4">Usuario</th><th className="px-6 py-4">Total</th><th className="px-6 py-4 rounded-tr-2xl">Estado</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {historyOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-[#2f364a]/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-white font-mono">{order.pickupCode}</td>
                                        <td className="px-6 py-4">{order.userId}</td>
                                        <td className="px-6 py-4 text-green-500 font-bold">{order.total} UC</td>
                                        <td className="px-6 py-4"><span className="bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20">Entregado</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- TAB: RECHARGE --- */}
                {adminTab === 'RECHARGE' && (
                    <div className="space-y-6 animate-scale-in max-w-3xl mx-auto">

                        {/* Pending recharges list */}
                        <div className="bg-[#1e2330] rounded-[2.5rem] p-6 border border-gray-800 shadow-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-lg text-white">Recargas Pendientes</h3>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${pendingRecharges.length > 0
                                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                        : 'bg-gray-700 text-gray-400'
                                    }`}>
                                    {pendingRecharges.length} pendiente{pendingRecharges.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {pendingRecharges.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">
                                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No hay recargas pendientes.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingRecharges.map(r => {
                                        const timeAgo = (() => {
                                            const diff = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 1000);
                                            if (diff < 60) return 'hace un momento';
                                            if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
                                            return `hace ${Math.floor(diff / 3600)} h`;
                                        })();
                                        return (
                                            <div key={r.id} className="flex items-center justify-between p-4 bg-[#13161f] rounded-2xl border border-gray-800 hover:border-yellow-500/30 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0">
                                                        <UserIcon size={18} className="text-yellow-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{r.userName}</p>
                                                        <p className="text-[11px] text-gray-500 font-mono">{r.userId}</p>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <Clock size={10} className="text-gray-600" />
                                                            <span className="text-[10px] text-gray-600">{timeAgo}</span>
                                                            <span className="text-[10px] text-gray-700 mx-1">·</span>
                                                            <span className="text-[10px] font-mono text-gray-600">{r.code}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-green-400 font-bold text-lg">+{r.amount} UC</span>
                                                    <button
                                                        onClick={() => handleCompleteRecharge(r)}
                                                        disabled={isAdminProcessing}
                                                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-green-900/20"
                                                    >
                                                        <Check size={14} /> Completar
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Manual code input */}
                        <div className="bg-[#1e2330] rounded-[2.5rem] p-6 border border-gray-800 shadow-2xl">
                            <h3 className="font-bold text-base text-white mb-4 border-b border-gray-800 pb-4">Ingresar Código Manualmente</h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        value={adminRechargeCode}
                                        onChange={e => setAdminRechargeCode(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAdminRecharge()}
                                        className="w-full bg-[#13161f] border border-gray-700 rounded-3xl pl-6 pr-32 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-mono"
                                        placeholder="UCOL-100-1234"
                                    />
                                    <button
                                        onClick={handleAdminRecharge}
                                        disabled={isAdminProcessing || !adminRechargeCode}
                                        className="absolute right-2 top-2 bottom-2 bg-[#22c55e] hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-black px-6 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-green-900/20"
                                    >
                                        {isAdminProcessing ? <Loader2 className="animate-spin" size={18} /> : 'Validar'}
                                    </button>
                                </div>

                                {adminFeedback && (
                                    <div className={`p-4 rounded-3xl border ${adminFeedback.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'} flex items-center gap-3 animate-fade-in`}>
                                        {adminFeedback.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                                        <span className="font-bold text-sm">{adminFeedback.msg}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Menu Edit Modal */}
            {
                isEditingItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditingItem(false)} />
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl overflow-y-auto max-h-[90vh] animate-scale-in">
                            <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-white">{editingItem.id ? 'Editar Platillo' : 'Nuevo Platillo'}</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={editingItem.name || ''}
                                        onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Precio (UC)</label>
                                        <input
                                            type="number"
                                            value={editingItem.price || ''}
                                            onChange={e => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Categoría</label>
                                        <select
                                            value={editingItem.category}
                                            onChange={e => setEditingItem({ ...editingItem, category: e.target.value as Category })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                                        >
                                            {Object.values(Category).filter(c => c !== Category.ALL).map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Descripción</label>
                                    <textarea
                                        value={editingItem.description || ''}
                                        onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white h-20 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">URL Imagen</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editingItem.image || ''}
                                            onChange={e => setEditingItem({ ...editingItem, image: e.target.value })}
                                            placeholder="https://..."
                                            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                                        />
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                            {editingItem.image && <img src={editingItem.image} className="w-full h-full object-cover" />}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Calorías</label>
                                        <input
                                            type="number"
                                            value={editingItem.calories || ''}
                                            onChange={e => setEditingItem({ ...editingItem, calories: Number(e.target.value) })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Tiempo Prep (min)</label>
                                        <input
                                            type="number"
                                            value={editingItem.prepTime || ''}
                                            onChange={e => setEditingItem({ ...editingItem, prepTime: Number(e.target.value) })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Variedades u Opciones (separadas por comas)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Lomo, Adobada, Pollo"
                                        value={editingItem.varieties?.join(', ') || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            const vList = val.split(',').map(s => s.trim()).filter(Boolean);
                                            setEditingItem({ ...editingItem, varieties: vList.length > 0 ? vList : [] });
                                        }}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Si dejas este campo vacío, el platillo no tendrá opciones.</p>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <input
                                        type="checkbox"
                                        checked={editingItem.isPopular || false}
                                        onChange={e => setEditingItem({ ...editingItem, isPopular: e.target.checked })}
                                        className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
                                    />
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Marcar como Popular</label>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">Visibilidad del Platillo</label>
                                    <div className="flex flex-col gap-3">
                                        <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                                            <input 
                                                type="radio" 
                                                name="visibility" 
                                                checked={editingItem.school === adminSelectedSchool} 
                                                onChange={() => setEditingItem({ ...editingItem, school: adminSelectedSchool })}
                                                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                                            />
                                            <span>Exclusivo para <strong>{adminSelectedSchool}</strong></span>
                                        </label>
                                        <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                                            <input 
                                                type="radio" 
                                                name="visibility" 
                                                checked={!editingItem.school} 
                                                onChange={() => setEditingItem({ ...editingItem, school: '' })}
                                                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                                            />
                                            <div>
                                                <span>Global </span>
                                                <span className="text-xs text-gray-500 font-normal">(Visible en todos los planteles)</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button onClick={() => setIsEditingItem(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700">Cancelar</button>
                                <button onClick={handleSaveItem} disabled={isAdminProcessing} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center justify-center gap-2">
                                    {isAdminProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />} Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminScreen;
