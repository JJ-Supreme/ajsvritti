import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Refund Policy for AJS Vritti Vision Marketing.',
}

export default function RefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Refund Policy</h1>
      <p className="text-sm text-gray-500 mb-8 text-center">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose max-w-none space-y-8">
        <p>
          At <strong>AJS VRITTI VISION MARKETING</strong>, operated by <strong>AJS VRITTI VISION MARKETING PRIVATE LIMITED</strong>, customer satisfaction is important to us. This Refund Policy outlines the conditions under which refunds may be issued for purchases made on our website.
        </p>

        <section>
          <h2 className="text-xl font-bold mb-4">1. Eligibility for Refund</h2>
          <p className="mb-4">A refund may be considered under the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The product received is damaged, defective, or incorrect</li>
            <li>The product does not match the description at the time of purchase</li>
            <li>The order was cancelled before shipment</li>
          </ul>
          <p className="mt-4">All refund requests must be raised within <strong>7 days</strong> of delivery.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. Non-Refundable Items</h2>
          <p className="mb-4">Refunds will not be applicable in the following cases:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Products damaged due to misuse, mishandling, or improper installation</li>
            <li>Normal wear and tear</li>
            <li>Requests made after the allowed refund period</li>
            <li>Products without original packaging, accessories, or proof of purchase</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. Refund Process</h2>
          <p className="mb-4">To request a refund, customers must contact us with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Order ID</li>
            <li>Product details</li>
            <li>Reason for refund</li>
            <li>Supporting images or videos (if applicable)</li>
          </ul>
          <p className="mt-4">Once the request is reviewed and approved, we will notify you via email.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Mode of Refund</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Approved refunds will be processed to the original mode of payment</li>
            <li>Refunds may take 5–10 business days to reflect, depending on the bank or payment provider</li>
          </ul>
          <p className="mt-4">Shipping charges (if any) are non-refundable, unless the return is due to our error.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">5. Replacement Option</h2>
          <p>In certain cases, we may offer a replacement instead of a refund, subject to product availability and customer preference.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">6. Cancellation Policy</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Orders can be cancelled before dispatch for a full refund</li>
            <li>Once the order has been shipped, cancellation requests may not be accepted</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">7. Contact Us</h2>
          <p className="mb-2">For refund or cancellation requests, please contact us at:</p>
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
