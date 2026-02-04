import OGBanner from "@/components/OGBanner";

const OGDesign = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-white text-2xl font-bold mb-4">OG Image Preview (1200×630)</h1>
      <p className="text-gray-400 mb-8">This is a temporary route for designing the OG image</p>
      
      {/* Container with exact OG dimensions */}
      <div className="border-4 border-dashed border-gray-600 rounded-lg overflow-hidden">
        <OGBanner />
      </div>
      
      <p className="text-gray-500 mt-6 text-sm">
        Take a screenshot of the banner above at exactly 1200×630px for your OG image
      </p>
    </div>
  );
};

export default OGDesign;
