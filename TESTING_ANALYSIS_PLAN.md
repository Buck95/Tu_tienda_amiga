# 📊 ANÁLISIS DE COBERTURA Y PLAN DE PRUEBAS UNITARIAS
## Proyecto: Tu Tienda Amiga
**Objetivo Académico:** Alcanzar 85% de Code Coverage con Jest

---

## 🎯 FASE 1: IDENTIFICACIÓN DE ARCHIVOS CRÍTICOS

### FRONTEND (React) - Archivos Prioritarios
**4 archivos principales con mayor lógica de negocio:**

#### 1️⃣ **App.js** (Líneas: 286) ⭐ MÁXIMA PRIORIDAD
- **Impacto de Cobertura:** 25-30%
- **Lógica de Negocio Crítica:**
  - Gestión completa del carrito de compras
  - Cálculo de totales e items
  - Procesamiento de compra (pedidos)
  - Autenticación y enrutamiento
  - Persistencia de tema en localStorage
  - Control de visualización por rol

- **Complejidad:** ALTA (múltiples estados, lógica condicional)
- **Dependencias:** axios, localStorage, React hooks (useState, useEffect)

---

#### 2️⃣ **Admin.js** (Líneas: 373) ⭐ ALTA PRIORIDAD
- **Impacto de Cobertura:** 20-25%
- **Lógica de Negocio Crítica:**
  - CRUD de productos (crear, editar, eliminar)
  - Manejo de formularios (validación, limpieza)
  - Carga de imágenes (preview, reset)
  - Estadísticas de ventas
  - Historial de pedidos y detalles
  - Filtrado y formateo de datos

- **Complejidad:** ALTA (múltiples tabs, estados anidados)
- **Dependencias:** axios, FormData, URL.createObjectURL

---

#### 3️⃣ **Login.js** (Líneas: 130) ⭐ MEDIA-ALTA PRIORIDAD
- **Impacto de Cobertura:** 10-15%
- **Lógica de Negocio Crítica:**
  - Validación de credenciales en login
  - Registro de nuevos usuarios
  - Alternancia entre modo login/registro
  - Persistencia de token y usuario en localStorage
  - Manejo de errores de autenticación

- **Complejidad:** MEDIA (flujos condicionales lineales)
- **Dependencias:** axios, localStorage

---

#### 4️⃣ **AdminLogin.js** (Líneas: 140) ⭐ MEDIA-ALTA PRIORIDAD
- **Impacto de Cobertura:** 8-12%
- **Lógica de Negocio Crítica:**
  - Login de administrador con validación de rol
  - Registro de admin con clave secreta
  - Rechazo de usuarios sin permisos
  - Alternancia entre modo login/registro

- **Complejidad:** MEDIA (flujos condicionales, validación de rol)
- **Dependencias:** axios, localStorage

---

### BACKEND (Node.js/Express) - Archivos Prioritarios
**3 archivos principales con mayor lógica de negocio:**

#### 1️⃣ **auth.controller.js** (Líneas: 103) ⭐ MÁXIMA PRIORIDAD
- **Impacto de Cobertura:** 20-25%
- **Lógica de Negocio Crítica:**
  - Registro de usuarios (validación de email duplicado)
  - Registro de admin con validación de secretKey
  - Login con verificación de contraseña
  - Generación de JWT
  - Hashing de contraseñas con bcrypt
  - Manejo de errores de base de datos

- **Complejidad:** ALTA (criptografía, BD, JWTs)
- **Dependencias:** bcrypt, jsonwebtoken, pg (Pool)
- **Casos de Error:** Email duplicado (code 23505), contraseña inválida, admin inválido

---

#### 2️⃣ **productos.controller.js** (Líneas: 64) ⭐ ALTA PRIORIDAD
- **Impacto de Cobertura:** 18-22%
- **Lógica de Negocio Crítica:**
  - Obtención de productos (order by)
  - Creación de producto (validación de nombre/precio)
  - Actualización de producto (con/sin imagen)
  - Eliminación de producto
  - Manejo de imágenes (multer)
  - Normalización de datos (null defaults)

- **Complejidad:** MEDIA-ALTA (CRUD, manejo de archivos)
- **Dependencias:** pg (Pool), multer

---

#### 3️⃣ **pedidos.controller.js** (Líneas: 104) ⭐ ALTA PRIORIDAD
- **Impacto de Cobertura:** 18-22%
- **Lógica de Negocio Crítica:**
  - Creación de pedido y detalle_pedido
  - Cálculo de totales
  - Obtención de ventas con JOIN
  - Obtener detalle de pedido
  - Estadísticas (totales, conteos, stock bajo)
  - Agregaciones y COALESCE en SQL

- **Complejidad:** ALTA (múltiples inserts, agregaciones SQL)
- **Dependencias:** pg (Pool), lógica transaccional

---

---

## 📋 FASE 2: PLAN DETALLADO DE PRUEBAS POR ARCHIVO

### FRONTEND TEST PLAN

---

### **App.js - Test Suite**
**Estimado: 25-30 test cases**

#### **SECCIÓN 1: Gestión del Carrito**
```
✓ HAPPY PATH: Agregar producto al carrito vacío
✓ HAPPY PATH: Agregar producto existente (incrementa cantidad)
✓ HAPPY PATH: Calcular total correctamente
✓ HAPPY PATH: Calcular totalItems correctamente
✓ EDGE CASE: Intentar agregar producto con precio "0"
✓ EDGE CASE: Intentar agregar producto con precio negativo
✓ EDGE CASE: Carrito con múltiples productos diferentes
✓ HAPPY PATH: Eliminar producto del carrito
✓ HAPPY PATH: Sumar cantidad a producto
✓ HAPPY PATH: Restar cantidad (no menor a 1)
✓ EDGE CASE: Intentar restar cuando cantidad = 1 (no cambia)
✓ EDGE CASE: Carrito vacío después de eliminar último producto
```

#### **SECCIÓN 2: Procesamiento de Compra**
```
✓ HAPPY PATH: Procesar compra exitosa
✓ HAPPY PATH: Limpiar carrito después de compra
✓ HAPPY PATH: Mostrar mensaje de éxito por 2.5s
✓ HAPPY PATH: Cerrar drawer después de compra
✓ EDGE CASE: Intentar comprar con carrito vacío
✓ ERROR CASE: Manejo de error en axios.post
✓ EDGE CASE: Usuario no autenticado intenta comprar
```

#### **SECCIÓN 3: Obtención de Productos**
```
✓ HAPPY PATH: Obtener productos del backend
✓ HAPPY PATH: Renderizar listado de productos
✓ EDGE CASE: Respuesta vacía del backend
✓ ERROR CASE: Error en obtención de productos
```

#### **SECCIÓN 4: Persistencia de Datos**
```
✓ HAPPY PATH: Guardar tema en localStorage
✓ HAPPY PATH: Cargar tema del localStorage
✓ HAPPY PATH: Toggle de tema light ↔ dark
✓ HAPPY PATH: Logout borra localStorage
```

#### **SECCIÓN 5: Autenticación y Enrutamiento**
```
✓ HAPPY PATH: Usuario autenticado ve tienda
✓ HAPPY PATH: Admin autenticado ve panel
✓ HAPPY PATH: Sin autenticación redirige a Login
✓ EDGE CASE: Usuario con rol inválido
```

---

### **Admin.js - Test Suite**
**Estimado: 22-28 test cases**

#### **SECCIÓN 1: Gestión de Productos (CRUD)**
```
✓ HAPPY PATH: Crear producto con todos los campos
✓ HAPPY PATH: Crear producto sin descripción
✓ HAPPY PATH: Crear producto sin imagen
✓ EDGE CASE: Crear sin nombre (debe fallar)
✓ EDGE CASE: Crear sin precio (debe fallar)
✓ EDGE CASE: Precio "0" o negativo (validación)
✓ HAPPY PATH: Editar producto existente
✓ HAPPY PATH: Editar solo nombre de producto
✓ HAPPY PATH: Editar con nueva imagen
✓ HAPPY PATH: Editar sin cambiar imagen
✓ HAPPY PATH: Eliminar producto con confirmación
✓ EDGE CASE: Intenta eliminar sin confirmar
✓ HAPPY PATH: Cancelar edición limpia formulario
```

#### **SECCIÓN 2: Manejo de Imágenes**
```
✓ HAPPY PATH: Seleccionar imagen genera preview
✓ HAPPY PATH: Cambiar imagen reemplaza preview
✓ HAPPY PATH: Remover imagen limpia preview
✓ EDGE CASE: Seleccionar archivo no imagen
✓ EDGE CASE: Cancelar selección de archivo
```

#### **SECCIÓN 3: Estadísticas y Ventas**
```
✓ HAPPY PATH: Obtener estadísticas en mount
✓ HAPPY PATH: Mostrar total de ventas
✓ HAPPY PATH: Mostrar total de pedidos
✓ HAPPY PATH: Mostrar total de productos
✓ HAPPY PATH: Ver detalle de pedido
✓ HAPPY PATH: Cerrar detalle de pedido
✓ EDGE CASE: Sin ventas registradas
✓ EDGE CASE: Error cargando estadísticas (fallback)
```

#### **SECCIÓN 4: Validación de Formulario**
```
✓ HAPPY PATH: Validar campos requeridos
✓ HAPPY PATH: Limpiar formulario correctamente
✓ EDGE CASE: Enviar formulario vacío
```

---

### **Login.js - Test Suite**
**Estimado: 12-15 test cases**

#### **SECCIÓN 1: Autenticación**
```
✓ HAPPY PATH: Login con credenciales válidas
✓ HAPPY PATH: Email y contraseña se guardan en localStorage
✓ HAPPY PATH: Token se guarda correctamente
✓ EDGE CASE: Login con email vacío
✓ EDGE CASE: Login con contraseña vacío
✓ ERROR CASE: Email no registrado
✓ ERROR CASE: Contraseña incorrecta
✓ ERROR CASE: Respuesta de error sin mensaje
```

#### **SECCIÓN 2: Registro de Usuario**
```
✓ HAPPY PATH: Registro con todos los datos
✓ HAPPY PATH: Toggle entre Login y Registro
✓ EDGE CASE: Email duplicado (error 23505)
✓ EDGE CASE: Registro con campos vacíos
✓ HAPPY PATH: Limpia contraseña después de registro
```

#### **SECCIÓN 3: UI y Persistencia**
```
✓ HAPPY PATH: Cargar tema del localStorage
✓ HAPPY PATH: Toggle de tema funciona
```

---

### **AdminLogin.js - Test Suite**
**Estimado: 12-15 test cases**

#### **SECCIÓN 1: Autenticación Admin**
```
✓ HAPPY PATH: Login admin con credenciales válidas
✓ HAPPY PATH: Rechazar usuario no-admin
✓ HAPPY PATH: Guardar token y usuario en localStorage
✓ EDGE CASE: Email no registrado
✓ EDGE CASE: Contraseña incorrecta
✓ ERROR CASE: Usuario regular intenta login admin
```

#### **SECCIÓN 2: Registro de Admin**
```
✓ HAPPY PATH: Registro admin con secretKey válida
✓ HAPPY PATH: Rechazar secretKey incorrecta
✓ EDGE CASE: Email duplicado
✓ EDGE CASE: SecretKey vacía
✓ HAPPY PATH: Limpiar formulario después de registro
```

#### **SECCIÓN 3: Navegación**
```
✓ HAPPY PATH: Toggle entre Login y Registro
✓ HAPPY PATH: Link para volver a tienda
✓ HAPPY PATH: Cargar tema del localStorage
```

---

### BACKEND TEST PLAN

---

### **auth.controller.js - Test Suite**
**Estimado: 20-25 test cases**

#### **SECCIÓN 1: Registro de Usuario (register)**
```
✓ HAPPY PATH: Usuario se registra correctamente
✓ HAPPY PATH: Contraseña se hashea con bcrypt
✓ HAPPY PATH: Usuario se guarda en BD
✓ EDGE CASE: Email duplicado (error 23505)
✓ EDGE CASE: Campo nombre vacío
✓ EDGE CASE: Campo email vacío
✓ EDGE CASE: Campo contraseña vacío
✓ EDGE CASE: Email con formato inválido
✓ EDGE CASE: Contraseña muy corta
✓ ERROR CASE: Error en conexión BD
```

#### **SECCIÓN 2: Registro Admin (registerAdmin)**
```
✓ HAPPY PATH: Admin se registra con secretKey válida
✓ HAPPY PATH: SecretKey = 'admin123' es válida
✓ HAPPY PATH: Contraseña se hashea
✓ HAPPY PATH: Rol se establece a 'admin'
✓ EDGE CASE: SecretKey incorrecta → 403
✓ EDGE CASE: SecretKey vacía → 403
✓ EDGE CASE: Email duplicado → 400
✓ ERROR CASE: Error en BD → 500
```

#### **SECCIÓN 3: Login (login)**
```
✓ HAPPY PATH: Login exitoso con email y contraseña válida
✓ HAPPY PATH: JWT se genera correctamente
✓ HAPPY PATH: Token expira en 1 hora
✓ HAPPY PATH: Usuario retorna sin contraseña
✓ HAPPY PATH: Usuario retorna rol correctamente
✓ EDGE CASE: Email no registrado → 400
✓ EDGE CASE: Contraseña incorrecta → 400
✓ EDGE CASE: Email vacío
✓ EDGE CASE: Contraseña vacío
✓ ERROR CASE: Error en BD → 500
```

#### **SECCIÓN 4: Hashing y Criptografía**
```
✓ HAPPY PATH: bcrypt.hash genera hash diferente cada vez
✓ HAPPY PATH: bcrypt.compare valida contraseña correcta
✓ EDGE CASE: bcrypt.compare rechaza contraseña incorrecta
```

---

### **productos.controller.js - Test Suite**
**Estimado: 18-24 test cases**

#### **SECCIÓN 1: Obtener Productos (getProductos)**
```
✓ HAPPY PATH: Obtiene todos los productos
✓ HAPPY PATH: Productos ordenados DESC por id
✓ EDGE CASE: Base de datos vacía (array vacío)
✓ EDGE CASE: Múltiples productos
✓ ERROR CASE: Error en consulta SQL → 500
✓ HAPPY PATH: Imagen se incluye en respuesta
✓ HAPPY PATH: Descripción se incluye en respuesta
```

#### **SECCIÓN 2: Crear Producto (crearProducto)**
```
✓ HAPPY PATH: Producto se crea correctamente
✓ HAPPY PATH: Nombre y precio son obligatorios
✓ HAPPY PATH: Descripción es opcional
✓ HAPPY PATH: Imagen se guarda (multer)
✓ HAPPY PATH: Stock default a 0 si no se proporciona
✓ EDGE CASE: Sin nombre → error
✓ EDGE CASE: Sin precio → error
✓ EDGE CASE: Precio = 0
✓ EDGE CASE: Precio negativo
✓ EDGE CASE: Stock negativo → default a 0
✓ ERROR CASE: Error en inserción BD → 500
```

#### **SECCIÓN 3: Actualizar Producto (actualizarProducto)**
```
✓ HAPPY PATH: Actualizar con nueva imagen
✓ HAPPY PATH: Actualizar sin imagen
✓ HAPPY PATH: Solo actualizar precio
✓ HAPPY PATH: Solo actualizar descripción
✓ EDGE CASE: Producto no existe
✓ EDGE CASE: ID inválido
✓ ERROR CASE: Error en consulta update → 500
```

#### **SECCIÓN 4: Eliminar Producto (eliminarProducto)**
```
✓ HAPPY PATH: Producto se elimina correctamente
✓ EDGE CASE: Eliminar producto no existente
✓ EDGE CASE: ID inválido
✓ ERROR CASE: Error en consulta delete → 500
```

---

### **pedidos.controller.js - Test Suite**
**Estimado: 20-26 test cases**

#### **SECCIÓN 1: Crear Pedido (crearPedido)**
```
✓ HAPPY PATH: Pedido se crea correctamente
✓ HAPPY PATH: Detalle_pedido se crea para cada item
✓ HAPPY PATH: Total se guarda correctamente
✓ HAPPY PATH: Múltiples items en carrito
✓ EDGE CASE: Carrito con 1 item
✓ EDGE CASE: Carrito vacío → error
✓ EDGE CASE: Total = 0
✓ EDGE CASE: Total negativo (posible error de cálculo)
✓ ERROR CASE: Usuario_id inválido
✓ ERROR CASE: Error en inserción de pedido → 500
✓ ERROR CASE: Error en inserción de detalle → 500 (rollback)
```

#### **SECCIÓN 2: Obtener Ventas (obtenerVentas)**
```
✓ HAPPY PATH: Obtener todas las ventas
✓ HAPPY PATH: Incluye nombre del cliente
✓ HAPPY PATH: Incluye email del cliente
✓ HAPPY PATH: Ordenadas DESC por id
✓ HAPPY PATH: Máximo 50 registros (LIMIT)
✓ EDGE CASE: Sin ventas registradas (array vacío)
✓ EDGE CASE: Pedido con usuario_id NULL (LEFT JOIN)
✓ ERROR CASE: Error en consulta → retorna array vacío
```

#### **SECCIÓN 3: Obtener Detalle de Pedido (obtenerDetallePedido)**
```
✓ HAPPY PATH: Obtener detalle de pedido específico
✓ HAPPY PATH: Cantidad correcta para cada item
✓ HAPPY PATH: Precio correcto para cada item
✓ HAPPY PATH: Nombre del producto
✓ EDGE CASE: Pedido sin detalles
✓ EDGE CASE: Producto eliminado → nombre NULL
✓ EDGE CASE: ID de pedido inválido
✓ ERROR CASE: Error en consulta → retorna array vacío
```

#### **SECCIÓN 4: Obtener Estadísticas (obtenerEstadisticas)**
```
✓ HAPPY PATH: Calcula totalVentas correctamente
✓ HAPPY PATH: Cuenta totalPedidos correctamente
✓ HAPPY PATH: Cuenta totalProductos correctamente
✓ HAPPY PATH: Calcula stockBajo (1-5)
✓ HAPPY PATH: Calcula sinStock (0)
✓ EDGE CASE: Sin pedidos → totalVentas = 0 (COALESCE)
✓ EDGE CASE: Sin productos
✓ EDGE CASE: Todos los productos con stock > 5
✓ ERROR CASE: Error en cualquier agregación → retorna defaults
```

---

---

## 🎯 FASE 3: MÉTRICAS ESPERADAS DE COBERTURA

| Archivo | Líneas | Coverage Esperado | Contribución |
|---------|--------|------------------|--------------|
| **App.js** | 286 | 85-90% | 28% |
| **Admin.js** | 373 | 80-85% | 22% |
| **Login.js** | 130 | 88-92% | 12% |
| **AdminLogin.js** | 140 | 86-90% | 10% |
| **auth.controller.js** | 103 | 90-95% | 22% |
| **productos.controller.js** | 64 | 88-92% | 20% |
| **pedidos.controller.js** | 104 | 87-92% | 20% |
| **TOTAL FRONTEND** | 929 | **84-89%** | **72%** |
| **TOTAL BACKEND** | 271 | **88-93%** | **62%** |
| **PROYECTO COMPLETO** | 1200 | **85-90%** | **100%** |

---

## 📦 DEPENDENCIAS PARA TESTING

### Frontend (Jest + React Testing Library)
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.0.0",
    "axios-mock-adapter": "^1.21.0",
    "jest-mock-extended": "^3.0.0"
  }
}
```

### Backend (Jest + supertest)
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "jest-mock-extended": "^3.0.0"
  }
}
```

---

## ✅ CHECKLIST DE VALIDACIÓN

**Antes de empezar el testing:**
- [ ] Jest está instalado en ambos proyectos
- [ ] setupTests.js está configurado
- [ ] Variables de entorno están documentadas
- [ ] Mock de axios está disponible
- [ ] Mock de bcrypt está disponible
- [ ] Pool de BD está mockeado
- [ ] localStorage está mockeado

**Durante el testing:**
- [ ] Cada test es independiente
- [ ] No hay tests anidados (describe > it > test)
- [ ] Mocks se limpian después de cada test
- [ ] Esperas explícitas (await, waitFor)
- [ ] Assertions claras y específicas

**Después del testing:**
- [ ] Coverage >= 85%
- [ ] Todos los tests pasan
- [ ] No hay warnings en consola
- [ ] No hay memory leaks
- [ ] Documentación actualizada

---

## 🚀 PRÓXIMOS PASOS

1. **Validar este análisis** ✋ (Esperar tu aprobación)
2. **Instalar dependencias de testing**
3. **Crear archivos base de test** (describe bloques)
4. **Implementar tests en orden:**
   - Fase 1: auth.controller.js (Backend)
   - Fase 2: productos.controller.js (Backend)
   - Fase 3: pedidos.controller.js (Backend)
   - Fase 4: Login.js (Frontend)
   - Fase 5: AdminLogin.js (Frontend)
   - Fase 6: Admin.js (Frontend)
   - Fase 7: App.js (Frontend)
5. **Validar cobertura incremental**
6. **Ajustar según necesidad**

---

**Documento preparado por:** Senior QA Automation Engineer  
**Fecha:** 2026-06-07  
**Objetivo:** 85% Code Coverage con Jest
