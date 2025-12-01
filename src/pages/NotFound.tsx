import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div>
          <p className="text-9xl font-black text-primary mb-4">404</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-lg text-muted-foreground">Oops! The page you're looking for doesn't exist.</p>
        </div>
        <Button onClick={() => window.location.href = '/'} className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 font-semibold rounded-lg">
          <HomeIcon className="mr-2 h-5 w-5" />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
