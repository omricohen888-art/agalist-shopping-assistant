import { ShoppingList } from "@/components/ShoppingList";
import { ThemeToggle } from "@/components/ThemeToggle";
const Index = () => {
  return <div className="min-h-screen bg-muted/30">
      <ThemeToggle />
      <ShoppingList />
    </div>;
};
export default Index;