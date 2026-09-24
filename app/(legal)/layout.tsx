import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

const LegalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-full h-full w-full">
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};

export default LegalLayout;
