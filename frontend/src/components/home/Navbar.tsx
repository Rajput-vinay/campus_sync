import { useState, useEffect } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { Link } from "react-router";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-md py-3 shadow-lg" : "bg-transparent py-5"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <GraduationCap className="text-primary-foreground w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground uppercase">
              NSTI <span className="text-primary">KANPUR</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#home"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Home
            </a>
            <a
              href="#programs"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Trades
            </a>
            <a
              href="#stats"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              About
            </a>
            <Link to="/login">
              <button className="bg-primary text-primary-foreground px-5 py-2 rounded-md font-bold hover:opacity-90 transition-all transform hover:scale-105">
                Portal Login
              </button>
            </Link>
          </div>

          {/* Mobile button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? (
                <X className="w-8 h-8" />
              ) : (
                <Menu className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pt-2 pb-6 space-y-4">
          <a
            href="#home"
            className="block text-muted-foreground hover:text-primary text-lg font-medium"
          >
            Overview
          </a>
          <a
            href="#programs"
            className="block text-muted-foreground hover:text-primary text-lg font-medium"
          >
            Programs
          </a>
          <a
            href="#stats"
            className="block text-muted-foreground hover:text-primary text-lg font-medium"
          >
            Research
          </a>
          <a
            href="#assistant"
            className="block text-muted-foreground hover:text-primary text-lg font-medium"
          >
            AI Guide
          </a>
          <button className="w-full bg-primary text-primary-foreground px-5 py-3 rounded-md font-bold text-center">
            Apply Now
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
