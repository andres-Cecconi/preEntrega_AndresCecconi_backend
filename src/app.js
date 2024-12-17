// Importamos los módulos necesarios
const express = require('express');
const ProductManager = require('./dao/ProductManager');
const CartManager = require('./dao/CartManager');

// Configuración inicial
const app = express();
const PORT = 8080;
app.use(express.json());

// Instancias de ProductManager y CartManager
const productManager = new ProductManager();
const cartManager = new CartManager();

// ---- Rutas para /api/products ---- //
const productsRouter = express.Router();

productsRouter.get('/', async (req, res) => {
    const { limit } = req.query;
    const products = await productManager.getProducts(limit);
    res.json(products);
});

productsRouter.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = await productManager.getProductById(pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
});

productsRouter.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    if (!title || !description || !code || !price || stock === undefined || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
    }
    const newProduct = await productManager.addProduct({ title, description, code, price, stock, category, thumbnails });
    res.status(201).json(newProduct);
});

productsRouter.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const updateFields = req.body;
    if (updateFields.id) {
        return res.status(400).json({ error: 'No se puede actualizar el ID del producto' });
    }
    const updatedProduct = await productManager.updateProduct(pid, updateFields);
    if (!updatedProduct) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updatedProduct);
});

productsRouter.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    const success = await productManager.deleteProduct(pid);
    if (!success) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).send();
});

// ---- Rutas para /api/carts ---- //
const cartsRouter = express.Router();

cartsRouter.post('/', async (req, res) => {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
});

cartsRouter.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    if (!updatedCart) return res.status(404).json({ error: 'Carrito o producto no encontrado' });
    res.status(201).json(updatedCart);
});

// Montamos los routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Iniciamos el servidor
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <style>
                    .centered {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }

                    .centered h1 {
                        font-size: 24px;
                        font-family: Arial, sans-serif;
                    }
                </style>
            </head>
            <body>
                <div class="centered">
                    <h1>Bienvenido al servidor de la app de e-commerce</h1>
                </div>
            </body>
        </html>
    `);
});

app.get ("/api/carts", async (req, res) => {
    const carts = await cartManager.getCarts();
    res.json(carts);
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
