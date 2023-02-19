import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { type PrismaClient } from "@prisma/client";
import { s3Client } from "../../../../utils";
import { env } from "../../../../env.mjs";

export const deleteImageFromR2 = async (imageKey: string) => {
  const {
    $metadata: { httpStatusCode },
  } = await s3Client.send(
    new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: imageKey })
  );

  if (httpStatusCode) {
    if (httpStatusCode > 299 || httpStatusCode < 200) {
      throw new Error("Failed to delete from R2 storage.");
    }
  }
};

export const deleteImage = async (prisma: PrismaClient, imageId: string) => {
  const toDelete = await prisma.image.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!toDelete) {
    throw new Error("No such image exists.");
  }

  await deleteImageFromR2(toDelete.key);

  const deletedImage = await prisma.image.delete({
    where: {
      id: toDelete.id,
    },
  });

  return deletedImage;
};
