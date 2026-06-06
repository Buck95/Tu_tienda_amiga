CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  contraseña VARCHAR(255),
  rol VARCHAR(50)
);

CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT,
  precio DECIMAL(10, 2),
  stock INT,
  imagen VARCHAR(255),
  tienda_id INT
);

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  total DECIMAL(10, 2),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INT REFERENCES productos(id),
  cantidad INT,
  precio DECIMAL(10, 2)
);

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
