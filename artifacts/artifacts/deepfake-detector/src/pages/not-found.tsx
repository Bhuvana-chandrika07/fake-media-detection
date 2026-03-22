import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Layout } from "@/components/layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-20 h-20 text-destructive mb-6" />
        <h1 className="text-4xl font-display font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          The quadrant of cyberspace you are looking for does not exist or requires higher clearance.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
        >
          Return to Base
        </Link>
      </div>
    </Layout>
  );
}
