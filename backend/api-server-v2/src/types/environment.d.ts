declare namespace NodeJS {
  interface ProcessEnv {
    PORT: number;
    CORS_ORIGIN: string;
    URL_ENCODED_LIMIT: string;
    MONGO_HOST: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY_SECOND: number;
  }
}
