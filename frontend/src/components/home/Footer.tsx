import {
  GraduationCap,
  Github,
  Twitter,
  Linkedin,
  ArrowUp,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="pt-20 pb-10 border-t border-border transition-colors duration-300 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <GraduationCap className="text-primary-foreground w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground uppercase">
                NSTI KANPUR
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              National Skill Training Institute, Kanpur. A premier institute 
              under DGT, Ministry of Skill Development and Entrepreneurship, 
              Government of India.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all text-muted-foreground shadow-sm"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all text-muted-foreground shadow-sm"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all text-muted-foreground shadow-sm"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6 text-lg">
              Quick Links
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  CITS Admissions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Advanced Diploma
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  NCVT MIS Portal
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Apprenticeship
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6 text-lg">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="text-muted-foreground text-sm">
                Govind Nagar, Kanpur, <br />
                Uttar Pradesh - 208006
              </li>
              <li className="text-muted-foreground text-sm">
                Email: nsti-kanpur@dgt.gov.in
              </li>
              <li className="text-muted-foreground text-sm">
                Phone: +91-512-2296127
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6 text-lg">
              Stay Informed
            </h4>
            <p className="text-muted-foreground mb-6">
              Subscribe for latest updates on training and placement.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email address"
                className="bg-card border border-border rounded-l-lg px-4 py-3 text-card-foreground focus:outline-none w-full shadow-inner"
              />
              <button className="bg-primary text-primary-foreground px-4 py-3 rounded-r-lg font-bold hover:opacity-90 transition-colors shadow-lg shadow-primary/10">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© 2026 NSTI Kanpur. Under DGT, Ministry of Skill Development & Entrepreneurship.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="mt-6 md:mt-0 p-3 rounded-full bg-card border border-border hover:border-primary transition-all group shadow-sm hover:shadow-md"
          >
            <ArrowUp className="w-5 h-5 group-hover:text-primary text-muted-foreground" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
