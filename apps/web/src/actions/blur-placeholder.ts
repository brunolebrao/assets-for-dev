"use server";

import sharp from "sharp";

const MAX_FILES = 20;
const MAX_SIZE_MB = 10;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

export type PlaceholderResult = {
  name: string;
  originalWidth: number;
  originalHeight: number;
  placeholders: {
    blurDataUrl: string;
    cssShimmer: string;
    tinyImage: string;
  };
  codeSnippets: {
    nextImage: string;
    cssBackground: string;
    imgSrc: string;
  };
};

export async function generatePlaceholders(formData: FormData): Promise<PlaceholderResult[]> {
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return [];
  if (files.length > MAX_FILES) throw new Error(`Máximo de ${MAX_FILES} arquivos`);

  const results: PlaceholderResult[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      throw new Error(`Tipo não suportado: ${file.type}`);
    }
    if (file.size > MAX_SIZE) {
      throw new Error(`Arquivo acima de ${MAX_SIZE_MB}MB: ${file.name}`);
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(inputBuffer).metadata();
    const originalWidth = metadata.width ?? 0;
    const originalHeight = metadata.height ?? 0;

    // 1. Blur Data URL: resize 10x10 + blur(2) + PNG → base64
    const blurBuffer = await sharp(inputBuffer)
      .resize(10, 10, { fit: "cover" })
      .blur(2)
      .png()
      .toBuffer();
    const blurDataUrl = `data:image/png;base64,${blurBuffer.toString("base64")}`;

    // 2. Tiny Image: resize 32x32 + blur(1) + PNG → base64
    const tinyBuffer = await sharp(inputBuffer)
      .resize(32, 32, { fit: "cover" })
      .blur(1)
      .png()
      .toBuffer();
    const tinyImage = `data:image/png;base64,${tinyBuffer.toString("base64")}`;

    // 3. CSS Shimmer: extract dominant color via resize 1x1 + raw
    const { data: rawPixel } = await sharp(inputBuffer)
      .resize(1, 1)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const r = rawPixel[0];
    const g = rawPixel[1];
    const b = rawPixel[2];
    const cssShimmer = `linear-gradient(135deg, rgb(${r},${g},${b}) 0%, rgb(${Math.min(r + 40, 255)},${Math.min(g + 40, 255)},${Math.min(b + 40, 255)}) 50%, rgb(${r},${g},${b}) 100%)`;

    // Code snippets
    const nextImageSnippet = `<Image
  src="/your-image.jpg"
  alt="description"
  width={${originalWidth}}
  height={${originalHeight}}
  placeholder="blur"
  blurDataURL="${blurDataUrl}"
/>`;

    const cssBackgroundSnippet = `background: ${cssShimmer};
background-size: 200% 200%;
animation: shimmer 1.5s ease-in-out infinite;

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}`;

    const imgSrcSnippet = `<img
  src="${tinyImage}"
  alt="placeholder"
  width="${originalWidth}"
  height="${originalHeight}"
  style="filter: blur(8px); transform: scale(1.1);"
/>`;

    results.push({
      name: file.name,
      originalWidth,
      originalHeight,
      placeholders: { blurDataUrl, cssShimmer, tinyImage },
      codeSnippets: {
        nextImage: nextImageSnippet,
        cssBackground: cssBackgroundSnippet,
        imgSrc: imgSrcSnippet,
      },
    });
  }

  return results;
}
