/**
 * Tipos para la pantalla Efectivo.
 * Representan el efectivo disponible y el historial de movimientos (desde compras/ventas; futuro: depósitos, retiradas, dividendos, comisiones).
 */

import type { TransactionResponse } from '../api/investmentsClient';

/** Tipo de movimiento de efectivo para la UI (extensible a DEPOSIT, WITHDRAWAL, DIVIDEND, FEE). */
export type CashMovementType = 'BUY' | 'SELL';

/** Una transacción vista como movimiento de efectivo: importe con signo y etiqueta. */
export interface CashTransactionView {
  /** Id de la transacción. */
  id: string;
  /** BUY | SELL (y en el futuro DEPOSIT, WITHDRAWAL, DIVIDEND, FEE). */
  type: CashMovementType;
  /** Importe con signo: positivo = entrada (venta, depósito), negativo = salida (compra, retirada). */
  amount: number;
  currency: string;
  createdAt: string;
  status: 'completed';
  /** Símbolo del activo (compra/venta). */
  symbol?: string;
  quantity?: number;
  price?: number;
  fee?: number;
  /** Datos crudos para el modal de detalle. */
  raw: TransactionResponse;
}

/** Resumen mensual (entradas, salidas, comisiones). */
export interface CashMonthlySummary {
  in: number;
  out: number;
  fees: number;
}

/** Grupo de transacciones por fecha (clave para "Hoy", "Ayer", "12 Feb", etc.). */
export interface CashTransactionGroup {
  label: string;
  /** Ordenado por fecha descendente. */
  transactions: CashTransactionView[];
}

/** Respuesta esperada del endpoint GET /api/investments/cash/overview (opcional). */
export interface CashOverviewResponse {
  balance: number;
  currency: string;
  monthlyIn: number;
  monthlyOut: number;
  monthlyFees: number;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    createdAt: string;
    status: string;
    symbol?: string;
    quantity?: number;
    price?: number;
    fee?: number;
    reference?: string;
  }>;
}
