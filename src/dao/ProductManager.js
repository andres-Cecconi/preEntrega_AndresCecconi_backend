const Product = require('../models/product.model');
class ProductManager {
    // Obtener productos con paginación
    async getProducts(limit = null, page = 1, sort = null, category = null) {
        try {
            const query = {};
            if (category) {
                query.category = { $regex: new RegExp(category, "i") };
            }

            const options = {
                limit: parseInt(limit) || 10,
                page: parseInt(page),
                sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {},
            };

            return await Product.paginate(query, options);
        } catch (error) {
            console.error('🔴 Error al obtener productos:', error);
            throw error;
        }
    }

    // Obtener un producto por su ID
    async getProductById(id) {
        try {
            return await Product.findById(id);
        } catch (error) {
            console.error('🔴 Error al buscar producto:', error);
            return null;
        }
    }

    // Agregar un nuevo producto con validaciones
    async addProduct(data) {
        try {
            // Verificar si el producto ya existe por su 'code'
            const existingProduct = await Product.findOne({ code: data.code });

            if (existingProduct) {
                return { error: `🔴 El producto con el codigo ${data.code} ya existe`};
            }

            const newProduct = new Product(data);
            await newProduct.save();

            return { message: "🟢 Producto agregado exitosamente", product: newProduct };
        } catch (error) {
            console.error('🔴 Error al agregar producto:', error);
            throw error;
        }
    }

    // Actualizar un producto por ID
    async updateProduct(id, updateData) {
        try {
            return await Product.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            console.error('🔴 Error al actualizar producto:', error);
            return null;
        }
    }

    // Eliminar un producto por ID
    async deleteProduct(id) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            if (!deletedProduct) {
                return { error: '🔴 Producto no encontrado' };
            }
            return { message: '🟢 Producto eliminado correctamente', product: deletedProduct };
        } catch (error) {
            console.error('🔴 Error al eliminar producto:', error);
            return { error: '🔴 Error interno del servidor' };
        }
    }
    
}

module.exports = ProductManager;
