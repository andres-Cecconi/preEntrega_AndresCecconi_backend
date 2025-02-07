const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Definir el esquema de productos en MongoDB
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: { type: [String], default: [] }
});

// Agregar paginación al esquema
productSchema.plugin(mongoosePaginate);

// Crear y exportar el modelo de productos
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
