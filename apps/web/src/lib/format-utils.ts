import YAML from "yaml";

export type FormatType = "json" | "yaml";

export type ValidationResult = {
  valid: boolean;
  error?: string;
  line?: number;
};

export function detectFormat(input: string): FormatType | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    JSON.parse(trimmed);
    return "json";
  } catch {
    // not JSON, try YAML
  }
  try {
    const result = YAML.parse(trimmed);
    if (typeof result === "object" && result !== null) return "yaml";
    // If YAML parses it as a primitive, it's likely not YAML
    return null;
  } catch {
    return null;
  }
}

export function prettifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input), null, 2);
}

export function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input));
}

export function validateJson(input: string): ValidationResult {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const lineMatch = message.match(/position (\d+)/);
    let line: number | undefined;
    if (lineMatch) {
      const pos = parseInt(lineMatch[1], 10);
      line = input.substring(0, pos).split("\n").length;
    }
    return { valid: false, error: message, line };
  }
}

export function jsonToYaml(input: string): string {
  const obj = JSON.parse(input);
  return YAML.stringify(obj);
}

export function yamlToJson(input: string): string {
  const obj = YAML.parse(input);
  return JSON.stringify(obj, null, 2);
}

export function prettifyYaml(input: string): string {
  const obj = YAML.parse(input);
  return YAML.stringify(obj, { indent: 2 });
}

export function validateYaml(input: string): ValidationResult {
  try {
    YAML.parse(input);
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const lineMatch = message.match(/at line (\d+)/);
    const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
    return { valid: false, error: message, line };
  }
}
