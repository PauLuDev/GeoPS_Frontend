export const errors = {
    errors: {
        default: "An unexpected error occurred. Please try again.",
        network: "Connection error. Please check your internet and try again.",
        400: "Bad request. Please verify the submitted data.",
        401: "Incorrect email or password.",
        403: "You do not have permission to perform this action.",
        404: "The requested resource was not found.",
        500: "Internal server error. Please try again later.",
    }
} as const;
