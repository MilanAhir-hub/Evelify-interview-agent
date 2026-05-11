import React from 'react';
import FeatureCard from '../../components/FeatureCard';
import { BarChart3, FileText, Download, Activity } from 'lucide-react';

const Features = () => {
  const features = [
    {
      title: "AI Answer Evaluation",
      description: "Get precise scores on communication, technical accuracy, and confidence. Our AI analyzes your delivery in real-time.",
      icon: <BarChart3 className="w-7 h-7 text-blue-400" />,
      color: "blue-500"
    },
    {
      title: "Resume Based Interview",
      description: "Upload your resume and get project-specific questions tailored to your experience. Practice explaining your own work effectively.",
      icon: <FileText className="w-7 h-7 text-emerald-400" />,
      color: "emerald-500"
    },
    {
      title: "Downloadable PDF Report",
      description: "Receive a detailed breakdown of your strengths, weaknesses, and actionable improvement insights to share with mentors.",
      icon: <Download className="w-7 h-7 text-purple-400" />,
      color: "purple-500"
    },
    {
      title: "History & Analytics",
      description: "Track your progress over time with performance graphs and deep topic analysis. Visualize your growth across different domains.",
      icon: <Activity className="w-7 h-7 text-pink-400" />,
      color: "pink-500"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent -z-10"></div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Powerful Features for <br />
              <span className="text-gray-500 italic">Interview Success</span>
            </h2>
            <p className="text-gray-400 text-lg font-light leading-relaxed">
              Everything you need to transform your interview performance, backed by advanced artificial intelligence.
            </p>
          </div>
          <div className="hidden md:block pb-2">
            <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-400 font-medium">
              Explore All Tools
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <FeatureCard 
              key={index}
              title={item.title}
              description={item.description}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
