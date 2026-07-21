import { db, collection, getDocs, query, where, orderBy, onAuthStateChanged, auth, signInAnonymously } from './firebase-config.js';
import { edificiosData } from './data-edificios.js';

let edificiosCache = [];

// Cargar o sincronizar edificios con Firestore
async function sincronizarEdificios() {
    try {
        const colRef = collection(db, "edificios");
        const snap = await getDocs(colRef);
        
        if (snap.empty) {
            // Si no hay datos, cargar los del CSV
            console.log("Cargando edificios iniciales...");
            for (const ed of edificiosData) {
                const docRef = doc(db, "edificios", ed.id);
                await setDoc(docRef, ed);
            }
            console.log("Edificios cargados exitosamente.");
            edificiosCache = edificiosData;
        } else {
            edificiosCache = snap.docs.map(doc => doc.data());
        }
        renderizarEdificios(edificiosCache);
        document.getElementById('totalEdificios').textContent = edificiosCache.length;
    } catch (error) {
        console.error("Error sincronizando edificios:", error);
        // Fallback a datos locales
        edificiosCache = edificiosData;
        renderizarEdificios(edificiosCache);
        document.getElementById('totalEdificios').textContent = edificiosCache.length;
    }
}

// Renderizar tarjetas
function renderizarEdificios(lista) {
    const contenedor = document.getElementById('contenedorEdificios');
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    sincronizarEdificios();
    
    document.getElementById('buscador').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroPrioridad').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroEstatus').addEventListener('change', aplicarFiltros);
    document.getElementById('btnBuscar').addEventListener('click', aplicarFiltros);
    
    // Botón Nueva Inspección: redirige a una vista general o a un modal (por ahora a edificio)
    document.getElementById('btnNuevaInspeccion').addEventListener('click', () => {
        // Podríamos mostrar un modal para seleccionar edificio, pero simplificamos:
        alert('Selecciona un edificio desde la lista para agregar una inspección.');
    });
});