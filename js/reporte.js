import { db, doc, getDoc } from './firebase-config.js';

const urlParams = new URLSearchParams(window.location.search);
const inspeccionId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', async () => {
    if (!inspeccionId) {
        document.getElementById('datosReporte').innerHTML = '<div class="alert alert-danger">ID de inspección no válido.</div>';
        return;
    }
    try {
        const docRef = doc(db, "inspecciones", inspeccionId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            document.getElementById('datosReporte').innerHTML = '<div class="alert alert-warning">Inspección no encontrada.</div>';
            return;
        }
        const data = snap.data();
        document.getElementById('datosReporte').innerHTML = generarHTML(data);
    } catch (e) {
        document.getElementById('datosReporte').innerHTML = `<div class="alert alert-danger">Error: ${e.message}</div>`;
    }
});

function generarHTML(data) {
    let html = `
        <div class="card mb-3"><div class="card-body">
            <h5>Datos Generales</h5>
            <table class="table table-bordered">
                <tr><td><strong>Edificio</strong></td><td>${data.edificioId}</td></tr>
                <tr><td><strong>Fecha</strong></td><td>${data.fecha} ${data.hora}</td></tr>
                <tr><td><strong>Evaluador</strong></td><td>${data.evaluador.nombre} (${data.evaluador.cedula})</td></tr>
                <tr><td><strong>Correo</strong></td><td>${data.evaluador.correo}</td></tr>
                <tr><td><strong>Institución</strong></td><td>${data.evaluador.institucion}</td></tr>
                <tr><td><strong>Observaciones</strong></td><td>${data.observacionesGenerales || 'N/A'}</td></tr>
            </table>
        </div></div>
    `;

    // Imágenes generales
    if (data.imagenesGenerales && data.imagenesGenerales.length > 0) {
        html += `<div class="card mb-3"><div class="card-body">
            <h5>Imágenes Generales</h5>
            <div class="row">`;
        data.imagenesGenerales.forEach(url => {
            html += `<div class="col-md-3"><img src="${url}" class="img-fluid img-thumbnail"></div>`;
        });
        html += `</div></div></div>`;
    }

    // Elementos
    if (data.elementos && data.elementos.length > 0) {
        html += `<div class="card"><div class="card-body">
            <h5>Elementos Inspeccionados</h5>`;
        data.elementos.forEach((elem, idx) => {
            html += `<div class="border p-2 mb-2">
                <p><strong>${elem.tipo.toUpperCase()}</strong> - ${elem.nomenclatura} (Nivel: ${elem.nivel}, Eje: ${elem.eje})</p>
                <p>Cara: ${elem.cara} | Sección: ${elem.seccion || 'N/A'}</p>
                ${elem.daños && elem.daños.length > 0 ? `<ul>${elem.daños.map(d => `<li>Cant: ${d.cantidad}, Ubic: ${d.ubicacion}, Long: ${d.longitud}cm, Esp: ${d.espesor}mm, Áng: ${d.angulo}°, Cont: ${d.continuidad ? 'Sí' : 'No'}, Desp: ${d.desprendimiento ? 'Sí' : 'No'}</li>`).join('')}</ul>` : '<p>Sin daños registrados.</p>'}
                ${elem.imagenes && elem.imagenes.length > 0 ? `<div class="row">${elem.imagenes.map(url => `<div class="col-2"><img src="${url}" class="img-fluid img-thumbnail"></div>`).join('')}</div>` : ''}
            </div>`;
        });
        html += `</div></div>`;
    }
    return html;
}