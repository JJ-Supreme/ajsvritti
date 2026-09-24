import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AJS Vritti Vision Marketing',
  description: 'Privacy Policy for AJS Vritti Vision Marketing - How we collect, use, and protect your data.',
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8 text-center">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose max-w-none space-y-8">
        <p>
          At <strong>AJS VRITTI VISION MARKETING</strong>, operated by <strong>AJS VRITTI VISION MARKETING PRIVATE LIMITED</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you visit or make a purchase on our website.
        </p>

        <section>
          <h2 className="text-xl font-bold mb-4">1. Information We Collect</h2>
          <p className="mb-4">When you place an order or interact with our website, we may collect the following personal information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Full Name</li>
            <li>Phone Number</li>
            <li>Email Address</li>
            <li>Shipping Address, including PIN Code</li>
          </ul>
          <p className="mt-4">We collect only the information necessary to process your orders and provide our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">The information collected is used for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process and deliver your orders</li>
            <li>To verify customer identity and contact details</li>
            <li>To communicate order updates, shipping details, or support queries</li>
            <li>To comply with legal and regulatory requirements</li>
            <li>To improve our customer service and shopping experience</li>
          </ul>
          <p className="mt-4">We do not sell or rent your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. Data Sharing & Disclosure</h2>
          <p className="mb-4">Your personal information may be shared only with trusted third parties when required, such as:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Logistics and courier partners for order delivery</li>
            <li>Payment gateways for secure transaction processing</li>
            <li>Government or regulatory authorities, if required by law</li>
          </ul>
          <p className="mt-4">All third parties are required to handle your data securely and confidentially.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Access to customer data is restricted to authorized personnel only.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">5. Data Retention</h2>
          <p className="mb-4">We retain your personal information only for as long as necessary to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fulfill the purpose for which it was collected</li>
            <li>Meet legal, accounting, or regulatory requirements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">6. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Request access to your personal data</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your data, subject to legal obligations</li>
          </ul>
          <p className="mt-4">You may contact us at any time to exercise these rights.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">7. Cookies</h2>
          <p>Our website may use cookies to enhance user experience and website functionality. Cookies do not collect personally identifiable information.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">9. Contact Us</h2>
          <p className="mb-2">If you have any questions or concerns regarding this Privacy Policy or how your data is handled, please contact us at:</p>
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
