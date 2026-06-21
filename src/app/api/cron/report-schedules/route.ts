import { processDueSchedules } from "@/services/report/schedule-service";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ success: false, error: { code: "UNAUTHORIZED" } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await processDueSchedules();
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
