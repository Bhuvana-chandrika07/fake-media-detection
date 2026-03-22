import { motion } from "framer-motion";
import { Link } from "wouter";
import { ShieldAlert, Image as ImageIcon, Video, AudioLines, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
        {/* Abstract background element */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl opacity-30 pointer-events-none">
          <img 
            src={`${import.meta.env.BASE_URL}images/cyber-bg.png`} 
            alt="Cyber Background" 
            className="w-full h-full object-cover mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 tracking-wide">
            <ShieldAlert className="w-4 h-4" />
            <span>Next-Gen Deepfake Detection</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Uncover the Truth in <br/>
            <span className="text-gradient">Synthetic Media</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Advanced AI heuristics to detect facial inconsistencies, compression artifacts, and synthetic voice patterns with high confidence. Protect your platform from manipulated content.
          </p>

          <Link 
            href="/upload" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 group"
          >
            Start Analysis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          {[
            {
              icon: ImageIcon,
              title: "Image Forgery",
              desc: "Detects GAN-generated faces, subtle warping, blending boundaries, and noise pattern anomalies.",
              color: "text-blue-400",
              bg: "bg-blue-400/10"
            },
            {
              icon: Video,
              title: "Video Manipulation",
              desc: "Analyzes frame-by-frame temporal consistency, unnatural blinking, and lip-sync mismatch.",
              color: "text-purple-400",
              bg: "bg-purple-400/10"
            },
            {
              icon: AudioLines,
              title: "Voice Cloning",
              desc: "Examines spectral anomalies, frequency cutoffs, and unnatural vocal tract resonance.",
              color: "text-emerald-400",
              bg: "bg-emerald-400/10"
            }
          ].map((feature, idx) => (
            <div key={idx} className="glass-card p-8 rounded-2xl text-left hover:-translate-y-2 transition-transform duration-300">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg}`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
}
