export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

export function darken(hex: string, amt: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.max(0, (r - amt * 255) | 0)},${Math.max(
    0,
    (g - amt * 255) | 0
  )},${Math.max(0, (b - amt * 255) | 0)})`;
}

export function lighten(hex: string, amt: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${clamp((r + amt * 255) | 0, 0, 255)},${clamp(
    (g + amt * 255) | 0,
    0,
    255
  )},${clamp((b + amt * 255) | 0, 0, 255)})`;
}
