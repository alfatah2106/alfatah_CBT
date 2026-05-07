import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ArabicKeyboardProps {
  onKeyPress: (key: string) => void;
  onClose: () => void;
  onBackspace: () => void;
  onSpace: () => void;
  onEnter: () => void;
}

const keyboardLayout = [
  ['ذ', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠', '-', '='],
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', 'ش'],
  ['س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ئ', 'ء', 'ؤ'],
  ['ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
];

export function ArabicKeyboard({ onKeyPress, onClose, onBackspace, onSpace, onEnter }: ArabicKeyboardProps) {
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} handle=".keyboard-handle" bounds="parent">
      <div ref={nodeRef} className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white rounded-xl shadow-2xl border border-slate-700 w-full max-w-[95vw] sm:max-w-max select-none">
        <div className="keyboard-handle bg-slate-900 px-4 py-3 flex justify-between items-center cursor-move touch-none rounded-t-xl">
          <span className="font-bold text-sm text-slate-300">Keyboard Arab (Drag di sini)</span>
          <button onClick={onClose} className="p-1 hover:bg-rose-500 hover:text-white rounded text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 sm:p-4 bg-slate-800 rounded-b-xl overflow-x-auto">
          <div className="flex flex-col gap-2 min-w-max">
            {keyboardLayout.map((row, rowIndex) => (
              <div key={rowIndex} className={`flex gap-1 sm:gap-1.5 justify-center`}>
                {row.map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="w-8 sm:w-10 h-10 sm:h-12 text-xl sm:text-2xl hover:bg-slate-700 bg-slate-900 border-slate-700 text-white shrink-0"
                    onClick={() => onKeyPress(key)}
                  >
                    {key}
                  </Button>
                ))}
                {rowIndex === 0 && (
                  <Button
                    variant="outline"
                    className="px-2 sm:px-4 h-10 sm:h-12 hover:bg-slate-700 bg-slate-900 border-slate-700 text-white shrink-0"
                    onClick={onBackspace}
                  >
                    Delete
                  </Button>
                )}
              </div>
            ))}
            <div className="flex justify-center mt-2 gap-2">
              <Button
                variant="outline"
                className="w-48 sm:w-[300px] h-10 sm:h-12 hover:bg-slate-700 bg-slate-900 border-slate-700 text-white shrink-0"
                onClick={onSpace}
              >
                Space
              </Button>
              <Button
                variant="outline"
                className="px-4 sm:px-6 h-10 sm:h-12 hover:bg-slate-700 bg-slate-900 border-slate-700 text-white shrink-0"
                onClick={onEnter}
              >
                Enter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
