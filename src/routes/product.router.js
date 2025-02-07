const { Router } = require('express');
const ProductManager = require('../dao/ProductManager');
const router = Router();
const productManager = new ProductManager();


// Obtener productos con paginación, orden y filtro
router.get('/', async (req, res) => {
    try {
        const { limit, page, sort, category } = req.query;
        const products = await productManager.getProducts(limit, page, sort, category);
        res.json(products);
    } catch (error) {
        console.error('🔴 Error al obtener productos:', error);
        res.status(500).json({ error: '🔴 Error interno del servidor' });
    }
});

// Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = await productManager.getProductById(pid);
    if (!product) return res.status(404).json({ error: '🔴 Producto no encontrado' });
    res.json(product);
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
        return res.status(400).json({ error: '🔴 Todos los campos son obligatorios excepto thumbnails' });
    }
    const newProduct = await productManager.addProduct({ title, description, code, price, stock, category, thumbnails });
    res.status(201).json(newProduct);
});

// Actualizar un producto
router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const updateFields = req.body;
    if (updateFields.id) {
        return res.status(400).json({ error: '🔴 No se puede actualizar el ID del producto' });
    }
    const updatedProduct = await productManager.updateProduct(pid, updateFields);
    if (!updatedProduct) return res.status(404).json({ error: '🔴 Producto no encontrado' });
    res.json(updatedProduct);
});

// Eliminar un producto
router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;
    const success = await productManager.deleteProduct(pid);
    if (!success) return res.status(404).json({ error: '🔴 Producto no encontrado' });
    res.status(200).json(success);
});

module.exports = router;
