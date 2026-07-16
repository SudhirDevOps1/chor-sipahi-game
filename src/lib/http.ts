export async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const preview = text.replace(/\s+/g, " ").slice(0, 80);
    throw new Error(`Server returned an unexpected response${preview ? `: ${preview}` : ""}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Server returned invalid JSON. Please refresh and try again.");
  }
}
