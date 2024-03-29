import { S3Client } from "@aws-sdk/client-s3";

import { env } from "../env.mjs";
import Stripe from "stripe";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_ID,
    secretAccessKey: env.R2_SECRET_KEY,
  },
});

export const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
  typescript: true,
});
