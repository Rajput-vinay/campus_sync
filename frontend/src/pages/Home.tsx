import Navbar from "@/components/home/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Programs from "@/components/home/Programs";
import Footer from "@/components/home/Footer";

const Home = () => {
  return (
    <div >
      <Navbar />
      <main className="">
        <Hero />

        {/* Partnership / Logo Cloud */}
        <section className="py-12 border-y border-white/10 bg-background/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-muted-foreground text-sm font-bold uppercase tracking-widest mb-8">
              Key Initiatives
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <span className="text-2xl font-black text-foreground/60 hover:text-foreground transition-colors">
                SKILL INDIA
              </span>
              <span className="text-2xl font-black text-foreground/60 hover:text-foreground transition-colors">
                DIGITAL INDIA
              </span>
              <span className="text-2xl font-black text-foreground/60 hover:text-foreground transition-colors">
                MAKE IN INDIA
              </span>
              <span className="text-2xl font-black text-foreground/60 hover:text-foreground transition-colors">
                G20 BHARAT
              </span>
            </div>
          </div>
        </section>

        <Stats />
        <Programs />

        {/* Testimonial Highlight */}
        <section className="py-24 bg-background overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] rounded-full"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-1 bg-primary rounded-full"></div>
            </div>
            <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-10 leading-tight">
              "The practical training at NSTI Kanpur gave me the confidence to 
              excel in my trade. The labs are modern and the instructors are 
              highly knowledgeable."
            </h3>
            <div className="flex flex-col items-center">
              <img
                src="https://picsum.photos/seed/nsti-student/100/100"
                alt="Student"
                className="w-20 h-20 rounded-full border-4 border-primary mb-4 object-cover"
              />
              <p className="text-xl font-bold text-foreground">
                Rajesh Kumar
              </p>
              <p className="text-primary font-medium">
                Senior Technician at BHEL • CITS Alumni
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 relative overflow-hidden bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-[3rem] p-12 md:p-20 text-center border border-border relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <h2 className="text-4xl md:text-6xl font-bold text-card-foreground mb-6">
                Ready to Master a Skill?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Admissions for CITS and Advanced Diploma are open. Secure 
                your seat in one of India's most prestigious training institutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-primary text-primary-foreground px-10 py-5 rounded-xl font-bold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-primary/20">
                  Admission Portal
                </button>
                <button className="bg-transparent border border-border text-foreground px-10 py-5 rounded-xl font-bold text-lg hover:bg-muted transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Home;
