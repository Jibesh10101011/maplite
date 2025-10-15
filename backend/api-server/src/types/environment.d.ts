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
    AWS_REGION: string;
    S3_CLIENT_ACCESS_KEY_ID: string;
    S3_CLIENT_SECRET_ACCESS_KEY: string;
    AWS_BUCKET_NAME: string;
    CLIENT_ID: string;
    BROKERS_CONNECTING_IP: string;
    GROUP_ID: string;
    REDIS_URL: string;
  }
}
