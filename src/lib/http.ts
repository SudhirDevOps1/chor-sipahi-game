export async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (response.status === 500 || text.includes("Internal Server Error")) {
      throw new Error(
        "Game server is temporarily offline or database setup is incomplete. Please try again later.",
      );
    }
    throw new Error(
      "Unable to establish connection with the game tables. Please refresh.",
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      "Received invalid data from the server. Please reload the lobby.",
    );
  }
}
