import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaPhone } from "react-icons/fa";

const FooterBrandInfo = () => {
  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">AJS Vritti Vision Marketing</h3>
      <p className="text-xs text-gray-500 mb-4">AJS VRITTI VISION MARKETING PRIVATE LIMITED</p>
      <p className="text-gray-600 mb-4">
        Your trusted destination for high-quality IT hardware and computer accessories. Powering your technology, one connection at a time.
      </p>
      <div className="space-y-3 mb-6 text-gray-600">
        <div className="flex items-start">
          <FaEnvelope className="text-primary mt-1 mr-3 flex-shrink-0" />
          <a href="mailto:ajsvrttivision@gmail.com" className="hover:text-primary transition-colors break-all">
            ajsvrttivision@gmail.com
          </a>
        </div>
        <div className="flex items-start">
          <FaPhone className="text-primary mt-1 mr-3 flex-shrink-0" />
          <span>8383903347</span>
        </div>
        <div className="flex items-start">
          <FaMapMarkerAlt className="text-primary mt-1 mr-3 flex-shrink-0" />
          <address className="not-italic text-sm">
            H. IN. KH. No. 293, S/F, Western Marg,<br />
            Saidulajab, Near Kher Singh Estate,<br />
            New Delhi – 110030, Delhi, India
          </address>
        </div>
      </div>
      <div className="flex space-x-4">
        {[
          { icon: FaFacebook, url: "#", color: "hover:text-blue-600" },
          { icon: FaInstagram, url: "#", color: "hover:text-pink-600" },
          { icon: FaLinkedin, url: "#", color: "hover:text-blue-700" },
          { icon: FaTwitter, url: "#", color: "hover:text-blue-400" }
        ].map((social, index) => (
          <a
            key={index}
            href={social.url}
            className={`text-gray-500 text-xl transition-colors ${social.color}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.icon.name}
          >
            <social.icon />
          </a>
        ))}
      </div>
    </div>
  );
};

export default FooterBrandInfo;
