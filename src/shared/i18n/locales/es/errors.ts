export const errors = {
    errors: {
        default: "Ocurrió un error inesperado. Inténtalo de nuevo.",
        network: "Error de conexión. Revisa tu internet e inténtalo de nuevo.",
        400: "Solicitud incorrecta. Verifica los datos enviados.",
        401: "Correo o contraseña incorrectos.",
        403: "No tienes permiso para realizar esta acción.",
        404: "El recurso solicitado no fue encontrado.",
        500: "Error en el servidor. Inténtalo más tarde.",
    }
} as const;
