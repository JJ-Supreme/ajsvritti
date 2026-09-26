import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

type Props = {
  title: string;
  description: string;
  count?: number;
  url?: string;
  action?: React.ReactNode;
};

const TitleHeader = ({ title, description, count, url, action }: Props) => {
  return (
    <div className="flex border-b flex-col mb-4 pb-2">
      <div className="flex justify-between items-center gap-2">
        <h1 className="font-bold text-xl sm:text-2xl truncate">
          {title} {count !== undefined ? `(${count})` : ""}
        </h1>
        {action}
        {url && (
          <Link href={url}>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-1" />
              Add New
            </Button>
          </Link>
        )}
      </div>
      <p className="text-gray-700 text-sm">{description}</p>
    </div>
  );
};

export default TitleHeader;
