import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation Policy',
  description: 'Cancellation Policy for AJS Vritti Vision Marketing.',
}

export default function CancellationPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Cancellation Policy</h1>

      <div className="prose max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">Order Cancellation by the Customer</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Customers may cancel their orders within 24 hours of placing the order by contacting our customer support team.</li>
            <li>After 24 hours, orders cannot be cancelled as they will already be processed for shipping.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Order Cancellation by AJS VRITTI VISION MARKETING PRIVATE LIMITED</h2>
          <p className="mb-4">We reserve the right to cancel an order under the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The product is out of stock.</li>
            <li>Payment is not received or fails verification.</li>
            <li>Any discrepancies or fraudulent activity are detected in the order.</li>
          </ul>
          <p className="mt-4">In such cases, customers will be notified promptly, and a full refund will be issued within 7 working days.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Need Assistance?</h2>
          <p className="mb-2">For any questions or assistance regarding order cancellations, please contact our support team:</p>
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
