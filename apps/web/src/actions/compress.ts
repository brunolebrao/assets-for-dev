"use server";

import sharp from "sharp";
import { z } from "zod";

export const runtime = "nodejs";

const MAX_FILES = 20;
const MAX_SIZE_MB = 10;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

const optionsSchema = z.object({
  format: z.enum(["jpeg", "png", "webp", "avif"]),
  quality: z.enum(["low", "medium", "high"])
});

const qualityMap: Record<z.infer<typeof optionsSchema>["quality"], number> = {
  low: 40,
  medium: 65,
  high: 85
};

export type CompressResult = {
  name: string;
  beforeSize: number;
  afterSize: number;
  format: string;
  dataUrl: string;
};

export async function compress(formData: FormData): Promise<CompressResult[]> {
  const format = String(formData.get("format") ?? "webp");
  const quality = String(formData.get("quality") ?? "medium");

  const parsed = optionsSchema.safeParse({ format, quality });
  if (!parsed.success) {
    throw new Error("Opções inválidas");
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return [];
  if (files.length > MAX_FILES) throw new Error(`Máximo de ${MAX_FILES} arquivos`);

  const results: CompressResult[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      throw new Error(`Tipo não suportado: ${file.type}`);
    }
    if (file.size > MAX_SIZE) {
      throw new Error(`Arquivo acima de ${MAX_SIZE_MB}MB: ${file.name}`);
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const q = qualityMap[parsed.data.quality];

    let pipeline = sharp(inputBuffer);
    if (parsed.data.format === "jpeg") pipeline = pipeline.jpeg({ quality: q });
    if (parsed.data.format === "webp") pipeline = pipeline.webp({ quality: q });
    if (parsed.data.format === "avif") pipeline = pipeline.avif({ quality: q });
    if (parsed.data.format === "png") pipeline = pipeline.png({ compressionLevel: 9 });

    const outputBuffer = await pipeline.toBuffer();
    const dataUrl = `data:image/${parsed.data.format};base64,${outputBuffer.toString("base64")}`;

    results.push({
      name: file.name,
      beforeSize: file.size,
      afterSize: outputBuffer.length,
      format: parsed.data.format,
      dataUrl
    });
  }

  return results;
}
