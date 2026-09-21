export type PaymentInitInput = {
  orderId: string;
  orderNumber: number;
  amount: number; // minor units
  currency: string;
  customer: { name: string; email?: string | null; phone?: string | null; address?: string };
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  callbackUrl: string; // server-to-server IPN / callback
};

export type PaymentInitResult =
  | { kind: "redirect"; url: string; reference?: string }
  | { kind: "offline"; message: string }
  | { kind: "error"; message: string };

export type PaymentVerifyResult = { paid: boolean; reference?: string; raw?: unknown; message?: string };

export interface PaymentProvider {
  id: string;
  init(config: Record<string, unknown>, input: PaymentInitInput): Promise<PaymentInitResult>;
  verify?(config: Record<string, unknown>, params: Record<string, string>): Promise<PaymentVerifyResult>;
}
