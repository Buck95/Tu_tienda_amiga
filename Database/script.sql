
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
