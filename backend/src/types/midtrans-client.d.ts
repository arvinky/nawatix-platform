declare module 'midtrans-client' {
  export class Snap {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    createTransaction(parameter: any): Promise<{
      token: string;
      redirect_url: string;
    }>;
    createTransactionToken(parameter: any): Promise<string>;
  }

  export class CoreApi {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    transaction: {
      notification(response: any): Promise<any>;
      status(transactionId: string): Promise<any>;
      cancel(transactionId: string): Promise<any>;
    };
  }
}
