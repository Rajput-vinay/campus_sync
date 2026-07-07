import { Cpu, Settings, Globe, ShieldCheck, Wrench, BookOpen } from "lucide-react";

const programs = [
  {
    title: "CITS Training",
    icon: Settings,
    desc: "Craft Instructor Training Scheme for various engineering and non-engineering trades.",
    tags: ["Pedagogy", "Skills", "Certification"],
  },
  {
    title: "Advanced Diploma",
    icon: Globe,
    desc: "IBM certified Advanced Diploma in IT, Networking & Cloud Computing.",
    tags: ["IT", "Networking", "Cloud"],
  },
  {
    title: "Electrician & Wireman",
    icon: Wrench,
    desc: "Comprehensive training in electrical systems, wiring, and industrial maintenance.",
    tags: ["Industrial", "Safety", "Wiring"],
  },
  {
    title: "Computer Software",
    icon: Cpu,
    desc: "In-depth knowledge of software applications, programming, and office automation.",
    tags: ["COPA", "Software", "Digital"],
  },
  {
    title: "Cyber Security",
    icon: ShieldCheck,
    desc: "Specialized training in digital security, ethical hacking, and network protection.",
    tags: ["Security", "Networking"],
  },
];

const Programs = () => {
  return (
    <section id="programs" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="text-primary font-bold tracking-widest uppercase text-sm">
              Our Training Programs
            </h2>
            <h3 className="text-4xl font-bold text-foreground">
              Technical Excellence
            </h3>
          </div>
          <p className="text-muted-foreground max-w-md">
            Our trades are designed as per NCVT standards to ensure 
            high employability and industrial readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, idx) => (
            <div
              key={idx}
              className="group relative bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <program.icon
                  size={80}
                  className="text-foreground"
                />
              </div>

              <div className="bg-background w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm border border-border">
                <program.icon className="text-primary w-7 h-7" />
              </div>

              <h4 className="text-2xl font-bold text-card-foreground mb-3">
                {program.title}
              </h4>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {program.desc}
              </p>

              <div className="flex flex-wrap gap-2">
                {program.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-3 py-1 bg-background border border-border rounded-full text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button className="mt-8 flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform">
                Explore Trade <BookOpen className="ml-2 w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
