import { NotebookCanvas } from "@/components/NotebookCanvas";
import { ShoppingList } from "@/components/ShoppingList";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <NotebookCanvas lineHeight={32} marginLeft={80} />
      <ThemeToggle />
      <ShoppingList />
    </div>
  );
};

export default Index;
