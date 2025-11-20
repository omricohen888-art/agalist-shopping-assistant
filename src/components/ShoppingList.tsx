import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
}

export const ShoppingList = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inputText, setInputText] = useState("");

  const handlePaste = (text: string) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newItems: ShoppingItem[] = lines.map((line, index) => ({
      id: `${Date.now()}-${index}`,
      text: line,
      checked: false,
    }));

    setItems([...items, ...newItems]);
    setInputText("");
    toast.success(`Added ${newItems.length} item${newItems.length > 1 ? "s" : ""}`);
  };

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const shareList = async () => {
    const listText = items.map((item) => `${item.checked ? "✓" : "○"} ${item.text}`).join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shopping List",
          text: listText,
        });
        toast.success("List shared!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(listText);
        }
      }
    } else {
      copyToClipboard(listText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("List copied to clipboard!");
  };

  const clearCompleted = () => {
    setItems(items.filter((item) => !item.checked));
    toast.success("Cleared completed items");
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 relative z-10">
      <div className="mb-8 pl-20">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Shopping List</h1>
        <p className="text-muted-foreground">Paste your list from WhatsApp or add items manually</p>
      </div>

      <div className="mb-6 pl-20">
        <Textarea
          placeholder="Paste your shopping list here (one item per line)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[120px] resize-none bg-background/50 backdrop-blur-sm border-muted"
        />
        <div className="flex gap-2 mt-3">
          <Button
            onClick={() => handlePaste(inputText)}
            disabled={!inputText.trim()}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Items
          </Button>
          <Button
            onClick={shareList}
            disabled={items.length === 0}
            variant="outline"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="space-y-1 pl-20">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No items yet. Paste a list or add items to get started.
          </p>
        ) : (
          <>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2 group hover:bg-muted/20 rounded-md px-2 transition-colors"
                style={{ height: "32px" }}
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="border-2 data-[state=checked]:bg-checked-mark data-[state=checked]:border-checked-mark"
                />
                <span
                  className={`flex-1 transition-all ${
                    item.checked
                      ? "line-through text-checked-text"
                      : "text-foreground"
                  }`}
                >
                  {item.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {items.some((item) => item.checked) && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompleted}
                  className="w-full"
                >
                  Clear Completed
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
