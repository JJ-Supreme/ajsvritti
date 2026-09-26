import Link from "next/link";

export const metadata = {
  title: "Careers",
  description: "Join AJS Vritti Vision Marketing - open roles across operations, procurement, sales and customer support.",
};

const CareersPage = () => {
  return (
    <main className="min-h-[60vh] max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold mb-4">Careers at AJS Vritti Vision Marketing</h1>
      <p className="text-gray-600 mb-4">
        We are growing our team across operations, procurement, sales, and customer support.
      </p>
      <p className="text-gray-600 mb-8">
        Share your resume and role preference at{' '}
        <a href="mailto:ajsvrttivision@gmail.com" className="text-blue-600 hover:underline">
          ajsvrttivision@gmail.com
        </a>
        .
      </p>
      <Link
        href="/contact-us"
        className="inline-flex rounded bg-primary px-4 py-2 text-white font-semibold hover:opacity-90"
      >
        Contact Recruiting
      </Link>
    </main>
  );
};

export default CareersPage;
