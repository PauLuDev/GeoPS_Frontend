/*
 subida de imagenes a Cloudinary (unsigned upload desde el browser).
 devuelve la secure_url, que es corta (~100 chars) y entra en el limite de
 255 del backend. requiere un cloud name y un upload preset *unsigned*.
*/
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export function isCloudinaryConfigured(): boolean {
    return !!CLOUD_NAME && !!UPLOAD_PRESET;
}

/* sube un archivo y devuelve su URL https publica */
export async function uploadImage(file: File): Promise<string> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Cloudinary no esta configurado (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET).");
    }

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: form,
    });

    if (!res.ok) {
        let detail = "";
        try { detail = (await res.json())?.error?.message ?? ""; } catch { /* sin cuerpo */ }
        throw new Error(`No se pudo subir la imagen a Cloudinary${detail ? `: ${detail}` : ""}`);
    }

    const data = await res.json();
    return data.secure_url as string;
}
