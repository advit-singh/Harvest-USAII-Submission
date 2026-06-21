import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { buildOrganizationExportCsv } from "@/services/organization/export-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    await requireOrgMembership(id, user.id);
    await requirePermission(id, user.id, "org.manage");

    const csv = await buildOrganizationExportCsv(id);
    const fileName = `harvest-export-${id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: error.code, message: error.message },
        }),
        {
          status: error.code === "UNAUTHORIZED" ? 401 : 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    throw error;
  }
}
