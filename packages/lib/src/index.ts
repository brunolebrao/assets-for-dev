export type CompressOptions = {
  format: "jpeg" | "png" | "webp" | "avif";
  quality: number;
};

export type CompressResult = {
  buffer: Buffer;
  format: string;
  size: number;
};
