export interface IPaymentCreate {
  orderId: string;
  method: "COD" | "ONLINE";
}
