//Conexion a Base de Datos Mongo Atlas
const mongoose = require('mongoose');

// Conectar con MongoDB Atlas
mongoose.connect('mongodb+srv://ancecconi15:rml3ApvSeC2NK0c3@server-backendcoder.hch7i.mongodb.net/?retryWrites=true&w=majority&appName=server-backendCoder')
    .then(() => console.log('🟢 Conectado a MongoDB Atlas'))
    .catch(err => console.error('🔴 Error al conectar con MongoDB:', err));

// Importamos los módulos necesarios
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const { Server } = require('socket.io');
const productsRouter = require('./routes/product.router');
const cartsRouter = require('./routes/cart.router');
const viewsRouter = require('./routes/views.router');
const ProductManager = require('./dao/ProductManager');

// Configuración inicial
const app = express();
const PORT = 8080;
const productManager = new ProductManager();

// Configuración del motor de plantillas Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowedProtoMethodsByDefault: true
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal (Página inicial)
app.get('/', (req, res) => {
    res.render('home');
});

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Servidor HTTP y WebSocket
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Emitir lista de productos al cliente
    productManager.getProducts().then((products) => {
        socket.emit('products', products);
    });

    // Escuchar eventos de creación o eliminación de productos
    socket.on('product:created', async (product) => {
        await productManager.addProduct(product);
        const updatedProducts = await productManager.getProducts();
        io.emit('products', updatedProducts);
    });

    socket.on('product:deleted', async (productId) => {
        await productManager.deleteProduct(productId);
        const updatedProducts = await productManager.getProducts();
        io.emit('products', updatedProducts);
    });
});

