/**
 * value object: tipo de interaccion con una campana
 * las metricas del dashboard se construyen a partir de estos eventos
 * (que llegan por RabbitMQ desde marketing)
 */
export type InteractionType = "VIEW" | "RESERVE" | "REDEEM";