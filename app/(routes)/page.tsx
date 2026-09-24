import Footer from "@/components/footer";
import Container from "@/components/ui/container";
import ProductCard from "@/components/ui/product-card";
import { getFeaturedProductsFromDB } from "@/lib/serverDataAccess";
import Link from "next/link";
import { ArrowRight, Monitor, Cable, Network, Server, Shield, Headphones } from "lucide-react";

export const dynamic = "force-dynamic";

const services = [
  {
    icon: Monitor,
    title: "IT Hardware Supply",
    desc: "Complete range of IT hardware and peripherals for businesses and professionals.",
  },
  {
    icon: Cable,
    title: "Cables & Connectivity",
    desc: "HDMI, DisplayPort, LAN, USB and all essential connectivity solutions.",
  },
  {
    icon: Network,
    title: "Networking Solutions",
    desc: "Routers, switches, network adapters and enterprise connectivity equipment.",
  },
  {
    icon: Server,
    title: "Infrastructure Support",
    desc: "Components, storage solutions and digital infrastructure products.",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    desc: "Every product is quality-tested for durability, performance and compatibility.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    desc: "Reliable customer support and technical assistance for all your needs.",
  },
];

const HomePage = async () => {
  const featuredProducts = await getFeaturedProductsFromDB(8);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-foreground via-foreground/95 to-foreground text-white">
        <Container>
          <div className="py-16 sm:py-20 lg:py-28">
            <div className="max-w-3xl lg:max-w-4xl">
              <p className="text-primary font-semibold text-xs sm:text-sm tracking-widest uppercase mb-4 sm:mb-5">
                IT Solutions & Digital Services
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] mb-5 sm:mb-7">
                Powering Your Technology,{" "}
                <span className="text-primary">One Connection at a Time</span>
              </h1>
              <p className="text-white/60 text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 max-w-2xl leading-relaxed">
                AJS Vritti Vision Marketing is your trusted partner for
                high-quality IT hardware, computer accessories, and digital
                infrastructure solutions for businesses and professionals.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link
                  href="/shop"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  Explore Products <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact-us"
                  className="border border-white/20 hover:border-white/40 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-200 text-sm sm:text-base"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="py-10 sm:py-16 lg:py-24 bg-surface-1">
        <Container>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3">
              What We Offer
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive IT hardware and digital solutions to support your
              business infrastructure needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, i) => (
              <div
                key={i}
                className="bg-white p-5 sm:p-8 rounded-lg border border-border hover:shadow-soft-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-accent mb-4">
                  <service.icon
                    className="text-primary h-6 w-6"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* About Section */}
      <section className="py-10 sm:py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-primary font-semibold text-xs tracking-widest uppercase mb-3">
                About Us
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-4 sm:mb-6">
                Your Trusted IT Hardware Partner
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                AJS VRITTI VISION MARKETING is operated by AJS VRITTI VISION
                MARKETING PRIVATE LIMITED, an e-commerce company dedicated to
                providing reliable and cost-effective technology products for
                individuals, businesses, and professionals.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our product range includes computer cables and accessories such
                as HDMI cables, DisplayPort cables, LAN cables, and other
                essential IT peripherals — carefully selected to ensure
                durability, performance, and compatibility.
              </p>
              <Link
                href="/about-us"
                className="text-primary font-semibold inline-flex items-center gap-2 hover:underline text-sm"
              >
                Learn more about us <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-surface-1 rounded-xl border border-border p-6 sm:p-10">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {[
                  { value: "500+", label: "Products" },
                  { value: "25K+", label: "PIN Codes Served" },
                  { value: "100%", label: "Genuine Products" },
                  { value: "24/7", label: "Customer Support" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-2 sm:p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Products Preview */}
      {featuredProducts.length > 0 && (
        <section className="py-10 sm:py-16 lg:py-24 bg-surface-1">
          <Container>
            <div className="flex justify-between items-end mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                  Our Products
                </h2>
                <p className="text-muted-foreground">
                  Browse our range of quality IT hardware and accessories.
                </p>
              </div>
              <Link
                href="/shop"
                className="text-primary font-semibold text-sm hover:underline hidden md:inline-flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} data={product} />
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link
                href="/shop"
                className="text-primary font-semibold hover:underline inline-flex items-center gap-1 text-sm"
              >
                View All Products <ArrowRight size={14} />
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-10 sm:py-16 lg:py-24 bg-foreground text-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/40 mb-6 sm:mb-8 text-sm sm:text-base">
              Whether you need a single cable or a full infrastructure setup,
              we are here to help. Contact us for bulk pricing, GST invoicing,
              and expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                Browse Products
              </Link>
              <Link
                href="/contact-us"
                className="border border-white/20 hover:border-white/40 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-200 text-sm sm:text-base"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
