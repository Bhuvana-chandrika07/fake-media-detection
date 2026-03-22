import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Knowledge base for answering relevant questions
const KNOWLEDGE_BASE: Record<string, string[]> = {
  deepfake: [
    "Deepfakes are synthetic media created using AI algorithms like GANs or deep neural networks. They can convincingly manipulate facial features, expressions, voice, and body movements.",
    "Our AI model analyzes deepfakes by checking for: facial inconsistencies, compression artifacts, frequency anomalies, temporal inconsistency, noise patterns, and spectral anomalies.",
    "Deepfakes are increasingly used for misinformation, fraud, and non-consensual intimate content. Early detection is critical."
  ],
  detection: [
    "Our system uses ResNet18, a deep learning model trained on 2000+ real and fake face images. It achieves ~72% validation accuracy.",
    "Detection process: Image → ResNet18 → Binary classification (Real/Fake) → Confidence score (0-100%).",
    "We analyze multiple factors: facial feature consistency, texture analysis, compression patterns, and metadata signatures."
  ],
  accuracy: [
    "Our model has ~72% validation accuracy on the training dataset. Real-world accuracy may vary based on image quality and deepfake sophistication.",
    "Accuracy improves with higher resolution images and well-lit faces. Low-quality or heavily compressed media can reduce reliability.",
    "Confidence score above 80% is more reliable. Scores between 40-60% indicate borderline cases requiring manual review."
  ],
  confidence: [
    "Confidence score represents how certain our AI model is about the classification (0-100%).",
    "High confidence (80%+): Model is very sure → More reliable prediction.",
    "Low confidence (40-60%): Uncertain case → Consider manual review or multiple analyses.",
    "The score is based on probability outputs from the neural network."
  ],
  analysis: [
    "Facial Inconsistency: Detects unnatural facial feature symmetry or texture issues.",
    "Compression Artifacts: Identifies pixel-level anomalies from AI processing.",
    "Frequency Anomaly: Analyzes frequency domain patterns that differ from real faces.",
    "Temporal Consistency: For videos, checks if movements are natural across frames.",
    "Noise Pattern: Examines noise distribution which differs between real and synthetic media.",
    "Spectral Anomaly: Frequency spectrum analysis to detect AI generation signatures."
  ],
  howto: [
    "1. Click 'New Analysis' on the dashboard",
    "2. Select media type (Image/Video/Audio)",
    "3. Upload your file (supports JPG, PNG, MP4, WAV, etc.)",
    "4. Click 'Run Analysis' and wait for results",
    "5. Review the detailed analysis report and confidence score"
  ],
  limitation: [
    "No detection system is 100% accurate. Advanced deepfakes can fool AI models.",
    "Quality matters: Low-resolution, compressed, or distorted media reduces accuracy.",
    "Audio detection uses a simplified approach and may not be as reliable.",
    "Emerging deepfake techniques continuously challenge existing detection methods."
  ],
  false: [
    "False Positives: Real media incorrectly marked as fake. Can happen with unusual lighting or compression.",
    "False Negatives: Fake media marked as real. Advanced deepfakes may bypass detection.",
    "Mitigation: Use multiple detection tools, consult experts for important cases, verify through metadata analysis."
  ]
};

function findRelevantAnswer(userQuery: string): string {
  const query = userQuery.toLowerCase();
  
  for (const [keyword, answers] of Object.entries(KNOWLEDGE_BASE)) {
    if (query.includes(keyword) || 
        (keyword === "deepfake" && (query.includes("fake") || query.includes("deepfake"))) ||
        (keyword === "detection" && (query.includes("detect") || query.includes("how work"))) ||
        (keyword === "accuracy" && (query.includes("accurate") || query.includes("how reliable"))) ||
        (keyword === "confidence" && (query.includes("confidence") || query.includes("score"))) ||
        (keyword === "analysis" && (query.includes("metric") || query.includes("detail"))) ||
        (keyword === "howto" && (query.includes("how") || query.includes("use") || query.includes("start"))) ||
        (keyword === "limitation" && (query.includes("limitation") || query.includes("error") || query.includes("wrong"))) ||
        (keyword === "false" && (query.includes("false") || query.includes("wrong")))) {
      return answers[Math.floor(Math.random() * answers.length)];
    }
  }

  // Default helpful responses
  const defaultResponses = [
    "That's a great question! I can help with topics like deepfakes, detection accuracy, analysis methods, confidence scores, and how to use the system. What would you like to know?",
    "I'm here to answer questions about deepfake detection. Try asking about how the system works, accuracy, analysis details, or limitations.",
    "For more detailed information, you can explore the dashboard results or consult digital forensics experts for critical cases."
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm AuraDetect's AI assistant. I can answer questions about deepfake detection, how our analysis works, accuracy, confidence scores, and more. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Get relevant answer from knowledge base
    setTimeout(() => {
      const answer = findRelevantAnswer(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: answer,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold">AI Assistant</h1>
            <p className="text-muted-foreground mt-1">Get help with deepfake detection and analysis questions.</p>
          </div>
        </div>

        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AuraDetect Assistant
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
              <div className="space-y-4 py-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.sender === 'bot' && (
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {message.sender === 'user' && (
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarFallback className="bg-secondary">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 justify-start"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about deepfake detection..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                AI assistant can help with questions about deepfake detection, analysis results, and best practices.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}