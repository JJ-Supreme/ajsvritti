import Link from "next/link";
import { FOOTER_CATEGORIES } from "./footer-data";

const FooterCategoryLinks = () => {
  return (
    <div className="mb-10">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Online Shopping</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {FOOTER_CATEGORIES.map((section, index) => (
          <div key={index}>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              {section.title}
            </h4>
            <ul className="space-y-2">
              {section.categories.map((category, catIndex) => (
                <li key={catIndex}>
                  <Link
                    href={category.url}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors inline-block"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FooterCategoryLinks;
