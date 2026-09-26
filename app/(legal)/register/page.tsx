import Link from "next/link";

export const metadata = {
  title: "Business Registration",
  description: "Register your business with AJS Vritti Vision Marketing for GST invoicing, bulk pricing and credit terms.",
};

const RegisterPage = () => {
  return (
    <main className="min-h-[60vh] max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-3xl font-bold mb-4">Register Your Business</h1>
      <p className="text-gray-600 mb-4">
        Create a business account to get GST invoices, bulk pricing, and priority support.
      </p>
      <p className="text-gray-600 mb-8">
        Send your company details and GST number to{' '}
        <a href="mailto:ajsvrttivision@gmail.com" className="text-blue-600 hover:underline">
          ajsvrttivision@gmail.com
        </a>
        .
      </p>
      <Link
        href="/contact-us"
        className="inline-flex rounded bg-primary px-4 py-2 text-white font-semibold hover:opacity-90"
      >
        Start Registration
      </Link>
    </main>
  );
};

export default RegisterPage;
