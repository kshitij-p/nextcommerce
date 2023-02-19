import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../../../env.mjs";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../../../../utils";

const imageRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure.mutation(async () => {
    const key = `image-${Date.now()}-${Math.round(Math.random() * 100)}`;

    //To do add validation here for images

    const presignedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 60 }
    );

    return {
      message: "Successfully generated a presigned url for image upload.",
      key: key,
      presignedUrl: presignedUrl,
    };
  }),
});

export default imageRouter;
