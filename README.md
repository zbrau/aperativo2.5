# - Snack UDC

Aplicación web de pedidos para la cafetería de la Universidad de Colima (UDC). Permite a los alumnos pedir comida desde su dispositivo, pagar con saldo virtual y recibir su pedido sin hacer fila.

---

## - Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **React 19 + TypeScript** | Framework principal |
| **Vite** | Bundler y dev server |
| **Firebase / Firestore** | Base de datos en tiempo real y autenticación |
| **Tailwind CSS** | Estilos (via CDN en dev, Vite build en prod) |
| **Lucide React** | Iconografía |


---

## -- Funcionalidades

### - Para el usuario
- **Autenticación** — Registro e inicio de sesión con selección de bachillerato
- **Menú** — Explorar platillos por categoría (Desayuno, Comida, Snacks, Bebidas, Saludable) con buscador en tiempo real
- **Variantes** — Elegir la variante de un platillo antes de agregar al carrito
- **Notas por ítem** — Instrucciones especiales por platillo (ej. "sin cebolla")
- **Carrito** — Gestión de pedido con hora de recojo (ahorita, recreo o personalizada)
- **Pago dual** — Pagar con **Ucol Coins** (saldo virtual) o en **efectivo** al recoger
- **Pedidos de otros bachilleratos** — Ver y ordenar desde el menú de cualquier plantel
- **Seguimiento de pedido** — Pantalla de pedidos activos con código de recojo y estado en tiempo real
- **Historial** — Revisar pedidos anteriores con detalle de ítems
- **Rewards** — Sistema de puntos de lealtad; acumula 200 pts y obtiene `-100 UC` de descuento
- **Recargas** — Solicitar recarga de Ucol Coins mediante código
- **Favoritos** — Marcar platillos favoritos para acceso rápido
- **Perfil** — Avatar personalizable, historial de recargas, info de cuenta
- **Modo oscuro/claro** — Toggle de tema persistente
- **PWA** — Instalable en móvil como app nativa

### -- Para el administrador
- **Selección de plantel** — El admin elige qué bachillerato gestionar
- **Pedidos activos** — Vista tipo cocina con tarjetas en tiempo real; marcar como Listo o Entregado
- **Nombre del cliente** — Cada pedido muestra el nombre de quien pidió y su plantel de origen
- **Historial** — Tabla de todos los pedidos completados o cancelados
- **Recargas** — Aprobar solicitudes de recarga de saldo con código
- **Gestión de menú** — Crear, editar y eliminar platillos (nombre, precio, categoría, imagen, variantes)
- **📊 Estadísticas** — Dashboard con:
  - Pedidos del día y entregados
  - Ingresos totales del día
  - Desglose por método de pago (Coins vs Efectivo)
  - Top 5 platillos más pedidos (barras de progreso)
  - Estado de pedidos del día (Pendientes / Listos / Entregados)

---

##  Estructura del Proyecto

```
apera2.0/
├── App.tsx                  # Componente raíz — estado global, lógica de negocio y routing
├── types.ts                 # Tipos TypeScript (MenuItem, Order, CartItem, etc.)
├── constants.ts             # Datos iniciales del menú y lista de bachilleratos
├── index.tsx                # Entry point
├── index.html               # HTML base con meta PWA
├── components/
│   ├── AdminScreen.tsx      # Panel de administración completo
│   ├── Cart.tsx             # Carrito lateral con notas y checkout
│   ├── FoodItem.tsx         # Tarjeta de platillo con variantes y favoritos
│   ├── AIAssistant.tsx      # Asistente de IA (Google GenAI)
│   ├── RechargeModal.tsx    # Modal de solicitud de recarga
│   ├── HelpModal.tsx        # Modal de ayuda y soporte
│   └── RechargeHistory.tsx  # Historial de recargas del usuario
├── vite.config.ts
└── package.json
```

---

##  Modelo de Datos (Firestore)

### `users/{email}`
```ts
{ name, email, balance, school, loyaltyPoints, avatar?, rechargeHistory[] }
```

### `orders/{id}`
```ts
{ id, userId, userName, userSchool, school, items[], total, subtotal, discount,
  paymentMethod, status, pickupTime, pickupCode, date, timestamp, pointsEarned }
```

### `menuItems/{id}`
```ts
{ id, name, description, price, category, image, school, varieties[], prepTime, calories? }
```

### `pendingRecharges/{id}`
```ts
{ id, userId, amount, code, status, timestamp }
```

---

##  Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build
```


---

##  Despliegue

El proyecto está configurado para **Vercel**.

| Campo | Valor |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

##  Variables de Entorno



```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_GEMINI_API_KEY=...
```

---

## 📱 Bachilleratos Soportados

La aplicación cubre todos los planteles de la **Universidad de Colima** organizados por campus, configurados en `constants.ts`.
