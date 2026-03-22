import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetHistory } from "../api-client-react";
import { format } from "date-fns";
import { formatPercentage } from "@/lib/utils";
import { Image as ImageIcon, Video, AudioLines, ChevronRight, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function History() {
  const [filter, setFilter] = useState<GetHistoryMediaType | "all">("all");
  
  // Since we don't have true pagination state hooked up to UI yet, we'll just fetch recent 50
  const { data, isLoading } = useGetHistory({ 
    limit: 50, 
    mediaType: filter !== "all" ? filter : undefined 
  });

  const getMediaIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-4 h-4 text-blue-400" />;
    if (type === 'video') return <Video className="w-4 h-4 text-purple-400" />;
    return <AudioLines className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Analysis History</h1>
            <p className="text-muted-foreground mt-1">Review your past media scans and detection results.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-background/50 border border-white/5 p-1 rounded-lg">
            <Filter className="w-4 h-4 text-muted-foreground ml-2" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as GetHistoryMediaType | "all")}
              className="bg-transparent border-none text-sm text-foreground focus:ring-0 cursor-pointer p-2"
            >
              <option value="all">All Media Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-black/20 text-muted-foreground border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">File</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Result</th>
                  <th className="px-6 py-4 font-medium">Confidence</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </td>
                  </tr>
                ) : data?.scans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No scans found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  data?.scans.map((scan, i) => {
                    const isFake = scan.prediction === "Fake";
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={scan.id} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                        onClick={() => window.location.href = `/results/${scan.id}`}
                      >
                        <td className="px-6 py-4 font-medium truncate max-w-[200px]" title={scan.filename}>
                          {scan.filename}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 capitalize text-muted-foreground">
                            {getMediaIcon(scan.mediaType)}
                            {scan.mediaType}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            isFake 
                              ? 'bg-destructive/10 text-destructive border-destructive/20' 
                              : 'bg-success/10 text-success border-success/20'
                          }`}>
                            {scan.prediction}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {formatPercentage(scan.confidence)}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                          {format(new Date(scan.createdAt), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/results/${scan.id}`} className="text-muted-foreground group-hover:text-primary transition-colors inline-block p-2 rounded-full hover:bg-white/10" onClick={(e) => e.stopPropagation()}>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
