const { Router } = require('express');
const CartManager = require('../dao/CartManager');
const router = Router();

const cartManager = new CartManager();

// Crear un carrito
router.post('/', async (req, res) => {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
});

// Obtener un carrito por ID
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
});

// Agregar producto a un carrito
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    if (!updatedCart) return res.status(404).json({ error: 'Carrito o producto no encontrado' });
    res.status(201).json(updatedCart);
});

module.exports = router;
