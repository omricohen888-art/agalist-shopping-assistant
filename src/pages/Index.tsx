import { ShoppingList } from "@/components/ShoppingList";
import { ThemeToggle } from "@/components/ThemeToggle";
const Index = () => {
  return <div className="min-h-screen bg-stone-50 dark:bg-background">
    <ThemeToggle />
    <ShoppingList />
  </div>;
};
export default Index;