import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              AJS Vritti <span className="text-primary">Vision Marketing</span>
            </h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Your trusted partner for high-quality IT hardware and computer
              accessories. Powering your technology, one connection at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">Products</Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/my-orders" className="hover:text-white transition-colors">Track Order</Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-4">
              Policies
            </h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="hover:text-white transition-colors">Cancellation Policy</Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-white transition-colors">Return Policy</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li className="flex items-start gap-3">
                <Mail className="text-primary mt-0.5 flex-shrink-0" size={14} strokeWidth={1.5} />
                <a href="mailto:ajsvrttivision@gmail.com" className="hover:text-white transition-colors break-all">
                  ajsvrttivision@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-primary mt-0.5 flex-shrink-0" size={14} strokeWidth={1.5} />
                <span>8383903347</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-primary mt-0.5 flex-shrink-0" size={14} strokeWidth={1.5} />
                <address className="not-italic text-sm leading-relaxed">
                  H. IN. KH. No. 293, S/F, Western Marg,
                  Saidulajab, Near Kher Singh Estate,
                  New Delhi – 110030, Delhi, India
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30">
          <p>
            &copy; {new Date().getFullYear()} AJS VRITTI VISION MARKETING PRIVATE LIMITED. All
            rights reserved.
          </p>
          <p>Secure Payment &middot; Verified Seller</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
