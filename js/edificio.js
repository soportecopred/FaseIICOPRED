// js/edificio.js (fragmento modificado para subir planos con ImgBB)
import { subirImagenImgBB } from './imgbb-upload.js';

// Dentro de la función configurarCanvas, en el evento del botón "Cargar Plano":

document.getElementById('btnCargarPlano').addEventListener('click', async () => {
    const input = document.getElementById('inputPlano');
    if (input.files.length === 0) return alert('Selecciona un archivo de imagen.');
    const file = input.files[0];
    
    try {
        // Subir a ImgBB
        const url = await subirImagenImgBB(file);
        // Guardar la URL en Firestore (en el documento del edificio)
        const docRef = doc(db, "edificios", edificioId);
        await setDoc(docRef, { 
            planoUrl: url, 
            planoWidth: 800, // Puedes obtener el ancho real con un Image object si lo deseas
            planoHeight: 600 
        }, { merge: true });
        
        // Cargar el plano en el canvas
        cargarPlanoEnCanvas(url, 800, 600);
        alert('✅ Plano subido y guardado correctamente.');
    } catch (error) {
        alert('Error al subir el plano: ' + error.message);
    }
});
