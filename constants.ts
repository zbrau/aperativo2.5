import { Category, MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
    {
        id: '1',
        name: 'Chilaquiles Rojos',
        description: 'Totopos bañados en salsa roja casera, con crema, queso fresco, cebolla y frijoles.',
        price: 55,
        category: Category.BREAKFAST,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Portada-chilaquiles-rojos.jpg/640px-Portada-chilaquiles-rojos.jpg',
        calories: 600,
        prepTime: 15,
        isPopular: true
    },
    {
        id: '2',
        name: 'Pizzeta',
        description: 'Mini pizza individual con salsa de tomate, queso mozzarella y pepperoni.',
        price: 35,
        category: Category.LUNCH,
        image: 'https://imgs.search.brave.com/1k_qDMgonIMohrZ5oN5_KdLIDUII8CrvarNYRZwzucw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2QyL2U2/L2ViL2QyZTZlYjA2/N2Y1M2NkNjY0ZmZi/YWZkZTEwNTlkMjk2/LmpwZw',
        calories: 400,
        prepTime: 12,
        isPopular: true
    },
    {
        id: '6',
        name: 'Torta de Adobada',
        description: 'Bolillo crujiente con carne de cerdo adobada, aguacate, crema y vegetales frescos.',
        price: 45,
        category: Category.LUNCH,
        image: 'https://imgs.search.brave.com/QgokHxwqmFbkBWuXvz0UZDlpD2P5SpAGmYmVRX0Ot_U/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9sYWdy/YW5kZW1leGljYW5h/ZGVsaXZlcnkuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI1/LzA3L0FET0JBREEt/VE9SVEEtc2NhbGVk/LmpwZw',
        calories: 550,
        prepTime: 10,
        isPopular: true
    },
    {
        id: '3',
        name: 'Jugo de Naranja',
        description: 'Recién exprimido, 500ml.',
        price: 25,
        category: Category.DRINKS,
        image: 'https://imgs.search.brave.com/1PQjygHG1Z1nAebXr85AiQf8mhbqJpzmAuvtJXQCFPg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/Zm90b3MtcHJlbWl1/bS9qdWdvLW5hcmFu/amEtbmFyYW5qYS1z/b2JyZS1mb25kby1t/YWRlcmFfMjk0ODkt/NTMuanBnP3NlbXQ9/YWlzX2h5YnJpZCZ3/PTc0MCZxPTgw',
        calories: 120,
        prepTime: 2,
        isPopular: true
    },
    {
        id: '4',
        name: 'Agua de Piña',
        description: 'Agua fresca natural de piña. 500ml.',
        price: 20,
        category: Category.DRINKS,
        image: 'https://imgs.search.brave.com/oG-_ZOFiRhla_xUeSW5_QeWS4sD1lSl79q6e2xhD1UU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbm1h/bWFtYWdnaWVza2l0/Y2hlbi5jb20vd3At/Y29udGVudC91cGxv/YWRzLzIwMjIvMDcv/UGluZWFwcGxlLUFn/dWEtRnJlc2NhLS03/NDV4MTAyNC5qcGc',
        calories: 140,
        prepTime: 1,
        isPopular: true
    },
    {
        id: '5',
        name: 'Agua de Jamaica',
        description: 'Infusión refrescante de flor de jamaica natural. 500ml.',
        price: 20,
        category: Category.DRINKS,
        image: 'https://imgs.search.brave.com/bClX_IbBLVS6jBrBVw_FB3cEoNQa7N9Kqm2UkFKlRZk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ibG9n/LnBpemNhZGVzYWJv/ci5jb20vd3AtY29u/dGVudC91cGxv/YWRzLzIwMTcvMDkv/QWd1YS1kZS1qYW1h/aWNhLTEuanBn',
        calories: 110,
        prepTime: 1,
        isPopular: true
    }
];

export const CATEGORIES = Object.values(Category);