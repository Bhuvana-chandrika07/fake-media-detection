import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Image as ImageIcon, Video, AudioLines, UploadCloud, X, Loader2, FileWarning, Activity } from "lucide-react";
import { Layout } from "@/components/layout";
import { formatBytes } from "@/lib/utils";
import { 
  useDetectImage, 
  useDetectVideo, 
  useDetectAudio
} from "../api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type MediaType = "image" | "video" | "audio";

export default function Upload() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<MediaType>("image");
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const detectImage = useDetectImage();
  const detectVideo = useDetectVideo();
  const detectAudio = useDetectAudio();

  const isPending = detectImage.isPending || detectVideo.isPending || detectAudio.isPending;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setErrorMsg(null);
    }
  }, []);

  const getAcceptTypes = () => {
    switch(selectedType) {
      case "image": return { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] };
      case "video": return { 'video/*': ['.mp4', '.mov', '.avi'] };
      case "audio": return { 'audio/*': ['.mp3', '.wav', '.ogg'] };
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: getAcceptTypes(),
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: () => setErrorMsg("File type not supported or file too large (>50MB).")
  });

  const handleAnalyze = () => {
    if (!file) return;

    const options = {
      onSuccess: (res: any) => {
        // Invalidate stats and history queries to refresh dashboard and history pages
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        queryClient.invalidateQueries({ queryKey: ['history'] });
        setLocation(`/results/${res.id}`);
      },
      onError: (err: any) => {
        setErrorMsg(err.message || "An error occurred during analysis.");
      }
    };

    if (selectedType === "image") detectImage.mutate(file, options);
    else if (selectedType === "video") detectVideo.mutate(file, options);
    else if (selectedType === "audio") detectAudio.mutate(file, options);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">New Analysis</h1>
          <p className="text-muted-foreground">Upload media to scan for deepfake manipulation artifacts.</p>
        </div>

        <div className="glass-card rounded-2xl p-2 sm:p-8">
          {/* Type Selector */}
          <div className="flex p-1 bg-background/50 rounded-xl mb-8 border border-white/5">
            {[
              { id: "image", label: "Image", icon: ImageIcon },
              { id: "video", label: "Video", icon: Video },
              { id: "audio", label: "Audio", icon: AudioLines }
            ].map((type) => {
              const Icon = type.icon;
              const isActive = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id as MediaType);
                    setFile(null);
                    setErrorMsg(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Upload Area */}
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragReject ? "border-destructive bg-destructive/5" :
                  isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : 
                  "border-white/20 hover:border-primary/50 hover:bg-white/5"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 mx-auto rounded-full bg-background flex items-center justify-center mb-6 shadow-inner border border-white/5">
                  <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isDragActive ? "Drop file here..." : "Drag & drop file here"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Supports {selectedType === 'image' ? 'JPG, PNG, WEBP' : selectedType === 'video' ? 'MP4, MOV, AVI' : 'MP3, WAV, OGG'} up to 50MB. Or click to browse.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="border border-white/10 rounded-2xl p-8 bg-background/50 relative overflow-hidden"
              >
                {/* Simulated scan line effect when pending */}
                {isPending && (
                  <motion.div 
                    className="absolute inset-0 h-1 bg-primary/50 shadow-[0_0_15px_rgba(14,165,233,0.8)] z-10"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                )}
                
                <button 
                  onClick={() => setFile(null)}
                  disabled={isPending}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-destructive/20 hover:text-destructive transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-secondary to-background border border-white/10 flex items-center justify-center shrink-0">
                    {selectedType === 'image' ? <ImageIcon className="w-10 h-10 text-primary" /> : 
                     selectedType === 'video' ? <Video className="w-10 h-10 text-purple-400" /> : 
                     <AudioLines className="w-10 h-10 text-emerald-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold truncate mb-1" title={file.name}>{file.name}</h4>
                    <p className="text-muted-foreground text-sm">{formatBytes(file.size)}</p>
                    
                    {errorMsg && (
                      <div className="mt-3 flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20">
                        <FileWarning className="w-4 h-4 shrink-0" />
                        <p>{errorMsg}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleAnalyze}
                    disabled={isPending}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5" />
                        Run Analysis
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
