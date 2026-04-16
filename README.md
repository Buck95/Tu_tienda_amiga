# 🛒 Tu Tienda Amiga

Sistema web de comercio electrónico desarrollado con arquitectura cliente-servidor, que permite a los usuarios explorar productos, agregarlos a un carrito y realizar compras, mientras que un administrador puede gestionar productos y visualizar ventas.

---

# 🚀 Tecnologías utilizadas

## 🔹 Frontend

* React.js
* Axios
* CSS

## 🔹 Backend

* Node.js
* Express.js
* JWT (Autenticación)

## 🔹 Base de datos

* PostgreSQL

---

# 🧠 Arquitectura

El sistema sigue una arquitectura **cliente-servidor**:

Frontend (React) → Backend (Express) → Base de datos (PostgreSQL)

---

# 📁 Estructura del proyecto

```
Tu_tienda_amiga/
│
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db.js
│   │   └── app.js
│   └── package.json
│
├── Frontend/
│   └── src/
│       ├── App.js
│       ├── Admin.js
│       ├── Login.js
│       └── App.css
│
└── script.sql
```

---

# ⚙️ Requisitos previos

Antes de ejecutar el proyecto debes tener instalado:

* Node.js
* PostgreSQL
* Git

---

# 🗄️ Configuración de la base de datos

1. Crear una base de datos en PostgreSQL (ejemplo: `tienda_db`)

2. Ejecutar el archivo:

```
script.sql
```

3. Verificar que existan las tablas:

* usuarios
* productos
* pedidos
* detalle_pedido

---

# ▶️ Ejecución del Backend

1. Entrar a la carpeta:

```
cd Backend
```

2. Instalar dependencias:

```
npm install
```

3. Ejecutar servidor:

```
node src/app.js
```

El backend se ejecuta en:

```
http://localhost:3000
```

---

# 💻 Ejecución del Frontend

1. Abrir otra terminal

2. Entrar a la carpeta:

```
cd Frontend
```

3. Instalar dependencias:

```
npm install
```

4. Ejecutar aplicación:

```
npm start
```

El frontend se ejecuta en:

```
http://localhost:3001
```

---

# 🔑 Funcionalidades principales

## 👤 Usuario

* Registro e inicio de sesión
* Visualización de productos
* Carrito de compras
* Realización de pedidos
* Mensaje de confirmación de compra

## ⚙️ Administrador

* Crear productos (con imagen)
* Visualizar lista de productos
* Ver historial de ventas

---

# 🔄 Flujo del sistema

1. El usuario inicia sesión
2. Explora productos
3. Agrega al carrito
4. Realiza la compra
5. El backend guarda el pedido en la base de datos
6. Se muestra mensaje de confirmación

---

# 🧪 Pruebas con Postman (opcional)

Puedes probar el backend con:

* POST /api/auth/login
* POST /api/auth/register
* GET /api/productos
* POST /api/pedidos

---

# ⚠️ Problemas comunes

## ❌ Error de conexión

* Verificar que el backend esté corriendo en el puerto 3000

## ❌ Error PostgreSQL (password failed)

* Revisar credenciales en `db.js`

## ❌ Error Foreign Key

* Verificar que el usuario exista en la tabla `usuarios`


