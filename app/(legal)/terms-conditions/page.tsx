import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | AJS Vritti Vision Marketing',
  description: 'Terms & Conditions for AJS Vritti Vision Marketing.',
}

export default function TermsConditions() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Terms & Conditions</h1>
      <p className="text-sm text-gray-500 mb-8 text-center">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose max-w-none space-y-8">
        <p>
          Welcome to <strong>AJS VRITTI VISION MARKETING</strong>! By accessing and using our website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully before using our services or making a purchase.
        </p>

        <section>
          <h2 className="text-xl font-bold mb-4">1. General Information</h2>
          <p>1.1 AJS VRITTI VISION MARKETING PRIVATE LIMITED (trading as AJS Vritti Vision Marketing) is an online e-commerce store that sells IT hardware and computer equipment such as HDMI cables, DisplayPort cables, LAN cables, and other related products.</p>
          <p>1.2 These Terms & Conditions govern your use of the website and your purchase of products. By using our website or purchasing products, you agree to these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. Account and Registration</h2>
          <p>2.1 To access certain services and make purchases, you may be required to create an account.</p>
          <p>2.2 You are responsible for maintaining the confidentiality of your account information and for all activities under your account.</p>
          <p>2.3 By creating an account, you agree to provide accurate and current information.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. Product Information</h2>
          <p>3.1 We strive to provide accurate product descriptions, including images, specifications, and pricing. However, actual products may vary slightly due to screen resolution or manufacturer differences.</p>
          <p>3.2 Product prices may change at any time and are subject to availability.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Order Placement and Payment</h2>
          <p>4.1 By placing an order, you are making an offer to purchase products subject to acceptance.</p>
          <p>4.2 Payments are processed securely through our payment gateways and must be completed before shipping.</p>
          <p>4.3 All payments must be made in the currency accepted on the website.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">5. Shipping and Delivery</h2>
          <p>5.1 We will ship orders to the address provided at checkout. Shipping costs will be displayed during checkout and may vary based on location.</p>
          <p>5.2 Delivery times are estimates and may vary depending on shipping method, logistics partners, and delivery location.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">6. Refunds and Returns</h2>
          <p>6.1 Refunds, returns, and exchanges are governed by our Refund Policy, which is available separately on the website.</p>
          <p>6.2 By making a purchase, you agree to follow the procedures and conditions outlined in the Refund Policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">7. Intellectual Property</h2>
          <p>7.1 All content on the website, including text, images, logos, graphics, and product descriptions, is the intellectual property of AJS VRITTI VISION MARKETING PRIVATE LIMITED and is protected by copyright and other applicable laws.</p>
          <p>7.2 You may not use, reproduce, modify, or distribute any content from this website without prior written consent.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">8. Privacy Policy</h2>
          <p>8.1 By using our website, you consent to the collection and use of your personal information as outlined in our Privacy Policy.</p>
          <p>8.2 We will not share your personal information with third parties except as necessary to complete your orders or as required by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">9. Limitation of Liability</h2>
          <p>9.1 AJS VRITTI VISION MARKETING PRIVATE LIMITED is not liable for any indirect, incidental, special, or consequential damages arising from the use of this website or the purchase of products.</p>
          <p>9.2 We are not responsible for any third-party websites linked from our site.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">10. Changes to Terms and Conditions</h2>
          <p>10.1 We reserve the right to update, modify, or change these terms and conditions at any time. Any changes will be posted on this page with an updated effective date.</p>
          <p>10.2 It is your responsibility to review these terms periodically for updates.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">11. Governing Law</h2>
          <p>11.1 These terms and conditions are governed by the laws of India. Any disputes arising from these terms will be subject to the exclusive jurisdiction of the courts in India.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">12. Contact Information</h2>
          <p className="mb-2">For questions or concerns regarding these Terms & Conditions, please contact us:</p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p><strong>Company Name:</strong> AJS VRITTI VISION MARKETING PRIVATE LIMITED</p>
            <p><strong>Website:</strong> ajsvision.shop</p>
            <p><strong>Email:</strong> ajsvrttivision@gmail.com</p>
            <p><strong>Phone:</strong> 8383903347</p>
          </div>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          By using the services of AJS Vritti Vision Marketing, you agree to be bound by these Terms & Conditions.<br/>
          © {new Date().getFullYear()} AJS VRITTI VISION MARKETING PRIVATE LIMITED. All rights reserved.
        </p>
      </div>
    </div>
  );
}
