import { Button } from "@/components/ui/button";
import Link from "next/link";

const CreateButton = () => {
  return (
    <Link href="/admin/products/new">
      <Button size="sm" className="bg-green-600 hover:bg-green-700">
        Create Product
      </Button>
    </Link>
  );
};

export default CreateButton;
