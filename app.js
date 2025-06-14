// Clase principal para manejar la lista de la compra
class ListaCompra {
    constructor() {
        this.productos = this.cargarProductos();
        this.inicializarEventos();
        this.actualizarInterfaz();
    }

    // Cargar productos desde localStorage
    cargarProductos() {
        const productos = localStorage.getItem('productos');
        return productos ? JSON.parse(productos) : [];
    }

    // Guardar productos en localStorage
    guardarProductos() {
        localStorage.setItem('productos', JSON.stringify(this.productos));
    }

    // Inicializar todos los eventos
    inicializarEventos() {
        // Eventos del formulario
        document.getElementById('formulario').addEventListener('submit', (e) => this.agregarProducto(e));
        
        // Eventos de navegación
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => this.navegar(e));
        });

        // Evento para borrar todo
        document.getElementById('borrar-todo').addEventListener('click', () => this.confirmarBorrado());
    }

    // Agregar nuevo producto
    agregarProducto(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const cantidad = document.getElementById('cantidad').value;
        const categoria = document.getElementById('categoria').value;

        if (!nombre || !cantidad || !categoria) {
            this.mostrarToast('Todos los campos son requeridos', 'error');
            return;
        }

        const producto = {
            id: Date.now(),
            nombre,
            cantidad,
            categoria,
            completado: false
        };

        this.productos.push(producto);
        this.guardarProductos();
        this.actualizarInterfaz();
        this.mostrarToast('Producto añadido');
        e.target.reset();
    }

    // Actualizar la interfaz completa
    actualizarInterfaz() {
        this.mostrarListaProductos();
        this.mostrarEstadisticas();
        this.mostrarDistribucion();
    }

    // Mostrar lista de productos
    mostrarListaProductos() {
        const listaProductos = document.getElementById('lista-productos');
        listaProductos.innerHTML = '';

        this.productos.forEach(producto => {
            const div = document.createElement('div');
            div.className = `product-item ${producto.completado ? 'completed' : ''}`;
            div.innerHTML = `
                <input type="checkbox" ${producto.completado ? 'checked' : ''}>
                <label>
                    <span>${producto.nombre}</span>
                    <small>${producto.cantidad} - ${this.obtenerNombreCategoria(producto.categoria)}</small>
                </label>
                <button onclick="listaCompra.eliminarProducto(${producto.id})">Eliminar</button>
            `;

            div.querySelector('input[type="checkbox"]').addEventListener('change', () => {
                this.toggleCompletado(producto.id);
            });

            listaProductos.appendChild(div);
        });

        // Mostrar lista completa en el nuevo contenedor
        this.mostrarListaCompleta();
    }

    // Mostrar lista completa de productos en el nuevo contenedor
    mostrarListaCompleta() {
        const listaCompleta = document.getElementById('lista-productos-completa');
        listaCompleta.innerHTML = '';

        this.productos.forEach(producto => {
            const div = document.createElement('div');
            div.className = `producto-lista ${producto.completado ? 'completed' : ''}`;
            div.innerHTML = `
                <div class="check-icon" onclick="listaCompra.toggleCompletado(${producto.id})">
                    <i class="fas fa-check-circle ${producto.completado ? 'fa-check-circle' : 'fa-circle'}"></i>
                </div>
                <div class="info">
                    <span>${producto.nombre}</span>
                    <small>${producto.cantidad} - ${this.obtenerNombreCategoria(producto.categoria)}</small>
                </div>
                <div class="acciones">
                    <button class="editar" onclick="listaCompra.editarProducto(${producto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="eliminar" onclick="listaCompra.eliminarProducto(${producto.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;

            listaCompleta.appendChild(div);
        });
    }

    // Mostrar estadísticas
    mostrarEstadisticas() {
        const total = this.productos.length;
        const comprados = this.productos.filter(p => p.completado).length;
        const porcentaje = total > 0 ? Math.round((comprados / total) * 100) : 0;

        document.getElementById('total-productos').textContent = total;
        document.getElementById('comprados').textContent = comprados;
        document.getElementById('progress').style.width = `${porcentaje}%`;
    }

    // Mostrar distribución por categorías
    mostrarDistribucion() {
        const distribucion = document.getElementById('distribucion');
        distribucion.innerHTML = '';

        const categorias = ['frutas', 'lacteos', 'carnes', 'bebidas', 'higiene', 'otros'];
        categorias.forEach(cat => {
            const count = this.productos.filter(p => p.categoria === cat).length;
            const div = document.createElement('div');
            div.className = 'category-item';
            div.innerHTML = `
                <span>${this.obtenerNombreCategoria(cat)}:</span>
                <span>${count}</span>
            `;
            distribucion.appendChild(div);
        });
    }

    // Obtener nombre completo de la categoría
    obtenerNombreCategoria(codigo) {
        const categorias = {
            frutas: 'Frutas y Verduras',
            lacteos: 'Lácteos',
            carnes: 'Carnes',
            bebidas: 'Bebidas',
            higiene: 'Higiene',
            otros: 'Otros'
        };
        return categorias[codigo] || 'Desconocida';
    }

    // Toggle completado de un producto
    toggleCompletado(id) {
        const producto = this.productos.find(p => p.id === id);
        if (producto) {
            producto.completado = !producto.completado;
            this.guardarProductos();
            this.actualizarInterfaz();
        }
    }

    // Eliminar producto
    eliminarProducto(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            this.productos = this.productos.filter(p => p.id !== id);
            this.guardarProductos();
            this.actualizarInterfaz();
            this.mostrarToast('Producto eliminado');
        }
    }

    // Confirmar borrado de toda la lista
    confirmarBorrado() {
        if (confirm('¿Estás seguro de que quieres borrar toda la lista?')) {
            this.productos = [];
            this.guardarProductos();
            this.actualizarInterfaz();
            this.mostrarToast('Lista eliminada');
        }
    }

    // Navegar entre secciones
    navegar(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');
        
        // Smooth scroll
        document.querySelector(`#${targetId}`).scrollIntoView({ behavior: 'smooth' });
    }

    // Mostrar toast
    mostrarToast(mensaje, tipo = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = mensaje;
        toast.style.display = 'block';
        
        // Cambiar color según tipo
        const colores = {
            success: 'var(--primary-color)',
            error: 'var(--danger-color)'
        };
        toast.style.backgroundColor = colores[tipo] || colores['success'];
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    window.listaCompra = new ListaCompra();
});
