import { getDeviceId, privacyHeaders } from "@/lib/privacy";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const deviceId = getDeviceId(request);
  return Response.json(
    { deviceId, label: `Guest · ${deviceId.slice(0, 6).toUpperCase()}` },
    { headers: privacyHeaders() },
  );
}
