import { getCloudflareContext } from "@opennextjs/cloudflare";

const FALLBACK_SALT = "chor-sipahi-local-privacy-salt";


function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;

  const K: number[] = [];
  const H: number[] = [];
  const isPrime: Record<number, boolean> = {};
  let candidate = 2;
  
  while (K[lengthProperty] < 64) {
    if (!isPrime[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isPrime[i] = true;
      }
      K.push((mathPow(candidate, 1/3) * maxWord) | 0);
      H.push((mathPow(candidate, 1/2) * maxWord) | 0);
    }
    candidate++;
  }
  
  const words: number[] = [];
  const asciiLength = ascii[lengthProperty];
  const wordsLength = ((asciiLength + 8) >> 6) + 1;
  for (i = 0; i < wordsLength * 16; i++) words[i] = 0;
  
  for (i = 0; i < asciiLength; i++) {
    words[i >> 2] |= ascii.charCodeAt(i) << (24 - (i % 4) * 8);
  }
  
  words[asciiLength >> 2] |= 0x80 << (24 - (asciiLength % 4) * 8);
  words[wordsLength * 16 - 1] = asciiLength * 8;
  
  for (j = 0; j < words[lengthProperty]; j += 16) {
    const w = words.slice(j, j + 16);
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (i = 0; i < 64; i++) {
      if (i < 16) {
        w[i] = w[i] || 0;
      } else {
        const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      const ch = (e & f) ^ (~e & g);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const temp1 = (h + s1 + ch + K[i] + w[i]) | 0;
      const temp2 = (s0 + maj) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }
    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }
  
  let result = '';
  for (i = 0; i < 8; i++) {
    const val = H[i] >>> 0;
    result += val.toString(16).padStart(8, '0');
  }
  return result;
}

export function getDeviceSalt(): string {
  try {
    const context = getCloudflareContext();
    const envSalt = (context?.env as any)?.DEVICE_ID_SALT;
    if (envSalt) return envSalt;
  } catch {
    // getCloudflareContext may throw outside request handlers
  }
  return process.env.DEVICE_ID_SALT || FALLBACK_SALT;
}

export function hashDeviceSeed(seed: string): string {
  const salt = getDeviceSalt();
  return sha256(`${salt}:${seed}`);
}


export function createGuestSeed(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getDeviceId(request: Request): string {
  const seed = request.headers.get("x-device-seed") || createGuestSeed();
  return hashDeviceSeed(seed);
}

export function privacyHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  };
}
