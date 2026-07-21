// js/inspeccion-form.js (versión con ImgBB)
import { db, collection, addDoc, serverTimestamp } from './firebase-config.js';
import { subirMultiplesImgBB } from './imgbb-upload.js'; // <--- NUEVA IMPORTACIÓN

const urlParams = new URLSearchParams(window.location.search);
const edificioId = urlParams.get('edificioId');

// ... (resto del código igual: carga de fecha/hora, agregar elementos, etc.)

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
    
    // --- SUBIR IMÁGENES GENERALES a ImgBB ---
    const filesGen = document.getElementById('imgGenerales').files;
    let urlsGen = [];
    if (filesGen.length > 0) {
        try {
            urlsGen = await subirMultiplesImgBB(filesGen);
        } catch (error) {
            alert('Error al subir imágenes generales: ' + error.message);
            return;
        }
    }
    
    // Recorrer elementos
    const elementos = [];
    const cards = document.querySelectorAll('.elemento-card');
    for (const card of cards) {
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
        // --- SUBIR IMÁGENES DEL ELEMENTO a ImgBB ---
        const filesElem = card.querySelector('[name="imgElemento"]').files;
        if (filesElem.length > 0) {
            try {
                elem.imagenes = await subirMultiplesImgBB(filesElem);
            } catch (error) {
                alert('Error al subir imágenes del elemento ' + elem.nomenclatura + ': ' + error.message);
                return;
            }
        }
        elementos.push(elem);
    }

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
        alert('✅ Inspección guardada exitosamente. ¡Puedes imprimir el reporte desde el historial!');
        window.location.href = `edificio.html?id=${edificioId}`;
    } catch (err) {
        alert('Error guardando en Firestore: ' + err.message);
    }
});

// ... (el resto del código para agregar elementos, daños, etc. se mantiene igual)
