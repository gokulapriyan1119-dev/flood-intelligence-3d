import * as THREE from "three";

/**
 * Creates high-detail procedural NASA Blue Marble style Earth texture
 * with oceans, continental landmasses, mountain elevations, and atmospheric clouds.
 */
export function createProceduralEarthTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, "#081b33");
  oceanGrad.addColorStop(0.5, "#0b2545");
  oceanGrad.addColorStop(1, "#081b33");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Helper to convert lat/lon to canvas x/y
  const toXY = (lat: number, lon: number): [number, number] => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  // Draw continental landmass approximations with realistic biome coloring
  ctx.fillStyle = "#1e392a"; // Lush land base

  // Major Continents & Landmasses approximation paths
  const continents: [number, number][][] = [
    // North America
    [
      [70, -160], [70, -80], [60, -60], [50, -65], [45, -60], [30, -80], [25, -80], [15, -90],
      [20, -105], [32, -117], [48, -125], [60, -140], [65, -165]
    ],
    // South America
    [
      [12, -75], [5, -50], [-5, -35], [-20, -40], [-40, -60], [-55, -70], [-45, -75],
      [-20, -70], [-5, -80], [8, -78]
    ],
    // Eurasia
    [
      [70, 30], [75, 80], [70, 130], [60, 170], [45, 145], [35, 120], [22, 115],
      [10, 105], [15, 100], [22, 88], [25, 68], [15, 50], [30, 32], [36, -5],
      [44, -1], [50, 2], [58, 5], [65, 15], [70, 25]
    ],
    // Africa
    [
      [36, -5], [37, 10], [32, 32], [12, 44], [-5, 40], [-20, 35], [-34, 20],
      [-34, 18], [-15, 12], [5, 0], [15, -17], [25, -15], [35, -5]
    ],
    // Australia
    [
      [-12, 130], [-15, 137], [-10, 142], [-20, 148], [-35, 150], [-38, 145],
      [-35, 117], [-22, 114], [-15, 125]
    ],
    // India sub-peninsula
    [
      [30, 72], [28, 77], [25, 85], [22, 88], [15, 80], [8, 77], [15, 74], [22, 69]
    ]
  ];

  continents.forEach((poly) => {
    ctx.beginPath();
    poly.forEach(([lat, lon], idx) => {
      const [x, y] = toXY(lat, lon);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "#1b3323";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#274c34";
    ctx.stroke();
  });

  // Topographic elevation ridges / mountains (brown/beige)
  ctx.fillStyle = "#3e3725";
  [
    // Andes
    [[-10, -75], [-20, -68], [-35, -70], [-50, -72]],
    // Himalayas
    [[35, 75], [30, 80], [28, 88], [27, 95]],
    // Rockies
    [[60, -135], [50, -115], [40, -105], [30, -102]],
    // Alps
    [[45, 6], [47, 10], [46, 14]]
  ].forEach((ridge) => {
    ctx.beginPath();
    ridge.forEach(([lat, lon], idx) => {
      const [x, y] = toXY(lat, lon);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#4d422a";
    ctx.lineCap = "round";
    ctx.stroke();
  });

  // Atmospheric cloud swirls
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  for (let i = 0; i < 45; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    const rw = 80 + Math.random() * 220;
    const rh = 15 + Math.random() * 40;
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw, rh, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lat / Long subtle cartographic grid lines
  ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
  ctx.lineWidth = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
