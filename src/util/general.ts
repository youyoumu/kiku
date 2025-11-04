export const isMobile = () => document.body.clientWidth < 640;

export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export function capitalize(str: string) {
  // returns the first letter capitalized + the string from index 1 and out aka. the rest of the string
  return str.substring(0, 1).toLocaleUpperCase() + str.substring(1);
}

export const base64 = {
  decode: (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
  encode: (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b))),
  decodeToString: (s: string) => new TextDecoder().decode(base64.decode(s)),
  encodeString: (s: string) =>
    base64.encode(new TextEncoder().encode(s).buffer),
};

export const env = {
  KIKU_CONFIG_FILE: "_kiku.config.json",
};
