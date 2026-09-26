import { Metadata } from 'next';
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Welcome to AJS Vritti Vision Marketing - Your trusted destination for high-quality IT hardware and computer accessories.',
}

export default function AboutUs() {
  return (
    <>
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">About Us</h1>

      <div className="prose max-w-none text-sm sm:text-base">
        <p className="text-base sm:text-lg mb-4 sm:mb-6">
          Welcome to <strong>AJS VRITTI VISION MARKETING</strong>, your trusted destination for high-quality IT hardware and computer accessories.
        </p>
        <p className="text-lg mb-6">
          AJS VRITTI VISION MARKETING is operated by <strong>AJS VRITTI VISION MARKETING PRIVATE LIMITED</strong>, an e-commerce company dedicated to providing reliable and cost-effective technology products for individuals, businesses, and professionals. We specialize in online retail of IT hardware and computer equipment, offering products that support everyday computing, connectivity, and digital infrastructure needs.
        </p>
        <p className="text-lg mb-6">
          Our product range includes a wide variety of computer cables and accessories, such as HDMI cables, DisplayPort (DP) cables, LAN cables, and other essential IT peripherals. Each product is carefully selected to ensure durability, performance, and compatibility with modern devices.
        </p>

        <h3 className="text-xl font-semibold mb-4">Our Commitment</h3>
        <p className="text-lg mb-6">
          At AJS VRITTI VISION MARKETING, we are committed to:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Delivering genuine and quality-tested products</li>
          <li>Offering a smooth and secure online shopping experience</li>
          <li>Providing reliable customer support and timely delivery</li>
        </ul>

        <p className="text-lg mb-6">
          Our mission is to make IT hardware easily accessible through a convenient online platform, helping customers stay connected and productive in a rapidly evolving digital world.
        </p>
        <p className="text-lg mb-6 font-medium">
          Thank you for choosing AJS VRITTI VISION MARKETING — powering your technology, one connection at a time.
        </p>

        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Registered Office</h2>
          <p className="text-gray-700">
            <strong>AJS VRITTI VISION MARKETING PRIVATE LIMITED</strong><br />
            H. IN. KH. No. 293, S/F, Western Marg,<br />
            Saidulajab, Near Kher Singh Estate,<br />
            New Delhi – 110030, Delhi, India<br />
            Email: ajsvrttivision@gmail.com<br />
            Phone: 8383903347
          </p>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
