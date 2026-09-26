import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return Policy',
  description: 'Return Policy for AJS Vritti Vision Marketing. Learn about our return eligibility, process, and timelines.',
}

export default function ReturnPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Return Policy</h1>
      <p className="text-sm text-gray-500 mb-8 text-center">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose max-w-none space-y-8">
        <p>
          At <strong>AJS VRITTI VISION MARKETING</strong>, operated by <strong>AJS VRITTI VISION MARKETING PRIVATE LIMITED</strong>, we want you to be completely satisfied with your purchase. If you are not happy with your order, you may return eligible items within the timeframe specified below.
        </p>

        <section>
          <h2 className="text-xl font-bold mb-4">1. Return Eligibility</h2>
          <p className="mb-4">Items may be returned within <strong>7 days</strong> of delivery, provided they meet the following conditions:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The product is unused, undamaged, and in its original packaging</li>
            <li>All accessories, manuals, and free items included with the product are returned</li>
            <li>The product has not been installed or configured (for hardware components)</li>
            <li>A valid proof of purchase (order ID or invoice) is provided</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. Non-Returnable Items</h2>
          <p className="mb-4">The following items are not eligible for return:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Software licenses, digital downloads, and subscription products</li>
            <li>Products damaged due to misuse, mishandling, or improper installation</li>
            <li>Consumable items such as ink cartridges, toner, and batteries that have been opened or used</li>
            <li>Custom-configured or built-to-order systems</li>
            <li>Items without original packaging, seals, or labels</li>
            <li>Products returned after the 7-day return window</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. How to Initiate a Return</h2>
          <p className="mb-4">To initiate a return, please follow these steps:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Contact our support team via email with your Order ID and reason for return</li>
            <li>Our team will review your request and provide a Return Authorization within 1-2 business days</li>
            <li>Once approved, pack the item securely in its original packaging</li>
            <li>Ship the item back to the address provided in the Return Authorization</li>
          </ol>
          <p className="mt-4">Please do not ship returns without a Return Authorization. Unauthorized returns may be refused.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Return Shipping</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>If the return is due to a defective or incorrect product, AJS Vritti Vision Marketing will cover the return shipping cost</li>
            <li>For all other returns (change of mind, wrong order placed by customer), the customer is responsible for return shipping charges</li>
            <li>We recommend using a trackable shipping service to ensure safe delivery of the returned item</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">5. Refund or Exchange</h2>
          <p className="mb-4">Once we receive and inspect the returned item:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>If approved, a refund will be processed to the original payment method within 5-10 business days</li>
            <li>Alternatively, you may opt for an exchange or store credit, subject to product availability</li>
            <li>Shipping charges paid on the original order are non-refundable, unless the return is due to our error</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">6. Contact Us</h2>
          <p className="mb-2">For return requests or questions about this policy, please contact us at:</p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p><strong>Company Name:</strong> AJS VRITTI VISION MARKETING PRIVATE LIMITED</p>
            <p><strong>Website:</strong> ajsvision.shop</p>
            <p><strong>Email:</strong> ajsvrttivision@gmail.com</p>
            <p><strong>Contact Number:</strong> 8383903347</p>
          </div>
        </section>
      </div>
    </div>
  );
}
