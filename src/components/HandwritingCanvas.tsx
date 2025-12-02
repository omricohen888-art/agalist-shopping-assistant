import React, { useEffect } from 'react';
import { useHandwriting } from '@/hooks/use-handwriting';
import { Button } from '@/components/ui/button';
import { Trash2, Send, X } from 'lucide-react';
import { toast } from 'sonner';

interface HandwritingCanvasProps {
  onSubmit: (imageData: string) => void;
  onCancel: () => void;
  language: 'he' | 'en';
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  onSubmit,
  onCancel,
  language
}) => {
  const { canvasRef, initializeCanvas, startDrawing, draw, stopDrawing, clearCanvas, getCanvasImage, isDrawing } = useHandwriting();
  const [hasDrawing, setHasDrawing] = React.useState(false);

  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  // Track if user has drawn anything
  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setHasDrawing(true);
    startDrawing(e);
  };

  const handleSubmit = async () => {
    if (!hasDrawing) {
      toast.warning(language === 'he' ? 'צייר או כתוב משהו לפני השליחה' : 'Draw or write something before submitting');
      return;
    }

    const imageData = getCanvasImage();
    if (imageData) {
      onSubmit(imageData);
    } else {
      toast.error(language === 'he' ? 'שגיאה ביצירת תמונה מהציור' : 'Error creating image from drawing');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              {language === 'he' ? 'כתוב או צייר רשימה' : 'Draw/Write Your List'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              {language === 'he' ? 'כתוב או צייר את פריטי הקניות' : 'Write or draw your shopping items'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-800 flex items-center justify-center min-h-[300px]">
          <canvas
            ref={canvasRef}
            onMouseDown={handleStartDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleStartDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair touch-none bg-white dark:bg-white border border-gray-200 dark:border-gray-700 rounded-lg"
            style={{ maxWidth: '100%', maxHeight: '400px' }}
          />
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex gap-2 flex-wrap">
          <Button
            variant="ghost"
            onClick={clearCanvas}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
          >
            <Trash2 className="h-4 w-4" />
            {language === 'he' ? 'נקה' : 'Clear'}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 min-w-[120px] font-bold"
          >
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-yellow-400 text-black hover:bg-yellow-500 font-bold border-2 border-black"
          >
            <Send className="h-4 w-4" />
            {language === 'he' ? 'זהה' : 'Recognize'}
          </Button>
        </div>
      </div>
    </div>
  );
};
