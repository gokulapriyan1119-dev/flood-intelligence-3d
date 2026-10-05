export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatArea(km2: number): string {
  return `${formatNumber(Math.round(km2))} km²`;
}

export function formatDepth(meters: number): string {
  return `${meters.toFixed(2)} m`;
}

export function formatCoords(lat: number, lon: number): string {
  const latStr = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;
  return `${latStr}, ${lonStr}`;
}
