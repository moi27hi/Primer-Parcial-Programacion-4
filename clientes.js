
const selector       = document.getElementById('selector_productos');
const inputCantidad  = document.getElementById('cantidad');
const inputPrecio    = document.getElementById('precio');
const selectPago     = document.getElementById('metodoPago');
const btnRegistrar   = document.getElementById('btnRegistrarCompra');
const btnNuevaCompra = document.getElementById('btnNueva_compra');
const tbody          = document.querySelector('#tablaclientes tbody');
const inputTotal     = document.getElementById('totalPagar');

let idContador   = 1;
let totalGeneral = 0;

// Guarda las filas registradas para recalcular total al eliminar
let compras = [];

// ---------- Descuentos y categorías por método de pago ----------
const DESCUENTOS = {
  Efectivo:                  0,
  Tarjeta:                   0.05,
  Tarjeta_cliente_frecuente: 0.15,
};

const CATEGORIAS = {
  Efectivo:                  'Regular',
  Tarjeta:                   'Preferencial',
  Tarjeta_cliente_frecuente: 'VIP',
};

// ---------- Cargar productos desde localStorage ----------
function cargarProductos() {
  const productoActual = selector.options[selector.selectedIndex]?.textContent
    ?.split(' (Stock:')[0] || null;

  const inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
  selector.innerHTML = '';

  if (inventario.length === 0) {
    selector.innerHTML = '<option value="">-- Sin productos registrados --</option>';
    actualizarPrecio();
    return;
  }

  inventario.forEach((producto, index) => {
    const option = document.createElement('option');
    option.value          = index;
    option.dataset.precio = producto.precio;
    option.dataset.stock  = producto.cantidad;
    option.textContent    = `${producto.nombre} (Stock: ${producto.cantidad})`;

    if (productoActual && producto.nombre === productoActual) {
      option.selected = true;
    }

    selector.appendChild(option);
  });

  actualizarPrecio();
}

// ---------- Obtener stock del producto seleccionado ----------
function obtenerStock() {
  const opcion = selector.options[selector.selectedIndex];
  return parseInt(opcion?.dataset.stock) || 0;
}

// ---------- Mostrar / ocultar alerta de stock ----------
function mostrarErrorStock(cantidad, stockDisponible) {
  let alerta = document.getElementById('alertaStock');
  if (!alerta) {
    alerta = document.createElement('p');
    alerta.id = 'alertaStock';
    alerta.style.cssText = `
      color: #842029;
      background: #f8d7da;
      border: 1px solid #f5c2c7;
      border-radius: 6px;
      padding: 8px 12px;
      margin-top: 8px;
      font-size: 0.9rem;
      display: none;
    `;
    inputCantidad.parentNode.insertBefore(alerta, inputCantidad.nextSibling);
  }

  const usuarioEscribio = cantidad > 0;

  if (usuarioEscribio && stockDisponible === 0) {
    alerta.textContent   = '⚠️ Este producto está agotado.';
    alerta.style.display = 'block';
  } else if (usuarioEscribio && cantidad > stockDisponible) {
    alerta.textContent   = `⚠️ Stock insuficiente. Solo hay ${stockDisponible} unidad(es) disponibles.`;
    alerta.style.display = 'block';
  } else {
    alerta.style.display = 'none';
  }
}

// ---------- Calcular precio con descuento en tiempo real ----------
function actualizarPrecio() {
  const opcionSeleccionada = selector.options[selector.selectedIndex];
  const precioUnitario     = parseFloat(opcionSeleccionada?.dataset.precio) || 0;
  const cantidad           = parseInt(inputCantidad.value) || 0;
  const descuento          = DESCUENTOS[selectPago.value] ?? 0;
  const stock              = obtenerStock();

  mostrarErrorStock(cantidad, stock);

  if (cantidad > 0 && precioUnitario > 0 && cantidad <= stock) {
    const subtotal    = precioUnitario * cantidad;
    const precioFinal = subtotal * (1 - descuento);
    inputPrecio.value = precioFinal.toFixed(2);
  } else {
    inputPrecio.value = '';
  }

  validarFormulario();
}

selector.addEventListener('change', actualizarPrecio);
inputCantidad.addEventListener('input', actualizarPrecio);
selectPago.addEventListener('change', actualizarPrecio);

// ---------- Habilitar / deshabilitar botones ----------
function validarFormulario() {
  const cantidad = parseInt(inputCantidad.value) || 0;
  const stock    = obtenerStock();

  const cantidadOk = cantidad > 0 && cantidad <= stock;
  const precioOk   = parseFloat(inputPrecio.value) > 0;
  const pagoOk     = selectPago.value !== '';

  btnRegistrar.disabled = !(cantidadOk && precioOk && pagoOk);
}

// ---------- Eliminar fila de compra ----------
function eliminarCompra(idCompra) {
  // Buscar la compra en el array
  const idx = compras.findIndex(c => c.id === idCompra);
  if (idx === -1) return;

  const compra = compras[idx];

  // Devolver stock al localStorage
  const inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
  if (inventario[compra.indiceProducto] !== undefined) {
    inventario[compra.indiceProducto].cantidad += compra.cantidad;
    localStorage.setItem('inventario', JSON.stringify(inventario));
  }

  // Restar del total
  totalGeneral -= compra.precio;
  if (totalGeneral < 0) totalGeneral = 0;
  inputTotal.value = totalGeneral.toFixed(2);

  // Quitar del array y de la tabla
  compras.splice(idx, 1);
  const fila = document.getElementById(`fila-${idCompra}`);
  if (fila) fila.remove();

  // Recargar selector con stock restaurado
  cargarProductos();

  // Si no quedan filas, deshabilitar Nueva compra
  if (compras.length === 0) {
    btnNuevaCompra.disabled = true;
    totalGeneral = 0;
    inputTotal.value = '';
  }
}

// ---------- Registrar compra ----------
btnRegistrar.addEventListener('click', () => {
  const indice      = parseInt(selector.value);
  const producto    = selector.options[selector.selectedIndex].textContent.split(' (Stock:')[0];
  const cantidad    = parseInt(inputCantidad.value);
  const precioFinal = parseFloat(inputPrecio.value);
  const metodo      = selectPago.value;

  const descuento = DESCUENTOS[metodo] ?? 0;
  const categoria = CATEGORIAS[metodo] ?? 'Regular';
  const idCompra  = idContador++;

  // Descontar del stock en localStorage
  const inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
  inventario[indice].cantidad -= cantidad;
  localStorage.setItem('inventario', JSON.stringify(inventario));

  // Guardar compra en array
  compras.push({
    id:              idCompra,
    indiceProducto:  indice,
    cantidad:        cantidad,
    precio:          precioFinal,
  });

  // Agregar fila a la tabla
  const fila = document.createElement('tr');
  fila.id = `fila-${idCompra}`;
  fila.innerHTML = `
    <td>${idCompra}</td>
    <td>${producto}</td>
    <td>${cantidad}</td>
    <td>${categoria}${descuento > 0 ? ` (${descuento * 100}% desc.)` : ''}</td>
    <td>$${precioFinal.toFixed(2)}</td>
    <td>
      <button class="btn-eliminar" onclick="eliminarCompra(${idCompra})">
        🗑 Eliminar
      </button>
    </td>
  `;
  tbody.appendChild(fila);

  totalGeneral += precioFinal;
  inputTotal.value = totalGeneral.toFixed(2);
  btnNuevaCompra.disabled = false;

  // Resetear campos
  inputCantidad.value   = '';
  selectPago.value      = '';
  inputPrecio.value     = '';
  btnRegistrar.disabled = true;

  cargarProductos();          
  mostrarErrorStock(0, 1);    

  // Flash verde en la fila nueva
  fila.style.backgroundColor = '#d4edda';
  setTimeout(() => {
    fila.style.transition      = 'background 0.8s';
    fila.style.backgroundColor = '';
  }, 100);
});


btnNuevaCompra.addEventListener('click', () => {
  tbody.innerHTML     = '';
  compras             = [];
  totalGeneral        = 0;
  idContador          = 1;
  inputTotal.value    = '';
  inputCantidad.value = '';
  selectPago.value    = '';
  inputPrecio.value   = '';

  btnRegistrar.disabled   = true;
  btnNuevaCompra.disabled = true;

  cargarProductos();
});

// ---------- Sincronización en tiempo real desde otra pestaña ----------
window.addEventListener('storage', (event) => {
  if (event.key === 'inventario') cargarProductos();
});

// ---------- Actualización periódica (misma ventana) ----------
setInterval(cargarProductos, 3000);

// ---------- Inicializar ----------
cargarProductos();