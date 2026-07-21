// js/app.js
import { db, collection, getDocs, setDoc, doc } from './firebase-config.js';
import { edificiosData } from './data-edificios.js';

let edificiosCache = [];

// Cargar edificios desde Firestore o datos locales
async function cargarEdificios() {
    try {
        const snap = await getDocs(collection(db, "edificios"));
        if (!snap.empty) {
            // Si hay datos en Firestore, usarlos
            edificiosCache = snap.docs.map(doc => doc.data());
            console.log('Edificios cargados desde Firestore:', edificiosCache.length);
        } else {
            // Si no hay datos, cargar los locales y guardarlos en Firestore
            console.log('Cargando edificios desde datos locales...');
            edificiosCache = edificiosData;
            // Guardar en Firestore
            for (const ed of edificiosData) {
                await setDoc(doc(db, "edificios", ed.id), ed);
            }
            console.log('Edificios guardados en Firestore.');
        }
        renderizarEdificios(edificiosCache);
        document.getElementById('totalEdificios').textContent = edificiosCache.length;
    } catch (error) {
        console.error('Error cargando edificios, usando datos locales:', error);
        edificiosCache = edificiosData;
        renderizarEdificios(edificiosCache);
        document.getElementById('totalEdificios').textContent = edificiosCache.length;
    }
}

// Renderizar tarjetas
function renderizarEdificios(lista) {
    const contenedor = document.getElementById('contenedorEdificios');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    
    if (lista.length === 0) {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-info">No se encontraron edificios.</div></div>`;
        return;
    }

    lista.forEach(ed => {
        const prioridadClase = ed.prioridad.includes('I') ? 'prioridad-I' : 
                               ed.prioridad.includes('II') ? 'prioridad-II' : 
                               ed.prioridad.includes('III') ? 'prioridad-III' : 'prioridad-Pendiente';
        const badgeColor = ed.prioridad.includes('I') ? 'danger' :
                           ed.prioridad.includes('II') ? 'warning' :
                           ed.prioridad.includes('III') ? 'success' : 'secondary';
        
        const card = document.createElement('div');
        card.className = `col-md-4 col-lg-3 mb-4`;
        card.innerHTML = `
            <div class="card card-edificio ${prioridadClase} h-100 shadow-sm" onclick="window.location.href='edificio.html?id=${ed.id}'">
                <div class="card-body">
                    <h5 class="card-title">${ed.nombre}</h5>
                    <p class="card-text"><small class="text-muted">${ed.id}</small></p>
                    <span class="badge bg-${badgeColor} badge-prioridad">${ed.prioridad}</span>
                    <span class="badge bg-secondary">${ed.estatus}</span>
                    <p class="card-text mt-2 small">${ed.daños.substring(0, 60)}${ed.daños.length > 60 ? '...' : ''}</p>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

// Filtros y búsqueda
function aplicarFiltros() {
    const busqueda = document.getElementById('buscador').value.toLowerCase();
    const prioridad = document.getElementById('filtroPrioridad').value;
    const estatus = document.getElementById('filtroEstatus').value;

    let filtrados = edificiosCache.filter(ed => {
        const matchNombre = ed.nombre.toLowerCase().includes(busqueda) || ed.id.toLowerCase().includes(busqueda);
        const matchPrioridad = prioridad === '' || ed.prioridad === prioridad;
        const matchEstatus = estatus === '' || ed.estatus === estatus;
        return matchNombre && matchPrioridad && matchEstatus;
    });
    renderizarEdificios(filtrados);
}

// Event listeners al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarEdificios();
    
    // Listeners para filtros
    const buscador = document.getElementById('buscador');
    const filtroPrioridad = document.getElementById('filtroPrioridad');
    const filtroEstatus = document.getElementById('filtroEstatus');
    const btnBuscar = document.getElementById('btnBuscar');
    
    if (buscador) buscador.addEventListener('input', aplicarFiltros);
    if (filtroPrioridad) filtroPrioridad.addEventListener('change', aplicarFiltros);
    if (filtroEstatus) filtroEstatus.addEventListener('change', aplicarFiltros);
    if (btnBuscar) btnBuscar.addEventListener('click', aplicarFiltros);
    
    // Botón Nueva Inspección
    const btnNueva = document.getElementById('btnNuevaInspeccion');
    if (btnNueva) {
        btnNueva.addEventListener('click', () => {
            // Podrías mostrar un modal para seleccionar edificio, o redirigir a un listado
            alert('Selecciona un edificio desde la lista para agregar una inspección.');
        });
    }
});
