import SidebarProducts from "./_components/sidebar-products";
import SortItems from "./_components/sort-items";
import Footer from "@/components/footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="min-h-full w-full py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row mx-auto max-w-7xl gap-6 sm:gap-8">
        <SidebarProducts />
        <div className="flex-1 min-w-0">
          <SortItems />
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
