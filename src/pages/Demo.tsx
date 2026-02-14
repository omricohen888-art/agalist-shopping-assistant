import { useState } from "react";
import { Plus, Menu, User, ShoppingCart, BookOpen, Users, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoItem {
  id: number;
  name: string;
  detail?: string;
  checked: boolean;
}

const Demo = () => {
  const [items, setItems] = useState<Record<string, DemoItem[]>>({
    "ירקות ופירות": [
      { id: 1, name: "עגבניות", detail: "2 ק״ג", checked: false },
      { id: 2, name: "מלפפונים טריים", checked: true },
      { id: 3, name: "אבטיח", checked: false },
      { id: 4, name: "בננות", detail: "אשכול", checked: false },
    ],
    "מוצרי חלב": [
      { id: 5, name: "חלב 3% תנובה", checked: false },
      { id: 6, name: "גבינה צהובה", checked: false },
      { id: 7, name: "קוטג׳", checked: false },
      { id: 8, name: "שמנת מתוקה", checked: false },
    ],
    "בשר ודגים": [
      { id: 9, name: "חזה עוף", detail: "1 ק״ג", checked: false },
      { id: 10, name: "בשר טחון", checked: false },
    ],
    "מאפים": [
      { id: 11, name: "לחם אחיד", checked: false },
      { id: 12, name: "פיתות", checked: false },
    ],
  });

  const toggleItem = (category: string, id: number) => {
    setItems((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const totalItems = Object.values(items).flat().length;
  const checkedCount = Object.values(items).flat().filter((i) => i.checked).length;

  const categoryIcons: Record<string, string> = {
    "ירקות ופירות": "🥬",
    "מוצרי חלב": "🥛",
    "בשר ודגים": "🥩",
    "מאפים": "🍞",
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8F9FA] font-['Heebo',sans-serif] max-w-[430px] mx-auto relative overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* Status Bar Simulation */}
      <div className="h-12 bg-white flex items-center justify-between px-6 text-[13px] font-semibold text-black">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-[18px] h-[10px] border border-black rounded-[3px] relative">
            <div className="absolute inset-[1.5px] left-[1.5px] right-[30%] bg-black rounded-[1px]" />
          </div>
          <span className="text-[11px]">5G</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-5 pt-2 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-full bg-[#00D084]/10 flex items-center justify-center">
            <User className="w-5 h-5 text-[#00D084]" />
          </button>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">רשימת הקניות שלי</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">סה״כ {totalItems} מוצרים</span>
          {checkedCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-bold text-[#00D084] bg-[#00D084]/10 px-2.5 py-0.5 rounded-full"
            >
              {checkedCount} הושלמו ✓
            </motion.span>
          )}
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#00D084] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(checkedCount / totalItems) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* List Content */}
      <div
        className="overflow-y-auto px-4 pt-4 pb-40 space-y-5"
        style={{ height: "calc(100dvh - 200px)" }}
      >
        {Object.entries(items).map(([category, categoryItems]) => (
          <div key={category}>
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <span className="text-lg">{categoryIcons[category]}</span>
              <h2 className="text-[13px] font-bold text-gray-400 tracking-wide uppercase">
                {category}
              </h2>
              <span className="text-[11px] text-gray-300 font-medium mr-auto">
                {categoryItems.filter((i) => i.checked).length}/{categoryItems.length}
              </span>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {categoryItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => toggleItem(category, item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-right active:bg-gray-50 transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Checkbox */}
                  <div className="relative w-6 h-6 shrink-0">
                    <motion.div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        item.checked
                          ? "bg-[#00D084] border-[#00D084]"
                          : "border-gray-300 bg-white"
                      }`}
                      animate={item.checked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <AnimatePresence>
                        {item.checked && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-[15px] font-medium transition-all duration-200 ${
                        item.checked ? "line-through text-gray-400" : "text-gray-800"
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.detail && (
                      <span className="text-xs text-gray-400 mr-2">{item.detail}</span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <motion.button
        className="fixed bottom-24 left-6 z-50 flex items-center gap-2 bg-[#00D084] text-white pl-5 pr-4 py-3.5 rounded-full shadow-lg shadow-[#00D084]/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ maxWidth: "calc(100% - 48px)" }}
      >
        <span className="text-sm font-bold whitespace-nowrap">הוספה מהירה</span>
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </motion.button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 max-w-[430px] mx-auto">
        <div className="flex items-center justify-around py-2 pb-6">
          <NavItem icon={<ShoppingCart className="w-5 h-5" />} label="הרשימה שלי" active />
          <NavItem icon={<BookOpen className="w-5 h-5" />} label="מתכונים" />
          <NavItem icon={<Users className="w-5 h-5" />} label="שיתוף משפחתי" />
        </div>
      </div>
    </div>
  );
};

const NavItem = ({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => (
  <button className="flex flex-col items-center gap-0.5">
    <div className={active ? "text-[#00D084]" : "text-gray-400"}>{icon}</div>
    <span
      className={`text-[10px] font-semibold ${
        active ? "text-[#00D084]" : "text-gray-400"
      }`}
    >
      {label}
    </span>
    {active && (
      <motion.div
        layoutId="navDot"
        className="w-1 h-1 rounded-full bg-[#00D084] mt-0.5"
      />
    )}
  </button>
);

export default Demo;
