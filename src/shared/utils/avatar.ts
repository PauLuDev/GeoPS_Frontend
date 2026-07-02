/* el backend (iam-service) asigna una foto de stock al crear el perfil, en vez de
   dejarla vacia. la ignoramos aqui para que la UI muestre el placeholder con la
   inicial del nombre en lugar de esa imagen predeterminada. */
const DEFAULT_AVATAR_URLS = new Set<string>([
    "https://i.pinimg.com/736x/0d/e0/8a/0de08a5799602c294c85cb2a3031c04c.jpg",
    "https://i.pinimg.com/736x/27/04/39/2704399f46a1ac9a1d353e59a91dfe19.jpg",
]);

/* devuelve la URL del avatar, o undefined si es la foto por defecto del back
   (o esta vacia) para que los componentes caigan al placeholder con la inicial */
export function normalizeAvatarUrl(url?: string | null): string | undefined {
    if (!url) return undefined;
    return DEFAULT_AVATAR_URLS.has(url.trim()) ? undefined : url;
}
