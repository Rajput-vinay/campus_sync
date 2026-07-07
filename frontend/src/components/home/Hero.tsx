import { ArrowRight, Play, Check } from "lucide-react";
import nstiFront from "../../assets/nsti_front.jpeg"
const Hero = () => {
  return (
    <section
      id="home"
      className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center bg-background"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary opacity-10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary opacity-5 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>CITS 2026 Admissions are now open</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-tight">
              NSTI <span className="text-primary">Kanpur</span>
              <br />
              Building Skills, Empowering Future.
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl">
              National Skill Training Institute, Kanpur - A premier institute under DGT, MSDE, 
              providing world-class vocational training and skill development in 
              Engineering and IT trades.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold hover:opacity-90 transition-all transform hover:translate-y-[-2px] shadow-lg shadow-primary/20">
                <span>Apply for Admission</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-transparent text-foreground border border-border hover:border-primary px-8 py-4 rounded-lg font-bold transition-all">
                <Play className="w-4 h-4 text-primary fill-primary" />
                <span>Institute Tour</span>
              </button>
            </div>

            <div className="flex items-center space-x-6 pt-4 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-foreground">25+</p>
                <p className="text-sm text-muted-foreground">Modern Labs</p>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div>
                <p className="text-2xl font-bold text-foreground">50+</p>
                <p className="text-sm text-muted-foreground">Expert Trainers</p>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div>
                <p className="text-2xl font-bold text-foreground">1000+</p>
                <p className="text-sm text-muted-foreground">Annual Trainees</p>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-10">
            {/* Background Tech Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:20px_20px] opacity-10 transform -rotate-12 scale-150"></div>
            
            {/* Image Container with 3D effect */}
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_0_50px_-12px_rgba(224,93,56,0.2)] group transform perspective-1000 rotate-y-[-5deg] rotate-x-[2deg] hover:rotate-0 transition-all duration-700">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
              <img
                src={nstiFront}
                alt="NSTI Kanpur Campus"
                className="w-full h-[500px] object-cover transform transition-transform duration-700 group-hover:scale-105 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
              
              {/* Overlay Content */}
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-card/90 backdrop-blur-md rounded-xl border border-border transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <p className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">
                  Live from Kanpur
                </p>
                <p className="text-lg font-bold text-card-foreground">
                  NSTI Main Building
                </p>
                <p className="text-sm text-muted-foreground">
                  Center of Excellence for Technical Training since 1963.
                </p>
              </div>
            </div>

            {/* Decorative Glows */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 blur-[80px] rounded-full animate-pulse"></div>

            {/* Floating Element */}
            <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl border border-border shadow-xl hidden md:block animate-bounce-slow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Govt. of India</p>
                  <p className="text-sm font-bold text-card-foreground">
                    MSDE Certified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
