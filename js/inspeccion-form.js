import { db, collection, addDoc, serverTimestamp, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

const urlParams = new URLSearchParams(window.location.search);
const edificioId = urlParams.get('edificioId');

// Cargar nombre del edificio
document.addEventListener('DOMContentLoaded', async () => {
    if (!edificioId) { alert('Falta ID del edificio'); return; }
    // Obtener nombre desde Firestore o data local
    // (simplificado: asumimos que ya está en el DOM)
    document.getElementById('edificioNombre').value = edificioId;
    
    // Fecha y hora por defecto
    const now = new Date();
    document.getElementById('fechaInspeccion').value = now.toISOString().split('T')[0];
    document.getElementById('horaInspeccion').value = now.toTimeString().slice(0,5);
});

// Agregar elemento (botón)
document.getElementById('btnAgregarElemento')?.addEventListener('click', () => {
    const container = document.getElementById('contenedorElementos');
    const div = document.createElement('div');
    div.className = 'elemento-card border p-3 rounded mb-3 bg-light';
    div.innerHTML = `
        <div class="row">
            <div class="col-md-3"><input class="form-control" placeholder="Nomenclatura (Ej: C-1)" name="nomenclatura"></div>
            <div class="col-md-2"><input class="form-control" placeholder="Nivel" name="nivel"></div>
            <div class="col-md-2"><input class="form-control" placeholder="Eje" name="eje"></div>
            <div class="col-md-3">
                <select class="form-select" name="tipoElemento">
                    <option value="columna">Columna</option>
                    <option value="viga">Viga</option>
                    <option value="muro">Muro</option>
                    <option value="mensula">Ménsula</option>
                    <option value="parasol">Parasol/Marquésina</option>
                    <option value="losa">Losa</option>
                </select>
            </div>
            <div class="col-md-2"><button type="button" class="btn btn-danger btn-sm btn-eliminar-elemento"><i class="fas fa-trash"></i></button></div>
        </div>
        <div class="row mt-2">
            <div class="col-md-4"><input class="form-control" placeholder="Cara (Norte/Sur/Este/Oeste/Frontal/Posterior)" name="cara"></div>
            <div class="col-md-4"><input class="form-control" placeholder="Sección (Cuadrada/Rectangular/Circular/Otro)" name="seccion"></div>
            <div class="col-md-4"><input class="form-control" placeholder="Tipo (Estructural/Otro)" name="tipo"></div>
        </div>
        <div class="mt-2">
            <label>Daños:</label>
            <div class="daños-container">
                <button type="button" class="btn btn-sm btn-outline-primary btn-agregar-dano"><i class="fas fa-plus"></i> Añadir daño</button>
            </div>
        </div>
        <div class="mt-2">
            <label>Imágenes del elemento:</label>
            <input type="file" class="form-control" multiple accept="image/*" name="imgElemento">
        </div>
    `;
    container.appendChild(div);
    // Eliminar elemento
    div.querySelector('.btn-eliminar-elemento').addEventListener('click', () => div.remove());
    // Agregar daño dentro del elemento
    div.querySelector('.btn-agregar-dano').addEventListener('click', function() {
        const contenedorDaños = this.parentElement;
        const row = document.createElement('div');
        row.className = 'row g-2 mt-1';
        row.innerHTML = `
            <div class="col-2"><input class="form-control form-control-sm" placeholder="Cantidad" name="danoCant"></div>
            <div class="col-2"><input class="form-control form-control-sm" placeholder="Ubicación" name="danoUbic"></div>
            <div class="col-2"><input class="form-control form-control-sm" placeholder="Longitud (cm)" name="danoLong"></div>
            <div class="col-2"><input class="form-control form-control-sm" placeholder="Espesor (mm)" name="danoEsp"></div>
            <div class="col-2"><input class="form-control form-control-sm" placeholder="Ángulo (°)" name="danoAng"></div>
            <div class="col-1"><input type="checkbox" title="Continuidad" name="danoCont"> C</div>
            <div class="col-1"><input type="checkbox" title="Desprendimiento" name="danoDesp"> D</div>
            <div class="col-auto"><button type="button" class="btn btn-danger btn-sm btn-eliminar-dano"><i class="fas fa-times"></i></button></div>
        `;
        contenedorDaños.insertBefore(row, this);
        row.querySelector('.btn-eliminar-dano').addEventListener('click', () => row.remove());
    });
});

// Envío del formulario
document.getElementById('formInspeccion').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Recopilar datos del evaluador
    const evaluador = {
        nombre: document.getElementById('evalNombre').value,
        cedula: document.getElementById('evalCedula').value,
        correo: document.getElementById('evalCorreo').value,
        institucion: document.getElementById('evalInstitucion').value
    };
    const fecha = document.getElementById('fechaInspeccion').value;
    const hora = document.getElementById('horaInspeccion').value;
    const obs = document.getElementById('obsGenerales').value;
    
    // Imágenes generales
    const filesGen = document.getElementById('imgGenerales').files;
    const urlsGen = await subirImagenes(filesGen, `inspecciones/${edificioId}/generales`);
    
    // Recorrer elementos
    const elementos = [];
    document.querySelectorAll('.elemento-card').forEach(card => {
        const elem = {
            nomenclatura: card.querySelector('[name="nomenclatura"]').value,
            nivel: card.querySelector('[name="nivel"]').value,
            eje: card.querySelector('[name="eje"]').value,
            tipo: card.querySelector('[name="tipoElemento"]').value,
            cara: card.querySelector('[name="cara"]').value,
            seccion: card.querySelector('[name="seccion"]').value,
            tipoEspecifico: card.querySelector('[name="tipo"]').value,
            daños: [],
            imagenes: []
        };
        // Daños
        card.querySelectorAll('.daños-container .row').forEach(row => {
            if (row.querySelector('[name="danoCant"]')) {
                elem.daños.push({
                    cantidad: row.querySelector('[name="danoCant"]').value,
                    ubicacion: row.querySelector('[name="danoUbic"]').value,
                    longitud: row.querySelector('[name="danoLong"]').value,
                    espesor: row.querySelector('[name="danoEsp"]').value,
                    angulo: row.querySelector('[name="danoAng"]').value,
                    continuidad: row.querySelector('[name="danoCont"]').checked,
                    desprendimiento: row.querySelector('[name="danoDesp"]').checked
                });
            }
        });
        // Imágenes del elemento
        const filesElem = card.querySelector('[name="imgElemento"]').files;
        // (Subir imágenes y guardar URLs, similar a generales)
        elementos.push(elem);
    });

    // Guardar en Firestore
    try {
        const data = {
            edificioId,
            evaluador,
            fecha,
            hora,
            observacionesGenerales: obs,
            imagenesGenerales: urlsGen,
            elementos,
            timestamp: serverTimestamp()
        };
        await addDoc(collection(db, "inspecciones"), data);
        alert('Inspección guardada exitosamente. ¡Puedes imprimir el reporte desde el historial!');
        window.location.href = `edificio.html?id=${edificioId}`;
    } catch (err) {
        alert('Error guardando: ' + err.message);
    }
});

async function subirImagenes(files, pathBase) {
    const urls = [];
    for (const file of files) {
        const storageRef = ref(storage, `${pathBase}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
    }
    return urls;
}