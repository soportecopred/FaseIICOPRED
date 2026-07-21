// Dentro de js/edificio.js, en la función configurarCanvas

document.getElementById('btnCargarPlano').addEventListener('click', async () => {
    const input = document.getElementById('inputPlano');
    if (input.files.length === 0) return alert('Selecciona un archivo de imagen.');
    const file = input.files[0];
    
    try {
        // Subir a ImgBB
        const url = await subirImagenImgBB(file);
        // Guardar la URL en Firestore
        const docRef = doc(db, "edificios", edificioId);
        await setDoc(docRef, { 
            planoUrl: url, 
            planoWidth: 800, 
            planoHeight: 600 
        }, { merge: true });
        
        cargarPlanoEnCanvas(url, 800, 600);
        alert('✅ Plano subido y guardado correctamente.');
    } catch (error) {
        alert('Error al subir el plano: ' + error.message);
    }
});
