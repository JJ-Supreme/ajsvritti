// Footer data constants for AJS Vritti Vision Marketing e-commerce footer

export interface FooterCategory {
  name: string;
  url: string;
}

export interface FooterCategorySection {
  title: string;
  categories: FooterCategory[];
}

export interface AboutContentSection {
  title: string;
  content: string;
}

// About AJS Vritti Vision Marketing content sections
export const ABOUT_CONTENT: AboutContentSection[] = [
  {
    title: "Premium IT Hardware & Accessories",
    content:
      "AJS Vritti Vision Marketing is your premier source for high-quality computer peripherals and connectivity solutions. We specialize in providing reliable hardware that powers businesses and personal workstations alike.",
  },
  {
    title: "Extensive Range of Cables",
    content:
      "Find every connection you need with our comprehensive selection of cables. From high-speed HDMI and DisplayPort cables for crystal-clear visuals to robust LAN cables for stable networking, we have it all.",
  },
  {
    title: "Quality You Can Trust",
    content:
      "We understand that reliability is paramount in IT infrastructure. That's why all our products undergo rigorous quality checks to ensure they meet the highest standards of performance and durability.",
  },
  {
    title: "Seamless Online Shopping",
    content:
      "Experience a hassle-free shopping journey with AJS Vritti Vision Marketing. Our user-friendly platform, secure payment options, and prompt delivery services ensure you get what you need, when you need it.",
  },
  {
    title: "Business & Bulk Solutions",
    content:
      "Whether you're upgrading a single home office or outfitting an entire corporate workspace, we offer competitive pricing and support for orders of all sizes.",
  },
];

// Product category sections with links
// Note: These URLs point to search queries. In a real scenario, these would map to actual categories in the DB.
export const FOOTER_CATEGORIES: FooterCategorySection[] = [
  {
    title: "Cables & Connectivity",
    categories: [
      { name: "HDMI Cables", url: "/shop?category=HDMI Cables" },
      { name: "DisplayPort Cables", url: "/shop?category=DisplayPort Cables" },
      { name: "LAN / Ethernet Cables", url: "/shop?category=LAN Cables" },
      { name: "USB Cables", url: "/shop?category=USB Cables" },
      { name: "VGA Cables", url: "/shop?category=VGA Cables" },
      { name: "Audio Cables", url: "/shop?category=Audio Cables" },
    ],
  },
  {
    title: "Computer Peripherals",
    categories: [
      { name: "Keyboards", url: "/shop?category=Keyboards" },
      { name: "Mice", url: "/shop?category=Mice" },
      { name: "Webcams", url: "/shop?category=Webcams" },
      { name: "Mouse Pads", url: "/shop?category=Mouse Pads" },
      { name: "Headsets", url: "/shop?category=Headsets" },
    ],
  },
  {
    title: "Networking",
    categories: [
      { name: "Routers", url: "/shop?category=Routers" },
      { name: "Switches", url: "/shop?category=Switches" },
      { name: "Network Adapters", url: "/shop?category=Network Adapters" },
      { name: "Wi-Fi Extenders", url: "/shop?category=Wi-Fi Extenders" },
    ],
  },
  {
    title: "Components & Storage",
    categories: [
      { name: "SSDs", url: "/shop?category=SSDs" },
      { name: "Hard Drives", url: "/shop?category=Hard Drives" },
      { name: "RAM Modules", url: "/shop?category=RAM Modules" },
      { name: "External Enclosures", url: "/shop?category=External Enclosures" },
    ],
  },
  {
    title: "Accessories",
    categories: [
      { name: "USB Hubs", url: "/shop?category=USB Hubs" },
      { name: "Laptop Stands", url: "/shop?category=Laptop Stands" },
      { name: "Cable Management", url: "/shop?category=Cable Management" },
      { name: "Cleaning Kits", url: "/shop?category=Cleaning Kits" },
    ],
  },
];

// Community content
export const COMMUNITY_CONTENT = {
  title: "Join the AJS Vritti Vision Marketing Community",
  description:
    "Stay connected with the latest in IT hardware. AJS Vritti Vision Marketing is committed to empowering your digital life with quality products and exceptional service. For any queries, contact us at ajsvrttivision@gmail.com.",
};
