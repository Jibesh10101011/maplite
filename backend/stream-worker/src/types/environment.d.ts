declare namespace NodeJS {
  interface ProcessEnv {
    CLIENT_ID: string;
    BROKERS_CONNECTING_IP: string;
    GROUP_ID: string;
    PORT: number
  }
}
