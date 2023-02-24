import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../env.mjs";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_ID,
    secretAccessKey: env.R2_SECRET_KEY,
  },
});

export const TIME_IN_MS = {
  FIVE_MINUTES: 1000 * 60 * 5,
} as const;
