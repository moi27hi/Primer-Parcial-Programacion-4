
const idInput        = document.getElementById('idProducto');
const cantInput      = document.getElementById('cantidad');
const nombreProducto = document.getElementById('nombreProducto');
const precioUnitario = document.getElementById('precioUnitario');
const catSelect      = document.getElementById('categoria');
const btnRegistrar   = document.getElementById('btnRegistrar');
const tablaBody      = document.querySelector('#tablaInventario tbody');

// ---------- Renderizar tabla completa desde localStorage ----------
function renderizarTabla() {
  const inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
  tablaBody.innerHTML = '';

  inventario.forEach((producto, index) => {
    const fila = document.createElement('tr');

    if (producto.cantidad === 0) {
      fila.style.backgroundColor = '#f8d7da';
      fila.style.color           = '#842029';
    }

    fila.innerHTML = `
      <td>${producto.id}</td>
      <td>${producto.nombre}</td>
      <td id="stock-${index}">${producto.cantidad}</td>
      <td>${producto.categoria}</td>
      <td>
        <button 
          onclick="eliminarProducto(${index})"
          style="
            background: #dc3545;
            color: white;
            border: none;
            padding: 5px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.82rem;
            font-weight: 500;
            transition: background 0.2s;
          "
          onmouseover="this.style.background='#a71d2a'"
          onmouseout="this.style.background='#dc3545'"
        >🗑 Eliminar</button>
      </td>
    `;
    tablaBody.appendChild(fila);
  });
}

// ---------- Eliminar producto ----------
function eliminarProducto(index) {
  const inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
  const nombre     = inventario[index]?.nombre || 'este producto';

  if (!confirm(`¿Seguro que deseas eliminar "${nombre}" del inventario?`)) return;

  inventario.splice(index, 1);
  localStorage.setItem('inventario', JSON.stringify(inventario));
  renderizarTabla();
}

// ---------- Validar formulario ----------
function validarFormulario() {
  const idValue     = idInput.value;
  const nombreValue = nombreProducto.value;
  const cantValue   = parseInt(cantInput.value);
  const precioValue = parseFloat(precioUnitario.value);
  const catValue    = catSelect.value;

  const idValido     = idValue.length === 8 && isNaN(idValue.charAt(0));
  const nombreValido = nombreValue.length >= 3 && isNaN(nombreValue.charAt(0));
  const precioValido = !isNaN(precioValue) && precioValue >= 0;
  const cantValida   = cantValue > 0;
  const catValida    = catValue !== '';

  btnRegistrar.disabled = !(idValido && nombreValido && precioValido && cantValida && catValida);
}

idInput.addEventListener('input', validarFormulario);
nombreProducto.addEventListener('input', validarFormulario);
precioUnitario.addEventListener('input', validarFormulario);
cantInput.addEventListener('input', validarFormulario);
catSelect.addEventListener('change', validarFormulario);

// ---------- Registrar producto ----------
btnRegistrar.addEventListener('click', () => {
  const producto = {
    id:        idInput.value,
    nombre:    nombreProducto.value,
    cantidad:  parseInt(cantInput.value),
    precio:    parseFloat(precioUnitario.value),
    categoria: catSelect.value,
  };

  const inventario = JSON.parse(localStorage.getItem('inventario') || '[]');
  inventario.push(producto);
  localStorage.setItem('inventario', JSON.stringify(inventario));

  renderizarTabla();

  idInput.value         = '';
  cantInput.value       = '';
  nombreProducto.value  = '';
  precioUnitario.value  = '';
  catSelect.value       = '';
  btnRegistrar.disabled = true;
});

// ---------- Escuchar cambios desde otra pestaña (clientes) ----------
window.addEventListener('storage', (event) => {
  if (event.key === 'inventario') renderizarTabla();
});

// ---------- Actualización periódica ----------
setInterval(renderizarTabla, 3000);

// ---------- Inicializar ----------
renderizarTabla();