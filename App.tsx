
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Home, Menu as MenuIcon, ShoppingBag, User as UserIcon, Bell, MapPin, Coins, QrCode, Check, X, LogOut, School, BookOpen, Users, ChevronRight, ArrowLeft, Loader2, Moon, Sun, ClipboardList, ShieldCheck, AlertCircle, DollarSign, Gift, Award, Sparkles, Flame, Clock, ChefHat, PackageCheck, History, Trash2, Banknote, Edit3, Plus, Image as ImageIcon, Save } from 'lucide-react';
import FoodItem from './components/FoodItem';
import Cart from './components/Cart';
import AIAssistant from './components/AIAssistant';
import { MENU_ITEMS as DEFAULT_MENU_ITEMS, CATEGORIES } from './constants';
import AdminScreen from './components/AdminScreen';
import RechargeModal from './components/RechargeModal';
import AvatarModal from './components/AvatarModal';
import { Category, MenuItem, CartItem, Screen, PickupTime, Order, OrderStatus, User } from './types';
// Firebase Imports
import { db } from './services/firebase';

const App: React.FC = () => {
    // --- Authentication State ---

    // Objeto Admin constante
    const ADMIN_USER: User = {
        name: 'Administrador',
        email: 'admin@ucol.mx',
        school: 'Administración',
        grade: '-',
        group: 'Staff',
        balance: 99999,
        loyaltyPoints: 9999
    };

    const [user, setUser] = useState<User | null>(null);
    const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    // --- App State ---
    const [activeScreen, setActiveScreen] = useState<Screen>('HOME');
    const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ALL);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Data State (Real-time)
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    // Theme State
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
        }
        return 'light';
    });

    // Recharge State
    const [showRechargeModal, setShowRechargeModal] = useState(false);
    const [rechargeStep, setRechargeStep] = useState<'SELECT_AMOUNT' | 'SHOW_CODE'>('SELECT_AMOUNT');
    const [selectedRechargeAmount, setSelectedRechargeAmount] = useState<number>(0);
    const [rechargeCode, setRechargeCode] = useState('');
    const [customRechargeInput, setCustomRechargeInput] = useState('');

    // --- Admin Panel State ---
    const [adminSearchCode, setAdminSearchCode] = useState('');
    const [adminRechargeCode, setAdminRechargeCode] = useState('');
    const [adminFeedback, setAdminFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [isAdminProcessing, setIsAdminProcessing] = useState(false);
    const [adminTab, setAdminTab] = useState<'ACTIVE' | 'HISTORY' | 'RECHARGE' | 'MENU'>('ACTIVE');

    // Admin Menu Management State
    const [isEditingItem, setIsEditingItem] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<MenuItem>>({});

    // Avatar State
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);
    // AVATARS moved to AvatarModal.tsx

    // --- Auth Form State ---
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');

    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPass, setRegPass] = useState('');
    const [regSchool, setRegSchool] = useState('');
    const [regGrade, setRegGrade] = useState('');
    const [regGroup, setRegGroup] = useState('');
    const [authError, setAuthError] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    // 0. Efecto de Tema
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // 1. Efecto de inicialización Session
    useEffect(() => {
        const checkSession = async () => {
            const activeEmail = localStorage.getItem('activeSessionEmail');

            if (!activeEmail) {
                setIsLoadingUser(false);
                return;
            }

            if (activeEmail === 'admin@ucol.mx') {
                const adminAvatar = localStorage.getItem('adminAvatar');
                setUser({ ...ADMIN_USER, avatar: adminAvatar || undefined });
                setIsLoadingUser(false);
                return;
            }

            try {
                const docRef = db.collection("users").doc(activeEmail);
                const docSnap = await docRef.get();

                if (docSnap.exists) {
                    setUser(docSnap.data() as User);
                } else {
                    localStorage.removeItem('activeSessionEmail');
                }
            } catch (error) {
                console.error("Error recuperando sesión:", error);
            } finally {
                setIsLoadingUser(false);
            }
        };

        checkSession();
    }, []);

    // 2. User Sync
    useEffect(() => {
        if (!user || user.email === 'admin@ucol.mx') return;

        const unsub = db.collection("users").doc(user.email).onSnapshot((doc: any) => {
            if (doc.exists) {
                setUser(doc.data() as User);
            }
        });

        return () => unsub();
    }, [user?.email]);

    // 3. Menu Sync & Seeding
    useEffect(() => {
        const unsubscribe = db.collection("menu_items").onSnapshot((snapshot: any) => {
            if (snapshot.empty) {
                // Seed data if collection is empty
                console.log("Seeding Menu Items...");
                const batch = db.batch();
                DEFAULT_MENU_ITEMS.forEach(item => {
                    const docRef = db.collection("menu_items").doc(item.id);
                    batch.set(docRef, item);
                });
                batch.commit().catch(console.error);
            } else {
                const items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as MenuItem[];
                setMenuItems(items);
            }
        });
        return () => unsubscribe();
    }, []);


    // 4. Orders Sync
    useEffect(() => {
        if (!user) return;
        setIsLoadingOrders(true);

        let q;
        if (user.email === 'admin@ucol.mx') {
            q = db.collection("orders").orderBy("timestamp", "desc");
        } else {
            q = db.collection("orders").where("userId", "==", user.email);
        }

        const unsubscribe = q.onSnapshot((snapshot: any) => {
            const fetchedOrders: Order[] = [];
            snapshot.forEach((doc: any) => {
                fetchedOrders.push(doc.data() as Order);
            });

            fetchedOrders.sort((a, b) => {
                const tsA = (a as any).timestamp || 0;
                const tsB = (b as any).timestamp || 0;
                return tsB - tsA;
            });

            setOrders(fetchedOrders);
            setIsLoadingOrders(false);
        }, (error: any) => {
            console.error("Error cargando pedidos:", error);
            setIsLoadingOrders(false);
        });

        return () => unsubscribe();
    }, [user]);

    // --- Handlers (Auth, etc) ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setIsAuthLoading(true);

        if (loginEmail === 'admin@ucol.mx' && loginPass === 'admin') {
            const adminAvatar = localStorage.getItem('adminAvatar');
            setUser({ ...ADMIN_USER, avatar: adminAvatar || undefined });
            localStorage.setItem('activeSessionEmail', 'admin@ucol.mx');
            setIsAuthLoading(false);
            return;
        }
        // ... (rest of auth logic same as before)
        if (!loginEmail.endsWith('@ucol.mx')) {
            setAuthError('El correo debe terminar en @ucol.mx');
            setIsAuthLoading(false);
            return;
        }

        try {
            const docRef = db.collection("users").doc(loginEmail);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                const userData = docSnap.data();
                if (userData && userData.password === loginPass) {
                    const loggedUser = userData as User;
                    setUser(loggedUser);
                    localStorage.setItem('activeSessionEmail', loginEmail);
                } else {
                    setAuthError('Contraseña incorrecta.');
                }
            } else {
                setAuthError('No existe cuenta con este correo.');
            }
        } catch (err) {
            console.error(err);
            setAuthError('Error de conexión. Intenta de nuevo.');
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setIsAuthLoading(true);

        if (!regEmail.endsWith('@ucol.mx')) {
            setAuthError('El correo debe ser institucional (@ucol.mx)');
            setIsAuthLoading(false);
            return;
        }

        if (!regName || !regPass || !regSchool || !regGrade || !regGroup) {
            setAuthError('Por favor completa todos los campos');
            setIsAuthLoading(false);
            return;
        }

        try {
            const docRef = db.collection("users").doc(regEmail);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                setAuthError('Este usuario ya está registrado.');
                setIsAuthLoading(false);
                return;
            }

            const newUser = {
                name: regName,
                email: regEmail,
                school: regSchool,
                grade: regGrade,
                group: regGroup,
                balance: 50,
                loyaltyPoints: 0,
                password: regPass
            };

            await db.collection("users").doc(regEmail).set(newUser);
            alert('¡Registro exitoso! Por favor inicia sesión.');
            setAuthMode('LOGIN');
            setLoginEmail(regEmail);
            setRegName(''); setRegEmail(''); setRegPass(''); setRegSchool(''); setRegGrade(''); setRegGroup('');

        } catch (error) {
            console.error("Error al registrar:", error);
            setAuthError('Error guardando datos en la nube.');
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('activeSessionEmail');
        setUser(null);
        setCartItems([]);
        setOrders([]);
        setActiveScreen('HOME');
        setLoginPass('');
        setRegPass('');
        setLoginEmail('');
    };

    // --- Admin Menu Logic ---
    const openEditItemModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
        } else {
            setEditingItem({
                name: '',
                description: '',
                price: 0,
                category: Category.LUNCH,
                image: '',
                calories: 0,
                prepTime: 5,
                isPopular: false
            });
        }
        setIsEditingItem(true);
    };

    const handleSaveItem = async () => {
        if (!editingItem.name || !editingItem.price) return;
        setIsAdminProcessing(true);

        try {
            const itemData = { ...editingItem };
            if (!itemData.id) {
                // Create
                const newRef = db.collection("menu_items").doc();
                await newRef.set({ ...itemData, id: newRef.id });
            } else {
                // Update
                await db.collection("menu_items").doc(itemData.id).update(itemData);
            }
            setIsEditingItem(false);
            setEditingItem({});
        } catch (error) {
            console.error("Error saving item:", error);
            alert("Error guardando el platillo.");
        } finally {
            setIsAdminProcessing(false);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!window.confirm("¿Seguro que deseas eliminar este platillo?")) return;
        try {
            await db.collection("menu_items").doc(id).delete();
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    // --- Order Logic ---
    const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        setIsAdminProcessing(true);
        try {
            const orderRef = db.collection("orders").doc(orderId);
            await orderRef.update({ status: newStatus });
        } catch (error) { console.error(error); alert("Error actualizando"); } finally { setIsAdminProcessing(false); }
    };

    const handleAdminLookup = async () => {
        if (!adminSearchCode.trim()) return;
        setIsAdminProcessing(true); setAdminFeedback(null);
        try {
            const q = db.collection("orders").where("pickupCode", "==", adminSearchCode.trim().toUpperCase());
            const querySnapshot = await q.get();
            if (querySnapshot.empty) { setAdminFeedback({ type: 'error', msg: 'Código no encontrado.' }); setIsAdminProcessing(false); return; }
            const orderDoc = querySnapshot.docs[0]; const orderData = orderDoc.data() as Order;
            if (orderData.status === OrderStatus.COMPLETED) { setAdminFeedback({ type: 'error', msg: 'Ya entregado.' }); setIsAdminProcessing(false); return; }
            await db.collection("orders").doc(orderDoc.id).update({ status: OrderStatus.COMPLETED });
            setAdminFeedback({ type: 'success', msg: `Entregado correctamente.` }); setAdminSearchCode('');
        } catch (error) { console.error(error); } finally { setIsAdminProcessing(false); }
    };

    const handleAdminRecharge = async () => {
        if (!adminRechargeCode.trim()) return;
        setIsAdminProcessing(true); setAdminFeedback(null);
        try {
            const q = db.collection("recharge_requests").where("code", "==", adminRechargeCode.trim());
            const querySnapshot = await q.get();
            if (querySnapshot.empty) { setAdminFeedback({ type: 'error', msg: 'Inválido.' }); setIsAdminProcessing(false); return; }
            const reqDoc = querySnapshot.docs[0]; const reqData = reqDoc.data();
            if (reqData.status === 'COMPLETED') { setAdminFeedback({ type: 'error', msg: 'Ya usado.' }); setIsAdminProcessing(false); return; }
            const userRef = db.collection("users").doc(reqData.userId); const userSnap = await userRef.get();
            if (userSnap.exists) {
                await userRef.update({ balance: (userSnap.data()?.balance || 0) + reqData.amount });
                await db.collection("recharge_requests").doc(reqDoc.id).update({ status: 'COMPLETED', processedAt: Date.now() });
                setAdminFeedback({ type: 'success', msg: `Recarga exitosa.` }); setAdminRechargeCode('');
            }
        } catch (error) { console.error(error); } finally { setIsAdminProcessing(false); }
    };

    // --- Main Logic ---
    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesCategory = selectedCategory === Category.ALL || item.category === selectedCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery, menuItems]);

    const addToCart = (item: MenuItem) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        setTimeout(() => setIsCartOpen(true), 10);
    };

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleCheckout = async (pickupTime: string, pointsRedeemed: number = 0, discount: number = 0, paymentMethod: 'CASH' | 'COINS') => {
        if (!user) return;
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = Math.max(0, subtotal - discount);

        let newBalance = user.balance;

        if (paymentMethod === 'COINS') {
            if (total > user.balance) {
                alert("¡Oh no! Te faltan Ucol Coins para pagar este pedido. Recarga saldo o paga en efectivo.");
                return;
            }
            newBalance = user.balance - total;
        }

        const currentPoints = user.loyaltyPoints || 0;
        if (pointsRedeemed > 0 && currentPoints < pointsRedeemed) {
            alert("No tienes suficientes puntos para canjear esta recompensa.");
            return;
        }

        const pointsEarned = Math.floor(total);
        const newPoints = currentPoints - pointsRedeemed + pointsEarned;
        const pickupCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const tempOrder: Order = {
            id: Math.random().toString(36).substr(2, 9),
            items: [...cartItems],
            total, subtotal, discount, pointsEarned, pointsRedeemed,
            status: OrderStatus.PENDING,
            date: new Date().toLocaleDateString(),
            pickupTime,
            userId: user.email,
            pickupCode,
            paymentMethod
        };

        try {
            const orderRef = await db.collection("orders").add({
                ...tempOrder,
                date: new Date().toLocaleDateString(),
                timestamp: Date.now()
            });
            await orderRef.update({ id: orderRef.id });

            if (user.email === 'admin@ucol.mx') {
                setUser({ ...user, balance: newBalance, loyaltyPoints: newPoints });
            } else {
                const userRef = db.collection("users").doc(user.email);
                await userRef.update({ balance: newBalance, loyaltyPoints: newPoints });
            }

            setCartItems([]); setIsCartOpen(false); setActiveScreen('ORDERS');
            let msg = `¡Pedido confirmado! Pasa a recogerlo: ${pickupTime}.`;
            if (paymentMethod === 'CASH') msg += " Recuerda pagar en efectivo.";
            alert(msg);

        } catch (error) { console.error("Error pedido:", error); alert("Error de conexión."); }
    };

    const handleClearHistory = async () => {
        if (!user || user.email === 'admin@ucol.mx') return;
        if (!window.confirm("¿Borrar historial?")) return;
        try {
            const q = db.collection("orders").where("userId", "==", user.email).where("status", "==", OrderStatus.COMPLETED);
            const snapshot = await q.get(); const batch = db.batch();
            snapshot.forEach((doc: any) => batch.delete(doc.ref));
            await batch.commit(); alert("Historial limpiado.");
        } catch (error) { console.error(error); }
    };

    const openRechargeModal = () => { setRechargeStep('SELECT_AMOUNT'); setSelectedRechargeAmount(0); setCustomRechargeInput(''); setShowRechargeModal(true); };
    const handleSelectAmount = useCallback(async (amount: number) => {
        setSelectedRechargeAmount(amount);
        const code = `UCOL-${amount}-${Math.floor(1000 + Math.random() * 9000)}`;
        setRechargeCode(code); setRechargeStep('SHOW_CODE');
        if (user && user.email !== 'admin@ucol.mx') {
            try { await db.collection("recharge_requests").add({ code, amount, userId: user.email, userName: user.name, status: 'PENDING', createdAt: new Date().toISOString() }); } catch (error) { }
        }
    }, [user]);
    const handleFinishRecharge = useCallback(async () => {
        setShowRechargeModal(false);
        alert(`¡Solicitud enviada! Espera a que el administrador valide tu pago.`);
    }, []);

    // --- Render Loading ---
    if (isLoadingUser) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="w-10 h-10 text-green-600 animate-spin" /></div>;

    // --- Render Auth ---
    if (!user) return (
        // ... (Same Auth Code from previous version) ...
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 font-sans transition-colors w-full">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-scale-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-8 text-center text-white relative">
                    {/* RESTORED ICON BUTTON FOR AUTH SCREEN */}
                    <button
                        onClick={toggleTheme}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors text-white"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg p-2 overflow-hidden animate-float">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Logo_de_la_Universidad_de_Colima.svg/640px-Logo_de_la_Universidad_de_Colima.svg.png"
                            alt="UCol Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Aperativo</h1>
                    <p className="text-white/80 text-sm">Cafetería Universidad de Colima</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setAuthMode('LOGIN')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${authMode === 'LOGIN' ? 'text-green-700 dark:text-green-400 border-b-2 border-green-700 dark:border-green-400' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => setAuthMode('REGISTER')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${authMode === 'REGISTER' ? 'text-green-700 dark:text-green-400 border-b-2 border-green-700 dark:border-green-400' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        Crear Cuenta
                    </button>
                </div>

                {/* Form Area */}
                <div className="p-8 bg-white dark:bg-gray-800 transition-colors">
                    {authError && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-300 text-xs p-3 rounded-lg flex items-center gap-2 animate-bounce-in">
                            <X size={14} />
                            {authError}
                        </div>
                    )}

                    {authMode === 'LOGIN' ? (
                        <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Correo Institucional</label>
                                <input type="email" placeholder="estudiante@ucol.mx" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Contraseña</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required />
                            </div>
                            <button type="submit" disabled={isAuthLoading} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 dark:shadow-none transition mt-4 flex justify-center items-center gap-2 disabled:opacity-70 active:scale-95">
                                {isAuthLoading && <Loader2 className="w-4 h-4 animate-spin" />} Entrar
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Nombre Completo</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" placeholder="Juan Pérez" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors" value={regName} onChange={e => setRegName(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Correo Institucional</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                                    <input type="email" placeholder="juan@ucol.mx" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Contraseña</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors" value={regPass} onChange={e => setRegPass(e.target.value)} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Bachillerato</label>
                                    <div className="relative">
                                        <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input type="text" placeholder="Bach 1" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-9 pr-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors" value={regSchool} onChange={e => setRegSchool(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-1/2">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Grado</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input type="text" placeholder="4°" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-9 pr-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors" value={regGrade} onChange={e => setRegGrade(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Grupo</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input type="text" placeholder="A" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-9 pr-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-400 transition-colors" value={regGroup} onChange={e => setRegGroup(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={isAuthLoading} className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition mt-4 flex justify-center items-center gap-2 active:scale-95">
                                {isAuthLoading && <Loader2 className="w-4 h-4 animate-spin" />} Registrarse
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );

    // RechargeModal and AvatarModal moved to components folder

    const MenuScreen = () => (
        <div className="pb-24 md:pb-8 space-y-6 animate-fade-in">
            {/* Search Bar */}
            <div className="sticky top-0 z-20 bg-[#f3f4f6] dark:bg-gray-950 py-2 -mx-4 px-4 md:mx-0 md:px-0 transition-colors">
                <div className="relative group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar comida (ej. Mollete, Jugo)..."
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 text-gray-800 dark:text-white transition-all group-hover:shadow-md"
                        autoFocus={activeScreen === 'MENU'}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-green-500 transition-colors" />
                </div>
            </div>

            {/* Categories */}
            <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-3">Categorías</h3>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border ${selectedCategory === cat
                                ? 'bg-green-600 text-white border-green-600 shadow-green-200 dark:shadow-none scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredItems.map(item => (
                    <FoodItem key={item.id} item={item} onAdd={addToCart} />
                ))}
                {filteredItems.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        <p>No se encontraron resultados.</p>
                        <button onClick={() => { setSelectedCategory(Category.ALL); setSearchQuery('') }} className="text-green-500 font-bold mt-2">Limpiar filtros</button>
                    </div>
                )}
            </div>
        </div>
    );

    // AdminScreen removed from here

    // --- New Screens ---
    const OrdersScreen = () => {
        const myOrders = orders;
        const active = myOrders.filter(o => o.status !== OrderStatus.COMPLETED);
        const history = myOrders.filter(o => o.status === OrderStatus.COMPLETED);

        return (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mis Pedidos</h2>

                {/* Active Orders */}
                {active.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">En proceso</h3>
                        {active.map(order => (
                            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-lg text-gray-800 dark:text-white">#{order.pickupCode || '---'}</span>
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full">{order.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} items • Total: {order.total} UC</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-sm">
                                        <Clock size={14} /> {order.pickupTime}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* History */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Historial</h3>
                        {history.length > 0 && (
                            <button onClick={handleClearHistory} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                                <Trash2 size={12} /> Limpiar
                            </button>
                        )}
                    </div>
                    {history.length === 0 && active.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Aún no tienes pedidos.</p>
                        </div>
                    )}
                    {history.map(order => (
                        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm opacity-75 grayscale hover:grayscale-0 transition-all">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-gray-700 dark:text-gray-300">#{order.pickupCode}</span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Entregado</span>
                            </div>
                            <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const ProfileScreen = () => {
        if (!user) return null;
        return (
            <div className="pb-24 animate-fade-in space-y-8 max-w-2xl mx-auto pt-8">
                {/* Profile Header */}
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <div className={`w-32 h-32 rounded-full border-4 border-white dark:border-[#1e2330] shadow-2xl flex items-center justify-center text-5xl font-bold text-gray-400 dark:text-white overflow-hidden ${user.avatar ? 'cursor-pointer' : ''}`}
                            style={{ backgroundColor: user.avatar ? 'transparent' : '#e5e7eb' }}
                            onClick={() => user.avatar && setIsAvatarZoomed(true)}>
                            {user.avatar ? (
                                <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0)
                            )}
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsAvatarModalOpen(true); }}
                            className="absolute bottom-0 right-0 bg-gray-100 dark:bg-[#2f364a] text-gray-600 dark:text-white p-2.5 rounded-full border-4 border-white dark:border-[#13161f] hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
                        >
                            <Edit3 size={16} />
                        </button>
                    </div>

                    <h2 className="mt-4 font-bold text-2xl text-gray-800 dark:text-white">{user.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{user.school || 'Administración'} • {user.group || 'Staff'}</span>
                    </div>
                    <div className="mt-2 bg-gray-200 dark:bg-[#2f364a] px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {user.email}
                    </div>
                </div>

                {/* Balance Card - Always Dark for Premium Feel */}
                <div className="bg-[#0f1218] rounded-3xl p-8 relative overflow-hidden text-center border border-gray-800 shadow-2xl">
                    <div className="absolute top-0 right-0 p-32 bg-green-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="flex items-start justify-between w-full mb-6 relative">
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                                    <Coins size={14} /> Saldo Disponible
                                </p>
                                <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{user.balance} UC</h3>
                            </div>

                            <div className="bg-[#1e2330] rounded-xl p-3 border border-gray-700 min-w-[80px]">
                                <p className="text-[10px] text-gray-400 uppercase font-bold text-center mb-1">Puntos</p>
                                <p className="text-xl font-bold text-orange-500 text-center">{user.loyaltyPoints || 0}</p>
                            </div>
                        </div>

                        <button
                            onClick={openRechargeModal}
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <QrCode size={20} /> Recargar Saldo
                        </button>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="space-y-4">
                    {/* Admin Button */}
                    {user.email === 'admin@ucol.mx' && (
                        <button onClick={() => setActiveScreen('ADMIN_PANEL')} className="w-full bg-white dark:bg-[#0f1218] hover:bg-gray-50 dark:hover:bg-[#151922] p-4 rounded-xl border border-gray-200 dark:border-blue-900/30 flex items-center justify-between group transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 dark:bg-blue-900/20 p-2.5 rounded-lg text-blue-600 dark:text-blue-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-white">Panel de Administrador</h4>
                            </div>
                            <ChevronRight className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" size={18} />
                        </button>
                    )}

                    {/* Dark Mode Toggle */}
                    <div className="w-full bg-white dark:bg-[#1e2330] p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`${theme === 'dark' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'} p-2.5 rounded-lg transition-colors`}>
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <h4 className="font-bold text-gray-800 dark:text-white">Modo Oscuro</h4>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none flex items-center ${theme === 'dark' ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Secondary Actions Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-white dark:bg-[#1e2330] hover:bg-gray-50 dark:hover:bg-[#252b3b] p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between group transition-all shadow-sm">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white text-sm">Ayuda y Soporte</h4>
                            </div>
                            <ChevronRight className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" size={16} />
                        </button>
                        <button className="bg-white dark:bg-[#1e2330] hover:bg-gray-50 dark:hover:bg-[#252b3b] p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between group transition-all shadow-sm">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white text-sm">Historial Recargas</h4>
                            </div>
                            <ChevronRight className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" size={16} />
                        </button>
                    </div>

                    {/* Logout */}
                    <button onClick={handleLogout} className="w-full bg-red-50 dark:bg-[#1a0f0f] hover:bg-red-100 dark:hover:bg-[#2a1212] p-4 rounded-xl border border-red-200 dark:border-red-900/20 flex items-center justify-center gap-2 text-red-600 dark:text-red-500 font-bold transition-colors mt-6 shadow-sm">
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </div>
        );
    };

    const HomeScreen = () => {
        const points = user?.loyaltyPoints || 0;
        const pointsTarget = 200;
        const pointsPercent = Math.min(100, (points / pointsTarget) * 100);

        return (
            <div className="space-y-6 pb-24 md:pb-8">
                {/* ... (Header & Banners same as before) ... */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Mobile Top Search */}
                        <div className="lg:hidden mt-2 relative animate-fade-in">
                            <input type="text" placeholder="¿Qué se te antoja hoy?" className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm" onClick={() => { setActiveScreen('MENU'); }} />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>

                        {/* Hero Banner (Same) */}
                        <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden mt-2 md:mt-0 min-h-[160px] md:min-h-auto flex flex-col justify-center animate-scale-in">
                            <div className="hidden md:block absolute right-[-20px] bottom-[-40px] opacity-20 transform rotate-12"><ShoppingBag size={180} /></div>
                            <div className="relative z-10 max-w-lg">
                                <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold mb-2 uppercase tracking-wide">¡Evita filas!</span>
                                <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">Hola, {user?.name.split(' ')[0]} 👋</h2>
                                <p className="mb-6 opacity-90 text-sm md:text-base leading-relaxed max-w-[80%]">Aparta tu desayuno ahora para el recreo de las 9:30.</p>
                                <button onClick={() => setActiveScreen('MENU')} className="inline-flex items-center gap-2 bg-white text-green-800 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-50 transition shadow-lg active:scale-95 transform">Ver Menú <ChevronRight size={16} /></button>
                            </div>
                        </div>

                        {/* Mobile Admin Button */}
                        {user?.email === 'admin@ucol.mx' && (
                            <div className="lg:hidden animate-slide-up">
                                <button onClick={() => setActiveScreen('ADMIN_PANEL')} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 p-1 rounded-2xl shadow-lg group relative overflow-hidden">
                                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-4"><div className="bg-white/20 p-2.5 rounded-xl shadow-inner"><ShieldCheck className="w-6 h-6 text-white" /></div><div className="text-left text-white"><h3 className="font-bold text-base">Panel Admin</h3><p className="text-blue-100 text-xs opacity-80">Gestionar cafetería</p></div></div>
                                        <div className="bg-white/20 p-2 rounded-full"><ChevronRight className="w-5 h-5 text-white" /></div>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Categories */}
                        <div className="animate-slide-up stagger-1">
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-3">Categorías</h3>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                                {CATEGORIES.filter(c => c !== Category.ALL).map((cat) => (
                                    <button key={cat} onClick={() => { setSelectedCategory(cat); setActiveScreen('MENU'); }} className="flex-shrink-0 flex items-center gap-2 pl-2 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full shadow-sm active:scale-95 transition-all">
                                        <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-sm">{cat === Category.BREAKFAST && '🍳'}{cat === Category.LUNCH && '🍔'}{cat === Category.SNACKS && '🍟'}{cat === Category.DRINKS && '🥤'}{cat === Category.HEALTHY && '🥗'}</div>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{cat}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Popular Items - Dynamic */}
                        <div className="animate-slide-up stagger-2">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2"><Flame size={18} className="text-orange-500 fill-current" /> Más pedidos</h3>
                                <button onClick={() => setActiveScreen('MENU')} className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">Ver todo</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {menuItems.filter(i => i.isPopular).slice(0, 4).map(item => (
                                    <FoodItem key={item.id} item={item} onAdd={addToCart} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block space-y-6 animate-slide-in-right">
                        {/* Rewards Widget */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-orange-100 dark:border-orange-900/30 shadow-md relative overflow-hidden group transition-colors">
                            <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Award size={120} className="text-orange-500" /></div>
                            <div className="flex justify-between items-start mb-6 relative z-10"><div><h3 className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-2 text-lg"><Gift size={20} /> Rewards</h3><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Acumula puntos y come gratis.</p></div><div className="text-right"><span className="text-4xl font-bold text-gray-800 dark:text-white">{points}</span><span className="text-xs text-gray-400 block uppercase tracking-wide">Puntos</span></div></div>
                            <div className="relative z-10 space-y-2"><div className="flex justify-between text-xs text-gray-500 mb-1 font-medium"><span>Nivel Comensal</span><span>{points}/{pointsTarget}</span></div><div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden"><div className="bg-gradient-to-r from-orange-400 to-orange-600 h-4 rounded-full shadow-sm transition-all duration-1000 ease-out" style={{ width: `${pointsPercent}%` }}></div></div><p className="text-xs text-center text-gray-400 pt-2">{points >= pointsTarget ? "¡Felicidades! Tienes una recompensa disponible." : `Solo ${pointsTarget - points} puntos más para tu premio.`}</p></div>
                        </div>
                        {/* Admin Link */}
                        {user?.email === 'admin@ucol.mx' && (
                            <button onClick={() => setActiveScreen('ADMIN_PANEL')} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-3xl shadow-lg flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-4"><div className="bg-white/20 p-3 rounded-xl"><ShieldCheck className="w-8 h-8 text-white" /></div><div className="text-left"><h3 className="font-bold text-lg">Panel Admin</h3><p className="text-blue-100 text-xs">Gestionar cafetería</p></div></div><ChevronRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                                    {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{user?.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setActiveScreen('PROFILE')} className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Ver Perfil Completo</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Layout ---
    return (
        <div className="min-h-screen w-full bg-[#f3f4f6] dark:bg-gray-950 transition-colors duration-300 flex flex-col font-sans">
            {user && (
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors supports-[backdrop-filter]:bg-white/60 animate-fade-in">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex justify-between items-center">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveScreen('HOME')}>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm border border-gray-100 group-hover:scale-105 transition-transform">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Logo_de_la_Universidad_de_Colima.svg/640px-Logo_de_la_Universidad_de_Colima.svg.png" alt="UCol Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-tight tracking-tight">Aperativo</h1>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1"><MapPin className="w-3 h-3" /><span>{user.school}</span></div>
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                            {[{ id: 'HOME', icon: Home, label: 'Inicio' }, { id: 'MENU', icon: MenuIcon, label: 'Menú' }, { id: 'ORDERS', icon: Bell, label: 'Pedidos' }].map((item) => (
                                <button key={item.id} onClick={() => setActiveScreen(item.id as Screen)} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${activeScreen === item.id ? 'bg-white dark:bg-gray-700 text-green-700 dark:text-green-400 shadow-sm scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}>
                                    <item.icon size={16} strokeWidth={2.5} /> {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <div onClick={() => setActiveScreen('PROFILE')} className="flex bg-green-50 dark:bg-green-900/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl items-center gap-2 border border-green-100 dark:border-green-800/50 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                                <Coins size={16} className="text-green-600 dark:text-green-400 sm:w-[18px] sm:h-[18px]" />
                                <span className="text-sm md:text-base font-bold text-green-800 dark:text-green-300">{user.balance.toFixed(0)}</span>
                            </div>
                            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 md:p-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all group active:scale-95">
                                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                                {cartItems.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 text-[10px] flex items-center justify-center text-white font-bold animate-pulse">{cartItems.length}</span>}
                            </button>
                            <button onClick={() => setActiveScreen('PROFILE')} className="hidden md:flex w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform overflow-hidden">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                            </button>
                        </div>
                    </div>
                </header>
            )}

            <main className={`flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 ${activeScreen === 'ADMIN_PANEL' ? '' : 'pb-24 md:pb-8'}`}>
                {activeScreen === 'HOME' && <HomeScreen />}
                {activeScreen === 'MENU' && <MenuScreen />}
                {activeScreen === 'ORDERS' && <OrdersScreen />}
                {activeScreen === 'PROFILE' && <ProfileScreen />}
                {activeScreen === 'ADMIN_PANEL' && <AdminScreen
                    orders={orders}
                    menuItems={menuItems}
                    adminTab={adminTab}
                    setAdminTab={setAdminTab}
                    adminRechargeCode={adminRechargeCode}
                    setAdminRechargeCode={setAdminRechargeCode}
                    adminFeedback={adminFeedback}
                    isAdminProcessing={isAdminProcessing}
                    isEditingItem={isEditingItem}
                    setIsEditingItem={setIsEditingItem}
                    editingItem={editingItem}
                    setEditingItem={setEditingItem}
                    setActiveScreen={setActiveScreen}
                    handleAdminRecharge={handleAdminRecharge}
                    handleUpdateOrderStatus={handleUpdateOrderStatus}
                    openEditItemModal={openEditItemModal}
                    handleSaveItem={handleSaveItem}
                    handleDeleteItem={handleDeleteItem}
                    handleLogout={handleLogout}
                />}
            </main>

            {user && (
                <nav className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex justify-between items-center fixed bottom-0 w-full z-30 transition-colors pb-safe safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-slide-up">
                    <button onClick={() => setActiveScreen('HOME')} className={`flex flex-col items-center gap-1 transition ${activeScreen === 'HOME' ? 'text-green-700 dark:text-green-400 scale-105' : 'text-gray-400 dark:text-gray-500'}`}><Home className="w-6 h-6" strokeWidth={activeScreen === 'HOME' ? 2.5 : 2} /><span className="text-[10px] font-medium">Inicio</span></button>
                    <button onClick={() => setActiveScreen('MENU')} className={`flex flex-col items-center gap-1 transition ${activeScreen === 'MENU' ? 'text-green-700 dark:text-green-400 scale-105' : 'text-gray-400 dark:text-gray-500'}`}><MenuIcon className="w-6 h-6" strokeWidth={activeScreen === 'MENU' ? 2.5 : 2} /><span className="text-[10px] font-medium">Menú</span></button>
                    <button onClick={() => setActiveScreen('ORDERS')} className={`flex flex-col items-center gap-1 transition ${activeScreen === 'ORDERS' ? 'text-green-700 dark:text-green-400 scale-105' : 'text-gray-400 dark:text-gray-500'}`}><Bell className="w-6 h-6" strokeWidth={activeScreen === 'ORDERS' ? 2.5 : 2} /><span className="text-[10px] font-medium">Pedidos</span></button>
                    <button onClick={() => setActiveScreen('PROFILE')} className={`flex flex-col items-center gap-1 transition ${activeScreen === 'PROFILE' ? 'text-green-700 dark:text-green-400 scale-105' : 'text-gray-400 dark:text-gray-500'}`}><UserIcon className="w-6 h-6" strokeWidth={activeScreen === 'PROFILE' ? 2.5 : 2} /><span className="text-[10px] font-medium">Perfil</span></button>
                </nav>
            )}

            <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                loyaltyPoints={user?.loyaltyPoints || 0}
                onUpdateQuantity={updateQuantity}
                onCheckout={handleCheckout}
            />

            <AIAssistant menuItems={menuItems} />
            <RechargeModal
                showRechargeModal={showRechargeModal}
                setShowRechargeModal={setShowRechargeModal}
                rechargeStep={rechargeStep}
                setRechargeStep={setRechargeStep}
                selectedRechargeAmount={selectedRechargeAmount}
                handleSelectAmount={handleSelectAmount}
                customRechargeInput={customRechargeInput}
                setCustomRechargeInput={setCustomRechargeInput}
                handleFinishRecharge={handleFinishRecharge}
                rechargeCode={rechargeCode}
            />
            <AvatarModal
                isAvatarModalOpen={isAvatarModalOpen}
                setIsAvatarModalOpen={setIsAvatarModalOpen}
                user={user}
                setUser={setUser}
            />
            {isAvatarZoomed && user?.avatar && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={() => setIsAvatarZoomed(false)}>
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
                    <div className="relative z-10 max-w-full max-h-full p-4 animate-scale-in flex flex-col items-center">
                        <img src={user.avatar} alt="Full Avatar" className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border-4 border-white dark:border-gray-800" />
                        <button onClick={() => setIsAvatarZoomed(false)} className="mt-6 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full backdrop-blur-md transition-colors flex items-center gap-2 font-medium">
                            <X size={20} /> Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default App;