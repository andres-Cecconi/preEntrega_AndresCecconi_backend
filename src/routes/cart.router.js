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

    res.json({
        message: "🟢 Carrito actualizado correctamente",
        cart: updatedCart
    });
});

//PUT: Modificar quantity de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: '🔴 La cantidad debe ser un número positivo' });
    }

    const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
    if (updatedCart.error) return res.status(404).json({ error: updatedCart.error });

    res.json({
        message: "🟢 Cantidad de producto actualizada en el carrito",
        cart: updatedCart
    });
});


// DELETE: Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    const updatedCart = await cartManager.removeProductFromCart(cid, pid);
    if (updatedCart.error) return res.status(404).json({ error: updatedCart.error });

    res.json({ message: "🟢 Producto eliminado correctamente del carrito", cart: updatedCart });    
});

//DELETE: Vaciar el carrito
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    const updatedCart = await cartManager.clearCart(cid);
    if (updatedCart.error) return res.status(404).json({ error: updatedCart.error });

    res.json({
        message: "🟢 Carrito vaciado exitosamente",
        cart: updatedCart
    });
});


module.exports = router;
