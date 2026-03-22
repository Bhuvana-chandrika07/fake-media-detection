import { Layout } from "@/components/layout";
import { useGetStats } from "../api-client-react";
import { Activity, ShieldAlert, CheckCircle, Target, Image as ImageIcon, Video, AudioLines } from "lucide-react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse font-display text-lg">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="text-center py-20">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Start analyzing media to see your dashboard statistics.</p>
        </div>
      </Layout>
    );
  }

  const statCards = [
    { label: "Total Scans", value: stats.totalScans, icon: Activity, color: "text-blue-400" },
    { label: "Fakes Detected", value: stats.fakeDetected, icon: ShieldAlert, color: "text-destructive" },
    { label: "Authentic Media", value: stats.realDetected, icon: CheckCircle, color: "text-success" },
    { label: "Detection Accuracy", value: `${(stats.accuracyRate * 100).toFixed(1)}%`, icon: Target, color: "text-accent" },
  ];

  const barData = {
    labels: ['Image', 'Video', 'Audio'],
    datasets: [
      {
        label: 'Scans by Media Type',
        data: [stats.imageScans, stats.videoScans, stats.audioScans],
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)', // Primary
          'rgba(139, 92, 246, 0.8)', // Accent
          'rgba(16, 185, 129, 0.8)', // Emerald
        ],
        borderRadius: 6,
      }
    ]
  };

  const doughnutData = {
    labels: ['Fake', 'Authentic'],
    datasets: [
      {
        data: [stats.fakeDetected, stats.realDetected],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)', // Destructive
          'rgba(16, 185, 129, 0.8)', // Success
        ],
        borderColor: 'rgba(2, 6, 23, 1)',
        borderWidth: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'rgba(255,255,255,0.7)', font: { family: "'Inter', sans-serif" } }
      }
    },
    scales: {
      y: {
        ticks: { color: 'rgba(255,255,255,0.7)' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      x: {
        ticks: { color: 'rgba(255,255,255,0.7)' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'rgba(255,255,255,0.7)', font: { family: "'Inter', sans-serif" } }
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your deepfake detection activity and statistics.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white/10 ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                    <p className="text-2xl font-bold font-display">{card.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col"
          >
            <h3 className="text-lg font-bold mb-6 font-display">Media Distribution</h3>
            <div className="flex-1 min-h-[300px]">
              <Bar data={barData} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 rounded-2xl flex flex-col"
          >
            <h3 className="text-lg font-bold mb-6 font-display">Detection Ratio</h3>
            <div className="flex-1 min-h-[300px] relative">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold font-display">{stats.totalScans}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
