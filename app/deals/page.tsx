import { redirect } from "next/navigation";

const DealsPage = () => {
  redirect("/shop?deals=true");
};

export default DealsPage;
