import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | AJS Vritti Vision Marketing',
  description: 'Shipping Policy for AJS Vritti Vision Marketing.',
}

export default function ShippingPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Shipping Policy</h1>
      <p className="text-sm text-gray-500 mb-8 text-center">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose max-w-none space-y-8">
        <p>
          At <strong>AJS VRITTI VISION MARKETING</strong>, operated by <strong>AJS VRITTI VISION MARKETING PRIVATE LIMITED</strong>, we aim to provide reliable and timely delivery of our products. This Shipping Policy explains how orders are processed, shipped, and delivered.
        </p>

        <section>
          <h2 className="text-xl font-bold mb-4">1. Shipping Locations</h2>
          <p>We currently ship products within India only. Orders are delivered to the shipping address provided by the customer at the time of checkout, including the correct PIN Code.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. Order Processing Time</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Orders are typically processed within 1–2 business days after successful payment confirmation.</li>
            <li>Orders are not processed or shipped on Sundays or public holidays.</li>
            <li>In case of high order volume or unforeseen circumstances, processing may take slightly longer.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. Shipping Method</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Orders are shipped through third-party courier and logistics partners.</li>
            <li>Shipping method and courier selection are based on delivery location and availability.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Estimated Delivery Time</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Standard delivery time is 5–7 business days, depending on the destination and courier service.</li>
            <li>Delivery timelines are estimates and may vary due to factors beyond our control, such as weather conditions, courier delays, or remote locations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">5. Shipping Charges</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Shipping charges (if applicable) will be clearly displayed at checkout before payment.</li>
            <li>Any additional charges imposed by courier partners for remote or special locations may be applicable.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">6. Order Tracking</h2>
          <p>Once your order is shipped, tracking details will be shared via email or SMS, allowing you to monitor the delivery status.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">7. Incorrect or Incomplete Address</h2>
          <p className="mb-4">Customers are responsible for providing accurate and complete shipping information.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Delays or non-delivery due to incorrect address or PIN Code will not be our responsibility.</li>
            <li>Re-shipping charges may apply in such cases.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">8. Damaged or Lost Shipments</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>If the product is received in a damaged condition, please notify us within 48 hours of delivery with supporting photos/videos.</li>
            <li>In case of lost shipments, we will coordinate with the courier partner to investigate and resolve the issue.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">9. Contact Us</h2>
          <p className="mb-2">For any shipping-related queries, please contact us at:</p>
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
