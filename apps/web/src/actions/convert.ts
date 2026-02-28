"use server";

import sharp from "sharp";
import { z } from "zod";

const MAX_FILES = 20;
const MAX_SIZE_MB = 10;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

const optionsSchema = z.object({
  format: z.enum(["jpeg", "png", "webp", "avif"]),
});

export type ConvertResult = {
  name: string;
  originalFormat: string;
  targetFormat: string;
  beforeSize: number;
  afterSize: number;
  dataUrl: string;
};

export async function convert(formData: FormData): Promise<ConvertResult[]> {
  const format = String(formData.get("format") ?? "webp");

  const parsed = optionsSchema.safeParse({ format });
  if (!parsed.success) {
    throw new Error("Opções inválidas");
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return [];
  if (files.length > MAX_FILES) throw new Error(`Máximo de ${MAX_FILES} arquivos`);

  const results: ConvertResult[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      throw new Error(`Tipo não suportado: ${file.type}`);
    }
    if (file.size > MAX_SIZE) {
      throw new Error(`Arquivo acima de ${MAX_SIZE_MB}MB: ${file.name}`);
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const originalFormat = file.type.replace("image/", "");

    let pipeline = sharp(inputBuffer);
    if (parsed.data.format === "jpeg") pipeline = pipeline.jpeg({ quality: 100 });
    if (parsed.data.format === "webp") pipeline = pipeline.webp({ lossless: true });
    if (parsed.data.format === "avif") pipeline = pipeline.avif({ lossless: true });
    if (parsed.data.format === "png") pipeline = pipeline.png();

    const outputBuffer = await pipeline.toBuffer();
    const dataUrl = `data:image/${parsed.data.format};base64,${outputBuffer.toString("base64")}`;

    results.push({
      name: file.name,
      originalFormat,
      targetFormat: parsed.data.format,
      beforeSize: file.size,
      afterSize: outputBuffer.length,
      dataUrl,
    });
  }

  return results;
}
