// js/imgbb-upload.js
// Configuración: reemplaza con tu API key de ImgBB
const IMGBB_API_KEY = 'TU_API_KEY_DE_IMGBB'; // <--- PON AQUÍ TU CLAVE

/**
 * Sube un archivo (imagen) a ImgBB y devuelve la URL pública.
 * @param {File} file - El archivo de imagen a subir.
 * @returns {Promise<string>} - La URL de la imagen alojada en ImgBB.
 */
export async function subirImagenImgBB(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Convertir a base64 (ImgBB acepta base64)
                const base64 = e.target.result.split(',')[1]; // Quitar el prefijo "data:image/..."
                
                // Construir el formulario para enviar a la API de ImgBB
                const formData = new FormData();
                formData.append('key', IMGBB_API_KEY);
                formData.append('image', base64);
                // Opcional: puedes darle un nombre a la imagen
                formData.append('name', file.name);

                const response = await fetch('https://api.imgbb.com/1/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (data.success) {
                    // La URL pública de la imagen está en data.data.url
                    resolve(data.data.url);
                } else {
                    reject(new Error(data.error?.message || 'Error al subir a ImgBB'));
                }
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
    });
}

/**
 * Sube múltiples archivos a ImgBB.
 * @param {FileList} files - Lista de archivos.
 * @returns {Promise<string[]>} - Array de URLs.
 */
export async function subirMultiplesImgBB(files) {
    const promises = Array.from(files).map(file => subirImagenImgBB(file));
    return await Promise.all(promises);
}