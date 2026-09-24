import Link from "next/link";

type TitleHeaderProps = {
  title: string;
  url?: string;
};

const TitleHeader = ({ title, url }: TitleHeaderProps) => {
  return (
    <div className="flex justify-between items-center font-semibold px-4 py-6 mt-7">
      <h1 className="font-semibold text-2xl">{title}</h1>
      {url && (
        <Link className="text-sm font-medium text-primary hover:underline" href={url}>
          See All
        </Link>
      )}
    </div>
  );
};

export default TitleHeader;
