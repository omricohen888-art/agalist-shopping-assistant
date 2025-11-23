import { ShoppingList } from "@/components/ShoppingList";
import { ThemeToggle } from "@/components/ThemeToggle";
const Index = () => {
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ThemeToggle />
      <ShoppingList className="w-full overflow-x-hidden" />
    </div>;
};
export default Index;