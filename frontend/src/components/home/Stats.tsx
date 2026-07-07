import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Microscope, Code, Award, Globe } from "lucide-react";

const data = [
  { year: "2019", graduates: 1200, research: 85 },
  { year: "2020", graduates: 1500, research: 92 },
  { year: "2021", graduates: 1800, research: 105 },
  { year: "2022", graduates: 2400, research: 140 },
  { year: "2023", graduates: 3100, research: 185 },
  { year: "2024", graduates: 3800, research: 240 },
];

const Stats = () => {
  return (
    <section id="stats" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-primary font-bold tracking-widest uppercase text-sm">
            Impact & Growth
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-foreground">
            Shaping India's Skill Landscape
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            NSTI Kanpur has been at the forefront of technical education, 
            consistently producing highly skilled instructors and technicians 
            for the nation's industrial growth.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-xl">
            <h4 className="text-xl font-bold text-card-foreground mb-6">
              Certified Professionals Growth
            </h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e05d38" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e05d38" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis dataKey="year" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-card-foreground)"
                    }}
                    itemStyle={{ color: "#e05d38" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="graduates"
                    stroke="#e05d38"
                    fillOpacity={1}
                    fill="url(#colorGrad)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 gap-6">
            {[
              {
                icon: Microscope,
                title: "Advanced Lab Facilities",
                desc: "State-of-the-art CNC, IoT, and Mechatronics labs.",
                color: "text-blue-500",
              },
              {
                icon: Code,
                title: "IT & Digital Skills",
                desc: "Focused training in Software, Hardware, and Networking.",
                color: "text-purple-500",
              },
              {
                icon: Globe,
                title: "Nationwide Impact",
                desc: "Trainees serving in premier industries across India.",
                color: "text-primary",
              },
              {
                icon: Award,
                title: "DGT Excellence",
                desc: "Adherence to the highest standards of vocational training.",
                color: "text-yellow-500",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-card p-6 rounded-2xl border border-border flex items-start space-x-4 hover:border-primary/30 transition-all cursor-default shadow-sm hover:shadow-md"
              >
                <div
                  className={`p-3 rounded-lg bg-background ${item.color}`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="text-card-foreground font-bold">
                    {item.title}
                  </h5>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
