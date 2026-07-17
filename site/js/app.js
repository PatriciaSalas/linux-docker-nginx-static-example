// Validación + LocalStorage
'use strict';

// DOM 
const $ = id => document.getElementById(id);
const form      = $('formulario-registro');
const btnReg    = $('btn-registrar');
const btnLimp   = $('btn-limpiar');
const msgExito  = $('mensaje-exito');
const listaEl   = $('lista-usuarios');
const contador  = $('contador');
const LS_KEY    = 'usuarios_registrados';

// reglas de validación
const campos = {
  nombre:   { el: $('nombre'),   fn: v => v.length < 3 ? 'Mínimo 3 caracteres.' : '' },
  email:    { el: $('email'),    fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Correo no válido.' },
  password: { el: $('password'), fn: v => v.length < 6 ? 'Mínimo 6 caracteres.' : '' },
  confirmar:{ el: $('confirmar'),fn: v => v !== $('password').value ? 'Las contraseñas no coinciden.' : '' },
};

// Validación 
function validar(key) {
  const { el, fn } = campos[key];
  const error = fn(el.value.trim());
  $(`error-${key}`).textContent = error;
  el.classList.toggle('invalido', !!error);
  el.classList.toggle('valido',   !error);
  return !error;
}

function verificar() {
  btnReg.disabled = !Object.keys(campos).every(k => campos[k].fn(campos[k].el.value.trim()) === '');
}




// Eventos oninput
Object.keys(campos).forEach(k => {
  campos[k].el.addEventListener('input', () => { validar(k); verificar(); });
});

// Al editar password, revalidar confirmación
$('password').addEventListener('input', () => validar('confirmar'));

// LocalStorage
const getUsuarios  = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? []; } catch { return []; } };
const saveUsuarios = lista => { try { localStorage.setItem(LS_KEY, JSON.stringify(lista)); } catch(e) { console.warn(e); } };

// Render lista --> dibuja y pinta visualmente
function render() {
  const lista = getUsuarios();
  contador.textContent = lista.length;
  listaEl.innerHTML = lista.length
    ? lista.map((u, i) => `
        <article class="usuario-tarjeta">
          <span class="usuario-numero">${i + 1}</span>
          <div class="usuario-info">
            <strong>${u.nombre}</strong>
            <span>${u.email}</span>
            <small>${u.fecha}</small>
          </div>
        </article>`).join('')
    : '<p class="lista-vacia">Aún no hay usuarios registrados.</p>';
}

// Envio Formulario
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!Object.keys(campos).every(k => validar(k))) return;

  const usuario = {
    nombre: campos.nombre.el.value.trim(),
    email:  campos.email.el.value.trim(),
    fecha:  new Date().toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' }),
  };

  saveUsuarios([...getUsuarios(), usuario]);
  msgExito.textContent = `✓ ${usuario.nombre} registrado/a correctamente.`;
  setTimeout(() => msgExito.textContent = '', 4000);

  form.reset();
  Object.keys(campos).forEach(k => campos[k].el.classList.remove('valido', 'invalido'));
  btnReg.disabled = true;
  render();
});

// Limpiar
btnLimp.addEventListener('click', () => {
  if (!confirm('¿Eliminar todos los usuarios?')) return;
  localStorage.removeItem(LS_KEY);
  msgExito.textContent = '';
  render();
});

// Cargar al inicio
render();