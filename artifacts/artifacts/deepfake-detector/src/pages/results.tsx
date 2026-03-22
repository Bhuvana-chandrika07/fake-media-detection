import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetScanById } from "../api-client-react";
import { ArrowLeft, CheckCircle2, AlertOctagon, Clock, HardDrive, FileType } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { CircularProgress } from "@/components/ui/circular-progress";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { motion } from "framer-motion";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function Results() {
  const params = useParams();
  const id = params.id || "";
  
  const { data: scan, isLoading, error } = useGetScanById(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse font-display text-lg">Retrieving analysis...</p>
        </div>
      </Layout>
    );
  }

  if (error || !scan) {
    return (
      <Layout>
        <div className="text-center py-20">
          <AlertOctagon className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Result Not Found</h2>
          <p className="text-muted-foreground mb-6">The scan you are looking for doesn't exist or has been removed.</p>
          <Link href="/upload" className="text-primary hover:underline">Start a new scan</Link>
        </div>
      </Layout>
    );
  }

  const isFake = scan.prediction === "Fake";
  const statusColor = isFake ? "hsl(var(--destructive))" : "hsl(var(--success))";
  
  // Prepare data for radar chart based on available analysis metrics
  const radarLabels: string[] = [];
  const radarDataValues: number[] = [];
  
  if (scan.analysisDetails) {
    const metrics = {
      "Facial Consistency": scan.analysisDetails.facialInconsistency,
      "Compression": scan.analysisDetails.compressionArtifacts,
      "Frequency": scan.analysisDetails.frequencyAnomaly,
      "Temporal": scan.analysisDetails.temporalConsistency,
      "Noise": scan.analysisDetails.noisePattern,
      "Spectral": scan.analysisDetails.spectralAnomaly,
      "Pitch": scan.analysisDetails.voicePitch,
    };
    
    Object.entries(metrics).forEach(([label, val]) => {
      if (val !== undefined && val !== null) {
        radarLabels.push(label);
        radarDataValues.push(val); // Assuming values are 0-1
      }
    });
  }

  const chartData = {
    labels: radarLabels,
    datasets: [
      {
        label: 'Anomaly Score',
        data: radarDataValues,
        backgroundColor: isFake ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
        borderColor: isFake ? '#ef4444' : '#10b981',
        borderWidth: 2,
        pointBackgroundColor: isFake ? '#ef4444' : '#10b981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: isFake ? '#ef4444' : '#10b981',
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: 'rgba(255, 255, 255, 0.7)', font: { family: "'Inter', sans-serif", size: 11 } },
        ticks: { display: false, min: 0, max: 1, stepSize: 0.2 },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(2, 6, 23, 0.9)',
        titleFont: { family: "'Rajdhani', sans-serif", size: 14 },
        bodyFont: { family: "'Inter', sans-serif", size: 13 },
        padding: 12,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return ` Anomaly Level: ${(context.raw * 100).toFixed(1)}%`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/history" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6 sm:p-10 relative overflow-hidden"
          >
            {/* Background glow matching prediction */}
            <div 
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
              style={{ backgroundColor: statusColor }}
            />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="shrink-0 pt-4">
                <CircularProgress 
                  value={scan.confidence / 100} 
                  color={statusColor} 
                  label="Confidence"
                  size={160}
                  strokeWidth={10}
                />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 font-bold tracking-wider uppercase text-sm"
                     style={{ 
                       borderColor: `${statusColor}40`, 
                       backgroundColor: `${statusColor}10`,
                       color: statusColor
                     }}>
                  {isFake ? <AlertOctagon className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isFake ? "Manipulated Media" : "Authentic Media"}
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                  AI concludes this is <span style={{ color: statusColor }}>{scan.prediction.toUpperCase()}</span>
                </h1>
                
                <div className="bg-background/50 border border-white/5 rounded-xl p-5 mb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {scan.explanation}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {format(new Date(scan.createdAt), 'MMM d, yyyy HH:mm')}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <FileType className="w-4 h-4" />
                    <span className="capitalize">{scan.mediaType}</span>
                  </div>
                  {scan.fileSize && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="w-4 h-4" />
                        {formatBytes(scan.fileSize)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* File Details Sidebar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="font-display font-bold text-xl mb-6 border-b border-white/10 pb-4">Analysis Profile</h3>
            
            {radarLabels.length > 0 ? (
              <div className="h-64 w-full">
                <Radar data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm border border-dashed border-white/10 rounded-xl">
                No detailed metrics available
              </div>
            )}
            
            {scan.analysisDetails?.processingTime !== undefined && (
              <div className="mt-8 flex items-center justify-between p-4 rounded-xl bg-background/50 border border-white/5">
                <span className="text-muted-foreground text-sm">Processing Time</span>
                <span className="font-mono font-bold text-primary">{scan.analysisDetails.processingTime}ms</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
