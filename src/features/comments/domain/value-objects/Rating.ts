/**
 * value object: calificacion de 1 a 5 estrellas
 */
export type Rating = 1 | 2 | 3 | 4 | 5;

export function isValidRating(value: number): value is Rating {
    return Number.isInteger(value) && value >= 1 && value <= 5;
}