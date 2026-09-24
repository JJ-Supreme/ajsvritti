import { Metadata } from 'next';
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: 'Contact Us | AJS Vritti Vision Marketing',
  description: 'Get in touch with AJS Vritti Vision Marketing for sales inquiries, support, or any questions about our IT hardware and computer accessories.',
}

export default function ContactUs() {
  return (
    <>
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Contact Us</h1>

      <div className="prose max-w-none space-y-8">
        <p>
          We would love to hear from you! Whether you have a question about our products, need help with an order, or want to learn more about what we offer, the <strong>AJS Vritti Vision Marketing</strong> team is here to assist you.
        </p>

        <section>
          <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
          <p className="mb-4">You can reach us through the following channels:</p>
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 space-y-3">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:ajsvrttivision@gmail.com" className="text-blue-600 hover:underline">
                ajsvrttivision@gmail.com
              </a>
            </p>
            <p>
              <strong>Phone:</strong> 8383903347
            </p>
            <p>
              <strong>Website:</strong>{' '}
              <a href="https://ajsvision.shop" className="text-blue-600 hover:underline">
                ajsvision.shop
              </a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Registered Office</h2>
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 space-y-3">
            <p><strong>Company Name:</strong> AJS VRITTI VISION MARKETING PRIVATE LIMITED</p>
            <p>
              <strong>Address:</strong> H. IN. KH. No. 293, S/F, Western Marg, Saidulajab, Near Kher Singh Estate, New Delhi – 110030, Delhi, India
            </p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:ajsvrttivision@gmail.com" className="text-blue-600 hover:underline">
                ajsvrttivision@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Business Information</h2>
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 space-y-3">
            <p><strong>Business Category:</strong> Ecommerce, Electronic Sales</p>
            <p><strong>Specialization:</strong> IT Hardware and Computer Equipment</p>
            <p><strong>Sales in:</strong> India</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Business Hours</h2>
          <p>Our support team is available during standard business hours (Monday to Saturday). We strive to respond to all inquiries within 24–48 hours.</p>
        </section>

        <p className="text-gray-600">
          Thank you for choosing <strong>AJS Vritti Vision Marketing</strong> — we look forward to assisting you!
        </p>
      </div>
    </div>
    <Footer />
    </>
  );
}
