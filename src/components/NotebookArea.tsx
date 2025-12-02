import React, { useRef, useEffect } from 'react';
import { Plus, Mic, Camera, PenLine, ClipboardPaste, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { StandardizedInput } from '@/components/ui/standardized-input';
import { QuickAddBar } from '@/components/QuickAddBar';
import { useLanguage } from '@/hooks/use-language';
import { Unit, UNITS } from '@/types/shopping';
import { useTheme } from 'next-themes';

interface NotepadItem {
  id: string;
  text: string;
  isChecked: boolean;
  quantity?: number;
  unit?: Unit;
}

interface NotebookAreaProps {
  notepadItems: NotepadItem[];
  setNotepadItems: (items: NotepadItem[] | ((prev: NotepadItem[]) => NotepadItem[])) => void;
  onQuickAdd: (name: string, quantity: number, unit: Unit) => void;
  onConvertToList: () => void;
  onVoiceDictation?: () => void;
  onCameraCapture?: (ref: React.RefObject<HTMLInputElement>) => void;
  onHandwritingOpen?: () => void;
  showPaste?: boolean;
  onQuickPaste?: () => void;
  showPasteFeedback?: boolean;
  isVoiceRecording?: boolean;
  isProcessingImage?: boolean;
  cameraInputRef?: React.RefObject<HTMLInputElement>;
  onCameraOCR?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  notepadInputRefs?: React.MutableRefObject<(HTMLInputElement | null)[]>;
}

export const NotebookArea: React.FC<NotebookAreaProps> = ({
  notepadItems,
  setNotepadItems,
  onQuickAdd,
  onConvertToList,
  onVoiceDictation,
  onCameraCapture,
  onHandwritingOpen,
  showPaste = false,
  onQuickPaste,
  showPasteFeedback = false,
  isVoiceRecording = false,
  isProcessingImage = false,
  cameraInputRef,
  onCameraOCR,
  notepadInputRefs
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const localNotepadInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const refs = notepadInputRefs || localNotepadInputRefs;

  const toggleNotepadItem = (id: string) => {
    setNotepadItems(notepadItems.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  // Update refs array when notepadItems changes
  useEffect(() => {
    refs.current = refs.current.slice(0, notepadItems.length);
  }, [notepadItems, refs]);

  const handleAddNewItem = () => {
    const newItem: NotepadItem = {
      id: `notepad-${Date.now()}`,
      text: '',
      isChecked: false
    };
    setNotepadItems([...notepadItems, newItem]);
    
    // Focus the new input after state update
    setTimeout(() => {
      const lastIndex = notepadItems.length;
      if (refs.current[lastIndex]) {
        refs.current[lastIndex]!.focus();
      }
    }, 0);
  };

  return (
    <div className="relative bg-[#FEFCE8] dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl p-4 md:p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:border-yellow-400 focus-within:border-yellow-400 transition-all duration-200 hover:-translate-y-1 focus-within:-translate-y-1"
      style={theme !== 'dark' ? {
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)'
      } : {}}
    >
      {/* Spiral Binding Effect */}
      <div className={`absolute top-0 bottom-4 ${language === 'he' ? '-right-3' : '-left-3'} w-8 flex flex-col justify-evenly py-2 z-20 pointer-events-none ${theme === 'dark' ? 'hidden' : ''}`}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className="relative h-4 w-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a1a1a] rounded-full shadow-inner" />
            <div className={`absolute top-1/2 ${language === 'he' ? 'left-1/2' : 'right-1/2'} w-6 h-1.5 bg-zinc-400 rounded-full transform ${language === 'he' ? '-translate-x-1/2 rotate-12' : 'translate-x-1/2 -rotate-12'} shadow-sm`} />
          </div>
        ))}
      </div>

      {/* Quick Paste Button */}
      {showPaste && onQuickPaste && (
        <button
          onClick={onQuickPaste}
          className={`absolute top-4 ${language === 'he' ? 'left-4' : 'right-4'} flex items-center gap-2 text-gray-600 hover:text-black dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer z-10`}
          title={language === 'he' ? 'הדבק מהלוח' : 'Paste from clipboard'}
        >
          <ClipboardPaste className="h-5 w-5" />
          <span className="text-sm font-medium">
            {language === 'he' ? 'הדבק' : 'Paste'}
          </span>
        </button>
      )}

      {/* Paste Feedback Animation */}
      {showPasteFeedback && (
        <div className={`absolute top-4 ${language === 'he' ? 'left-20' : 'right-20'} bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-right-2 duration-300`}>
          {language === 'he' ? 'הודבק!' : 'Pasted!'}
        </div>
      )}

      {/* Smart Input Toolbar */}
      <div className="flex gap-4 text-gray-500 mb-4 px-2">
        {/* Voice Dictation Button */}
        {onVoiceDictation && (
          <button
            onClick={onVoiceDictation}
            className={`p-2 rounded-lg hover:text-black dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${
              isVoiceRecording ? 'text-red-500 animate-pulse' : ''
            }`}
            title={language === 'he' ? 'הקלטת קול' : 'Voice Dictation'}
            disabled={isProcessingImage}
          >
            <Mic className="h-6 w-6 sm:h-5 sm:w-5" />
          </button>
        )}

        {/* Camera OCR Button */}
        {onCameraCapture && cameraInputRef && (
          <button
            onClick={() => onCameraCapture(cameraInputRef)}
            className={`p-2 rounded-lg hover:text-black dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${
              isProcessingImage ? 'text-blue-500 animate-pulse' : ''
            }`}
            title={language === 'he' ? 'סריקת רשימה' : 'Scan List'}
            disabled={isVoiceRecording}
          >
            <Camera className="h-6 w-6 sm:h-5 sm:w-5" />
          </button>
        )}

        {/* Handwriting Button */}
        {onHandwritingOpen && (
          <button
            onClick={onHandwritingOpen}
            className={`p-2 rounded-lg hover:text-black dark:hover:text-white transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${
              isProcessingImage ? 'text-blue-500 animate-pulse' : ''
            }`}
            title={language === 'he' ? 'כתב יד' : 'Handwriting'}
            disabled={isVoiceRecording}
          >
            <PenLine className="h-6 w-6 sm:h-5 sm:w-5" />
          </button>
        )}

        {/* Hidden File Input for Camera */}
        {cameraInputRef && onCameraOCR && (
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onCameraOCR}
            className="hidden"
          />
        )}
      </div>

      {/* Notepad Items List */}
      <div className="min-h-[140px] space-y-2">
        {notepadItems.length === 0 ? (
          <div
            className="text-center py-8 text-gray-600 dark:text-slate-400 font-hand text-lg font-normal leading-relaxed whitespace-pre-line cursor-pointer"
            onClick={() => {
              const newItem: NotepadItem = {
                id: `notepad-${Date.now()}`,
                text: '',
                isChecked: false
              };
              setNotepadItems([newItem]);
              // Focus the first input
              setTimeout(() => {
                if (refs.current[0]) {
                  refs.current[0]!.focus();
                }
              }, 0);
            }}
          >
            {language === 'he' ? 'לחץ כדי להוסיף פריט...' : 'Click to add item...'}
          </div>
        ) : (
          notepadItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 py-2 sm:py-1">
              <Checkbox
                checked={item.isChecked}
                onCheckedChange={() => toggleNotepadItem(item.id)}
                className="h-5 w-5 sm:h-4 sm:w-4 border-2 border-black dark:border-slate-600 data-[state=checked]:bg-black dark:data-[state=checked]:bg-slate-600 data-[state=checked]:text-yellow-400 flex-shrink-0"
              />
              <StandardizedInput
                variant="notepad"
                isChecked={item.isChecked}
                ref={(el) => {
                  refs.current[index] = el;
                }}
                type="text"
                value={item.text}
                onChange={(e) => {
                  const newText = e.target.value;
                  setNotepadItems(notepadItems.map(i =>
                    i.id === item.id ? { ...i, text: newText } : i
                  ));
                }}
                onKeyDown={(e) => {
                  const currentIndex = notepadItems.findIndex(i => i.id === item.id);

                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Create new item at next position
                    const newItem: NotepadItem = {
                      id: `notepad-${Date.now()}`,
                      text: '',
                      isChecked: false
                    };
                    setNotepadItems(prev => {
                      const newItems = [...prev];
                      newItems.splice(currentIndex + 1, 0, newItem);
                      return newItems;
                    });
                    // Focus the new input after state update
                    setTimeout(() => {
                      if (refs.current[currentIndex + 1]) {
                        refs.current[currentIndex + 1]!.focus();
                      }
                    }, 0);

                  } else if (e.key === 'Backspace') {
                    if (item.text === '' && currentIndex > 0) {
                      e.preventDefault();
                      // Delete current item and focus previous
                      setNotepadItems(prev => prev.filter(i => i.id !== item.id));
                      setTimeout(() => {
                        if (refs.current[currentIndex - 1]) {
                          refs.current[currentIndex - 1]!.focus();
                          // Move cursor to end of text
                          const input = refs.current[currentIndex - 1]!;
                          input.setSelectionRange(input.value.length, input.value.length);
                        }
                      }, 0);
                    }

                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (currentIndex > 0 && refs.current[currentIndex - 1]) {
                      refs.current[currentIndex - 1]!.focus();
                    }

                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (currentIndex < notepadItems.length - 1 && refs.current[currentIndex + 1]) {
                      refs.current[currentIndex + 1]!.focus();
                    }
                  }
                }}
                placeholder={index === 0 && notepadItems.length === 1 ? "הקלד פריט..." : ""}
              />
            </div>
          ))
        )}
      </div>

      {/* Quick Add Bar - for fast item entry with quantity and unit */}
      <div className="mt-3 mb-4">
        <QuickAddBar onAddItem={onQuickAdd} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full transition-all duration-300 ease-in-out relative z-10">
        <div className={`flex gap-2 overflow-hidden p-1 transition-all duration-300 ease-in-out ${notepadItems.length > 0 ? 'w-full sm:w-1/3 opacity-100' : 'w-0 opacity-0'}`}>
          <Button
            onClick={() => setNotepadItems([])}
            variant="ghost"
            className="flex-1 text-gray-700 dark:text-slate-400 hover:bg-gray-200 hover:text-red-700 h-12 sm:h-11 text-base font-medium rounded-full"
          >
            <Trash2 className="mr-2 h-6 w-6 sm:h-5 sm:w-5" />
            {language === 'he' ? 'נקה הכל' : 'Clear All'}
          </Button>
        </div>
        <Button
          onClick={onConvertToList}
          disabled={notepadItems.length === 0}
          className={`h-12 sm:h-11 text-base font-bold bg-yellow-400 text-black hover:bg-yellow-500 px-8 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-black ${notepadItems.length > 0 ? 'w-full sm:w-2/3' : 'w-full'}`}
        >
          <Plus className="mr-2 h-6 w-6 sm:h-5 sm:w-5" />
          {language === 'he' ? 'הפוך לרשימה' : 'Turn into List'}
        </Button>
      </div>
    </div>
  );
};

export default NotebookArea;
