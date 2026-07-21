import { db, collection, doc, getDoc, getDocs, query, where, orderBy, setDoc, storage, ref, uploadBytes, getDownloadURL, serverTimestamp } from './firebase-config.js';
import { edificiosData } from './data-edificios.js';

const urlParams = new URLSearchParams(window.location.search);
const edificioId = urlParams.get('id');

let canvas = null;
let planoData = null; // { url, width, height }
let marcas = [];

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    if (!edificioId) {
        alert('ID de edificio no especificado.');
        window.location.href = 'index.html';
        return;
    }

    // Cargar datos del edificio
    const edificio = await cargarEdificio(edificioId);
    if (!edificio) {
        alert('Edificio no encontrado.');
        window.location.href = 'index.html';
        return;
    }

    mostrarDatosGenerales(edificio);
    cargarInspecciones(edificioId);
    configurarCanvas(edificio);

    // Evento nueva inspección
    document.getElementById('btnNuevaInspeccion').addEventListener('click', () => {
        window.location.href = `nueva-inspeccion.html?edificioId=${edificioId}`;
    });
});

async function cargarEdificio(id) {
    try {
        const docRef = doc(db, "edificios", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) return snap.data();
        
        // Si no existe en Firebase, buscar en datos locales y guardar
        const local = edificiosData.find(e => e.id === id);
        if (local) {
            await setDoc(docRef, local);
            return local;
        }
        return null;
    } catch (e) {
        console.error(e);
        return edificiosData.find(e => e.id === id) || null;
    }
}

function mostrarDatosGenerales(ed) {
    document.getElementById('tituloEdificio').textContent = ed.nombre;
    document.getElementById('edNombre').textContent = ed.nombre;
    document.getElementById('edId').textContent = ed.id;
    document.getElementById('edPrioridad').textContent = ed.prioridad;
    document.getElementById('edEstatus').textContent = ed.estatus;
    document.getElementById('edDanios').textContent = ed.daños || 'No registrado';
    document.getElementById('edAcciones').textContent = ed.acciones || 'No registrado';
}

async function cargarInspecciones(id) {
    const contenedor = document.getElementById('listadoInspecciones');
    try {
        const q = query(collection(db, "inspecciones"), where("edificioId", "==", id), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        if (snap.empty) {
            contenedor.innerHTML = `<div class="alert alert-info">No hay inspecciones registradas para este edificio.</div>`;
            return;
        }
        let html = `<table class="table table-striped table-hover">
            <thead><tr><th>Fecha</th><th>Evaluador</th><th>Resumen</th><th>Acciones</th></tr></thead><tbody>`;
        snap.forEach(doc => {
            const data = doc.data();
            const fecha = data.fecha || 'N/A';
            const evaluador = data.evaluador?.nombre || 'Anónimo';
            const resumen = data.observacionesGenerales || 'Sin observaciones';
            html += `<tr>
                <td>${fecha}</td>
                <td>${evaluador}</td>
                <td>${resumen.substring(0, 50)}...</td>
                <td><a href="reporte.html?id=${doc.id}" class="btn btn-sm btn-primary" target="_blank"><i class="fas fa-print"></i> Ver Reporte</a></td>
            </tr>`;
        });
        html += `</tbody></table>`;
        contenedor.innerHTML = html;
    } catch (e) {
        contenedor.innerHTML = `<div class="alert alert-danger">Error cargando inspecciones: ${e.message}</div>`;
    }
}

// --- Marcado sobre plano con Fabric.js ---
function configurarCanvas(edificio) {
    canvas = new fabric.Canvas('canvasPlano', { selection: false });
    canvas.setWidth(800);
    canvas.setHeight(600);

    // Cargar plano si existe
    if (edificio.planoUrl) {
        cargarPlanoExistente(edificio.planoUrl, edificio.planoWidth, edificio.planoHeight);
    }

    // Subir nuevo plano
    document.getElementById('btnCargarPlano').addEventListener('click', () => {
        const input = document.getElementById('inputPlano');
        if (input.files.length === 0) return alert('Selecciona un archivo de imagen.');
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = async () => {
                const url = e.target.result;
                cargarPlanoEnCanvas(url, img.width, img.height);
                // Guardar en Firebase Storage y actualizar edificio
                const storageRef = ref(storage, `planos/${edificioId}.jpg`);
                const snapshot = await uploadBytes(storageRef, file);
                const downloadUrl = await getDownloadURL(snapshot.ref);
                const docRef = doc(db, "edificios", edificioId);
                await setDoc(docRef, { planoUrl: downloadUrl, planoWidth: img.width, planoHeight: img.height }, { merge: true });
                alert('Plano subido y guardado correctamente.');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Herramientas
    let tool = 'cursor';
    document.getElementById('herramientaCirculo').addEventListener('click', () => tool = 'circulo');
    document.getElementById('herramientaFlecha').addEventListener('click', () => tool = 'flecha');
    document.getElementById('herramientaTexto').addEventListener('click', () => tool = 'texto');
    document.getElementById('herramientaBorrar').addEventListener('click', () => tool = 'borrar');

    canvas.on('mouse:down', (opt) => {
        const pointer = canvas.getPointer(opt.e);
        const x = pointer.x;
        const y = pointer.y;
        if (tool === 'circulo') {
            const circle = new fabric.Circle({
                left: x - 20, top: y - 20, radius: 20,
                fill: 'transparent', stroke: 'red', strokeWidth: 3,
                selectable: true, evented: true
            });
            canvas.add(circle);
            marcas.push({ tipo: 'circulo', x, y, radius: 20, color: 'red' });
        } else if (tool === 'flecha') {
            // Flecha simple: línea + triángulo
            const line = new fabric.Line([x, y, x+50, y-50], { stroke: 'blue', strokeWidth: 4, selectable: true });
            const triangle = new fabric.Triangle({
                left: x+50, top: y-50,
                width: 15, height: 15,
                fill: 'blue', selectable: true
            });
            const group = new fabric.Group([line, triangle], { selectable: true, evented: true });
            canvas.add(group);
            marcas.push({ tipo: 'flecha', x, y, color: 'blue' });
        } else if (tool === 'texto') {
            const texto = prompt('Escribe el texto para la marca:');
            if (texto) {
                const text = new fabric.IText(texto, { left: x, top: y, fill: 'black', fontSize: 20, selectable: true });
                canvas.add(text);
                marcas.push({ tipo: 'texto', x, y, texto, color: 'black' });
            }
        } else if (tool === 'borrar') {
            const target = canvas.findTarget(opt.e);
            if (target) { canvas.remove(target); }
        }
        canvas.renderAll();
    });

    document.getElementById('btnLimpiarMarcas').addEventListener('click', () => {
        canvas.clear();
        if (planoData) cargarPlanoEnCanvas(planoData.url, planoData.width, planoData.height);
        marcas = [];
    });
}

function cargarPlanoExistente(url, width, height) {
    planoData = { url, width, height };
    cargarPlanoEnCanvas(url, width, height);
}

function cargarPlanoEnCanvas(url, width, height) {
    fabric.Image.fromURL(url, (img) => {
        const scale = Math.min(800 / width, 600 / height);
        img.scale(scale);
        canvas.setWidth(800);
        canvas.setHeight(600);
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        planoData = { url, width, height };
    });
}