// js/app.js - versión con datos locales, sin Firestore
import { edificiosData } from './data-edificios.js';

let edificiosCache = [];

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

document.addEventListener('DOMContentLoaded', () => {
    edificiosCache = edificiosData;
    renderizarEdificios(edificiosCache);
    document.getElementById('totalEdificios').textContent = edificiosCache.length;
    
    document.getElementById('buscador').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroPrioridad').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroEstatus').addEventListener('change', aplicarFiltros);
    document.getElementById('btnBuscar').addEventListener('click', aplicarFiltros);
});
