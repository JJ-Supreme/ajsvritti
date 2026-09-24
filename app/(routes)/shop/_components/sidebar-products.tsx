import { getAllProductsFromDB, getProductCategoriesFromDB, getTopLevelCategoriesFromDB } from "@/lib/serverDataAccess";
import SidebarItems from "./sidebar-items";
import PriceInput from "./price-input";

const SidebarProducts = async () => {
  const data = await getAllProductsFromDB();
  const categories = await getProductCategoriesFromDB();
  const topLevelCategories = await getTopLevelCategoriesFromDB();

  return (
    <div className="w-full sm:w-64 flex-shrink-0 flex flex-col gap-y-4">
      <SidebarItems categories={categories} topLevelCategories={topLevelCategories} />
      <PriceInput data={data} />
    </div>
  );
};

export default SidebarProducts;
