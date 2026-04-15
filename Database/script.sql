-- Crear tablas
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'cliente'
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL,
  tienda_id INTEGER -- Referencia a una tienda (asumiendo que existe externamente o se creará luego)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(20) DEFAULT 'pendiente'
);

CREATE TABLE IF NOT EXISTS detalle_pedidos (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id),
  producto_id INTEGER REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL
);

-- Insertar datos iniciales
INSERT INTO productos (nombre, descripcion, precio, stock, tienda_id)
VALUES 
('Arroz', 'Arroz blanco 1kg', 2000, 20, 1),
('Leche', 'Leche entera', 3000, 15, 1),
('Pan', 'Pan fresco', 1000, 30, 1);

INSERT INTO usuarios (nombre, email, contraseña, rol)
VALUES (
  'Camilo',
  'camilo@gmail.com',
  '$2b$10$wH9jQ9QXJ5YyWQ3WzU1Qhe9Z6VhU0p2FzXQzX7kF3F8gK1Z7kQ1eG',
  'cliente'
);
