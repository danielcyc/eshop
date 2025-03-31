CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    image TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO products (name, type, image, price, description) VALUES
('MacBook Pro', 'Laptop', 'https://static.ffx.io/images/$zoom_0.552%2C$multiply_0.5855%2C$ratio_1.776846%2C$width_1059%2C$x_0%2C$y_0/t_crop_custom/q_86%2Cf_auto/db8efb1bf14e602545fd24664a3f439753391b13', 1999.99, 'High-performance laptop from Apple'),
('iPhone 15', 'Smartphone', 'https://imageio.forbes.com/specials-images/imageserve/65028cd661259a2de79fe77b/Apple-iPhone-15-lineup-color-lineup-geo-230912/960x0.jpg?format=jpg&width=960', 999.99, 'Latest iPhone with advanced features'),
('Samsung Galaxy S23', 'Smartphone', 'https://images.samsung.com/sg/smartphones/galaxy-s23/buy/kv_combo_MO_v2.jpg?imbypass=true', 899.99, 'Flagship Android smartphone'),
('Sony WH-1000XM5', 'Headphones', 'https://openbox.ca/cdn/shop/files/0_f25c36d5-c12c-4bf8-99c5-2e7038edab7c_1024x.jpg?v=1687302190', 349.99, 'Noise-canceling over-ear headphones'),
('Nintendo Switch', 'Gaming Console', 'https://webobjects2.cdw.com/is/image/CDW/5806144?wid=784&hei=477&resMode=bilin&fit=fit,1', 299.99, 'Popular gaming console from Nintendo');
