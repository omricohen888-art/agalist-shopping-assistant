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
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Left side - Branding */}
      <div className="absolute left-20 top-1/2 -translate-y-1/2 flex flex-col items-center gap-5 z-10">
        {/* Logo */}
        <div className="flex items-center gap-5">
          <div 
            className="w-28 h-28 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ backgroundColor: '#000000' }}
          >
            <Check className="w-16 h-16" style={{ color: '#FFD700' }} strokeWidth={4} />
          </div>
          <span 
            className="text-7xl font-black"
            style={{ color: '#000000' }}
          >
            עגליסט
          </span>
        </div>
        
        {/* Slogan */}
        <p 
          className="text-2xl font-semibold mt-2"
          style={{ color: '#333333' }}
        >
          רשימת הקניות החכמה שלך!
        </p>

        {/* Status pills */}
        <div className="flex gap-4 mt-6">
          <div 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg border-2"
            style={{ backgroundColor: '#FFF9E6', borderColor: '#FFD700', color: '#8B6914' }}
          >
            <ClipboardList className="w-5 h-5" />
            <span>מוכנות</span>
          </div>
          <div 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg border-2"
            style={{ backgroundColor: '#FFE5E5', borderColor: '#FF4D4D', color: '#CC0000' }}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>בקנייה</span>
          </div>
          <div 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg border-2"
            style={{ backgroundColor: '#E8F5E9', borderColor: '#4CAF50', color: '#2E7D32' }}
          >
            <Clock className="w-5 h-5" />
            <span>הושלמו</span>
          </div>
        </div>
      </div>

      {/* Center-Right - Phone Mockup */}
      <div className="absolute right-40 top-1/2 -translate-y-1/2 z-10">
        {/* Phone frame */}
        <div 
          className="relative rounded-[3rem] p-3 shadow-2xl"
          style={{ 
            backgroundColor: '#000000',
            width: '300px',
            height: '580px'
          }}
        >
          {/* Phone screen */}
          <div 
            className="w-full h-full rounded-[2.5rem] overflow-hidden"
            style={{ backgroundColor: '#FAFAFA' }}
          >
            {/* Status bar / Notch */}
            <div className="h-10 flex items-center justify-center" style={{ backgroundColor: '#f0f0f0' }}>
              <div className="w-24 h-6 rounded-full" style={{ backgroundColor: '#000000' }} />
            </div>
            
            {/* App content */}
            <div className="p-5 space-y-4" dir="rtl">
              {/* Header */}
              <div className="text-center mb-5">
                <p className="text-base font-bold" style={{ color: '#000000' }}>רשימת הקניות שלי</p>
              </div>

              {/* List cards */}
              <div className="space-y-3">
                {/* Ready card - Yellow */}
                <div 
                  className="p-4 rounded-2xl shadow-md border-2"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#FFD700' }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#FFF9E6' }}
                    >
                      <ClipboardList className="w-4 h-4" style={{ color: '#FFD700' }} />
                    </div>
                    <span className="text-base font-bold" style={{ color: '#000000' }}>שניצל</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span 
                      className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: '#FFF9E6', color: '#8B6914' }}
                    >
                      3 פריטים
                    </span>
                  </div>
                </div>

                {/* In progress card - Red */}
                <div 
                  className="p-4 rounded-2xl shadow-md border-2"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#FF4D4D' }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#FFE5E5' }}
                    >
                      <ShoppingCart className="w-4 h-4" style={{ color: '#FF4D4D' }} />
                    </div>
                    <span className="text-base font-bold" style={{ color: '#000000' }}>פסטה</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span 
                      className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: '#FFE5E5', color: '#CC0000' }}
                    >
                      בקנייה
                    </span>
                  </div>
                </div>

                {/* Completed card - Green */}
                <div 
                  className="p-4 rounded-2xl shadow-md border-2"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#4CAF50' }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#E8F5E9' }}
                    >
                      <Check className="w-4 h-4" style={{ color: '#4CAF50' }} />
                    </div>
                    <span className="text-base font-bold" style={{ color: '#000000' }}>אורז</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span 
                      className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
                    >
                      הושלם ✓
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Phone shadow */}
        <div 
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-56 h-10 rounded-full blur-2xl"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        />
      </div>

      {/* Right side - Shopping notebook illustration */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-30">
        <svg width="180" height="260" viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          
          {/* Checkmarks with exact colors */}
          <path d="M60 75 L68 83 L82 65" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M60 103 L68 111 L82 93" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M60 131 L68 139 L82 121" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M60 159 L68 167 L82 149" stroke="#FF4D4D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Decorative circles with exact colors */}
      <div 
        className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-20"
        style={{ backgroundColor: '#FFD700' }}
      />
      <div 
        className="absolute bottom-16 left-40 w-10 h-10 rounded-full opacity-20"
        style={{ backgroundColor: '#4CAF50' }}
      />
      <div 
        className="absolute top-24 right-24 w-14 h-14 rounded-full opacity-15"
        style={{ backgroundColor: '#FF4D4D' }}
      />
      <div 
        className="absolute bottom-20 right-80 w-6 h-6 rounded-full opacity-25"
        style={{ backgroundColor: '#FFD700' }}
      />
    </div>
  );
};

export default OGBanner;
