const { Router } = require('express');
const ProductManager = require('../dao/ProductManager');
const CartManager = require('../dao/CartManager');

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

// Ruta para listar productos con paginación
router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, category } = req.query;
        const productsData = await productManager.getProducts(limit, page, sort, category);

        res.render('index', {
            products: productsData.docs,
            hasPrevPage: productsData.hasPrevPage,
            hasNextPage: productsData.hasNextPage,
            prevLink: productsData.hasPrevPage ? `/products?limit=${limit}&page=${productsData.prevPage}&sort=${sort}&category=${category || ''}` : null,
            nextLink: productsData.hasNextPage ? `/products?limit=${limit}&page=${productsData.nextPage}&sort=${sort}&category=${category || ''}` : null
        });
    } catch (error) {
        console.error('🔴 Error al obtener productos para la vista:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para ver detalles de un producto específico
router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('productDetails', { product });
    } catch (error) {
        console.error('🔴 Error al obtener detalles del producto:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para ver los productos de un carrito
router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        res.render('cart', { cart });
    } catch (error) {
        console.error('🔴 Error al obtener carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});

module.exports = router;