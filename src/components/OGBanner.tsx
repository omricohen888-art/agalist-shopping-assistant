import { Check, ShoppingCart, ClipboardList, Clock } from "lucide-react";

const OGBanner = () => {
  return (
    <div 
      className="relative overflow-hidden flex items-center justify-center"
      style={{ 
        width: '1200px', 
        height: '630px', 
        backgroundColor: '#FFFBF0',
        fontFamily: 'Heebo, sans-serif'
      }}
    >
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Left side - Branding */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-10">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div 
            className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <Check className="w-14 h-14" style={{ color: '#FFD700' }} strokeWidth={4} />
          </div>
          <span 
            className="text-6xl font-black"
            style={{ color: '#1a1a1a' }}
          >
            עגליסט
          </span>
        </div>
        
        {/* Slogan */}
        <p 
          className="text-2xl font-medium mt-2"
          style={{ color: '#4a4a4a' }}
        >
          רשימת הקניות החכמה שלך!
        </p>

        {/* Status pills */}
        <div className="flex gap-3 mt-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-md" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
            <ClipboardList className="w-4 h-4" />
            <span>מוכנות</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-md" style={{ backgroundColor: '#FED7AA', color: '#C2410C' }}>
            <ShoppingCart className="w-4 h-4" />
            <span>בקנייה</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-md" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
            <Clock className="w-4 h-4" />
            <span>הושלמו</span>
          </div>
        </div>
      </div>

      {/* Center - Phone Mockup */}
      <div className="absolute right-48 top-1/2 -translate-y-1/2 z-10">
        {/* Phone frame */}
        <div 
          className="relative rounded-[3rem] p-3 shadow-2xl"
          style={{ 
            backgroundColor: '#1a1a1a',
            width: '280px',
            height: '560px'
          }}
        >
          {/* Phone screen */}
          <div 
            className="w-full h-full rounded-[2.5rem] overflow-hidden"
            style={{ backgroundColor: '#FAFAFA' }}
          >
            {/* Status bar */}
            <div className="h-8 flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
              <div className="w-20 h-5 rounded-full" style={{ backgroundColor: '#1a1a1a' }} />
            </div>
            
            {/* App content */}
            <div className="p-4 space-y-3" dir="rtl">
              {/* Header */}
              <div className="text-center mb-4">
                <p className="text-sm font-bold" style={{ color: '#1a1a1a' }}>רשימת הקניות שלי</p>
              </div>

              {/* List cards */}
              <div className="space-y-2">
                {/* Ready card */}
                <div 
                  className="p-3 rounded-xl shadow-sm border-2"
                  style={{ backgroundColor: '#fff', borderColor: '#FFD700' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                      <ClipboardList className="w-3 h-3" style={{ color: '#92400E' }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>שניצל</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>3 פריטים</span>
                  </div>
                </div>

                {/* In progress card */}
                <div 
                  className="p-3 rounded-xl shadow-sm border-2"
                  style={{ backgroundColor: '#fff', borderColor: '#FB923C' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FED7AA' }}>
                      <ShoppingCart className="w-3 h-3" style={{ color: '#C2410C' }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>פסטה</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FED7AA', color: '#C2410C' }}>בקנייה</span>
                  </div>
                </div>

                {/* Completed card */}
                <div 
                  className="p-3 rounded-xl shadow-sm border-2"
                  style={{ backgroundColor: '#fff', borderColor: '#22C55E' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                      <Check className="w-3 h-3" style={{ color: '#065F46' }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>ירקות</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>הושלם</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Phone shadow */}
        <div 
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full blur-2xl"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        />
      </div>

      {/* Right side - Shopping notebook illustration */}
      <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-40">
        <svg width="200" height="280" viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Notebook body */}
          <rect x="30" y="20" width="140" height="240" rx="8" fill="#FFB6C1" />
          <rect x="40" y="30" width="120" height="220" rx="4" fill="#FFF0F5" />
          
          {/* Spiral binding */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <circle key={i} cx="30" cy={50 + i * 28} r="6" fill="#D4A5A5" />
          ))}
          
          {/* Lines */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line key={i} x1="55" y1={60 + i * 28} x2="145" y2={60 + i * 28} stroke="#FFB6C1" strokeWidth="1" />
          ))}
          
          {/* Checkmarks */}
          <path d="M60 75 L68 83 L82 65" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M60 103 L68 111 L82 93" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M60 131 L68 139 L82 121" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Decorative elements */}
      <div 
        className="absolute top-8 left-8 w-16 h-16 rounded-full opacity-20"
        style={{ backgroundColor: '#FFD700' }}
      />
      <div 
        className="absolute bottom-12 left-32 w-8 h-8 rounded-full opacity-15"
        style={{ backgroundColor: '#22C55E' }}
      />
      <div 
        className="absolute top-20 right-32 w-12 h-12 rounded-full opacity-10"
        style={{ backgroundColor: '#FFB6C1' }}
      />
    </div>
  );
};

export default OGBanner;
