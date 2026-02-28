export type CompressOptions = {
  format: "jpeg" | "png" | "webp" | "avif";
  quality: number;
};

export type CompressResult = {
  buffer: Buffer;
  format: string;
  size: number;
};

// Image Converter
export type ConvertResult = {
  name: string;
  originalFormat: string;
  targetFormat: string;
  beforeSize: number;
  afterSize: number;
  dataUrl: string;
};

// Blur Placeholder
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

// QR Code
export type QrErrorCorrection = "L" | "M" | "Q" | "H";
export type QrOptions = {
  text: string;
  size: number;
  errorCorrection: QrErrorCorrection;
  foreground: string;
  background: string;
};
