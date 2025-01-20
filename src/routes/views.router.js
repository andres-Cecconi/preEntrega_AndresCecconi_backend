const { Router } = require('express');
const ProductManager = require('../dao/ProductManager');
const router = Router();

const productManager = new ProductManager();

// Renderizar vista estática de productos
router.get('/products', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('index', { products });
});

// Renderizar vista en tiempo real de productos
router.get('/realtimeproducts', async (req, res) => {
    res.render('realTimeProducts');
});

module.exports = router;
