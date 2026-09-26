import TitleHeader from "../../_components/title-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminEmails } from "@/lib/admin-auth";
import { CLIENT_SLUG, COMPANY_DETAILS } from "@/config/client";

export const dynamic = "force-dynamic";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-2 text-sm border-b last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right break-all">{value}</span>
  </div>
);

const SettingsPage = () => {
  return (
    <div className="p-3 sm:p-4 mt-2 max-w-2xl">
      <TitleHeader title="Settings" description="Read-only store configuration" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Brand" value={COMPANY_DETAILS.brandName} />
          <Row label="Domain" value={COMPANY_DETAILS.domain} />
          <Row label="Client slug" value={CLIENT_SLUG} />
          <Row label="Admin accounts configured" value={getAdminEmails().length} />
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-3">
        Admin access is controlled by the <code>ADMIN_EMAILS</code> environment variable on Vercel (comma-separated).
      </p>
    </div>
  );
};

export default SettingsPage;
