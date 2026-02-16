
export enum Category {
    ALL = 'Todos',
    BREAKFAST = 'Desayuno',
    LUNCH = 'Comida',
    SNACKS = 'Snacks',
    DRINKS = 'Bebidas',
    HEALTHY = 'Saludable'
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: Category;
    image: string;
    calories?: number;
    prepTime: number; // in minutes
    isPopular?: boolean;
}

export interface CartItem extends MenuItem {
    quantity: number;
    note?: string;
}

export enum OrderStatus {
    PENDING = 'Pendiente',
    PREPARING = 'Preparando',
    READY = 'Listo',
    COMPLETED = 'Entregado'
}

export enum PickupTime {
    NOW = 'Lo antes posible',
    RECESS = 'Recreo (9:30 AM)',
    CUSTOM = 'Hora Personalizada'
}

export interface Order {
    id: string;
    items: CartItem[];
    total: number;        // Final amount paid by user
    subtotal?: number;    // Total value of items before discount
    discount?: number;    // Amount discounted
    pointsEarned?: number;
    pointsRedeemed?: number;
    status: OrderStatus;
    date: string;
    pickupTime: string; // Changed to string to support custom times
    userId?: string;
    pickupCode?: string; // New field for the "Direct Pickup" code
    paymentMethod?: 'CASH' | 'COINS'; // New field for payment type
}

export type Screen = 'HOME' | 'MENU' | 'CART' | 'PROFILE' | 'ORDERS' | 'ADMIN_PANEL';

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
}

export interface User {
    name: string;
    email: string;
    school: string; // Bachillerato
    grade: string;
    group: string;
    balance: number;
    loyaltyPoints?: number; // Points accumulated for free meal
    avatar?: string; // Avatar URL or emoji
}