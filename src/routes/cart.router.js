const { Router } = require('express');
const CartManager = require('../dao/CartManager');
const router = Router();

const cartManager = new CartManager();

// Obtener un carrito por ID
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart);
});

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
});

// Agregar un producto a un carrito existente
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body || 1;

    console.log(`🟢 Recibida solicitud POST en /api/carts/${cid}/product/${pid}`);
    console.log(`📌 Datos recibidos: quantity=${quantity}`);

    const updatedCart = await cartManager.addProductToCart(cid, pid, quantity);

    if (updatedCart.error) {
        console.error(`🔴 Error en addProductToCart: ${updatedCart.error}`);
        return res.status(400).json({ error: updatedCart.error });
    }

    res.status(201).json(updatedCart);
});

// PUT: Reemplazar todo el carrito
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'El formato de productos debe ser un array' });
    }

    const updatedCart = await cartManager.updateCart(cid, products);
    if (updatedCart.error) return res.status(404).json({ error: updatedCart.error });

    res.json(updatedCart);
});

// DELETE: Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    const updatedCart = await cartManager.removeProductFromCart(cid, pid);
    if (updatedCart.error) return res.status(404).json({ error: updatedCart.error });

    res.json({ message: "🟢 Producto eliminado correctamente del carrito", cart: updatedCart });
});

module.exports = router;
