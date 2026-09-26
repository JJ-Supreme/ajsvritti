import { redirect } from "next/navigation";
import Navbar from "../_components/Navbar";
import Sidebar from "../_components/Sidebar";
import { getServerAuth } from "@/lib/auth-server";
import { isAdminEmail } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  description: "Admin panel for AJS Vritti Vision Marketing",
  robots: { index: false, follow: false },
};

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getServerAuth();
  if (!user) redirect("/sign-in?redirect_url=/admin");
  if (!isAdminEmail(user.email)) redirect("/access-denied");

  return (
    <div className="h-full">
      <Navbar email={user.email} />
      <main className="pt-14 flex h-full gap-x-7">
        <div className="w-64 shrink-0 hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0 overflow-x-auto pr-3 sm:pr-4">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
