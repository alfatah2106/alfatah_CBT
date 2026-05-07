import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ArabicKeyboardProps {
  onKeyPress: (key: string) => void;
  onClose: () => void;
  onBackspace: () => void;
  onSpace: () => void;
}

const keyboardLayout = [
  ['ذ', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠', '-', '='],
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', 'ش'],
  ['س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'ئ', 'ء', 'ؤ'],
  ['ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ']
];

export function ArabicKeyboard({ onKeyPress, onClose, onBackspace, onSpace }: ArabicKeyboardProps) {
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} handle=".keyboard-handle" bounds="body">
      <div ref={nodeRef} className="fixed bottom-20 right-20 z-50 bg-slate-800 text-white rounded-xl shadow-2xl border border-slate-700 w-max overflow-hidden select-none">
        <div className="keyboard-handle bg-slate-900 px-4 py-2 flex justify-between items-center cursor-move">
          <span className="font-bold text-sm text-slate-300">Keyboard Arab (Drag di sini)</span>
          <button onClick={onClose} className="p-1 hover:bg-rose-500 hover:text-white rounded text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 bg-slate-800">
          <div className="flex flex-col gap-2">
            {keyboardLayout.map((row, rowIndex) => (
              <div key={rowIndex} className={`flex gap-1 justify-center ${rowIndex === 3 ? 'ml-[-100px]' : ''}`}>
                {row.map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="w-10 h-10 text-2xl hover:bg-slate-700 bg-slate-900 border-slate-700 text-white"
                    onClick={() => onKeyPress(key)}
                  >
                    {key}
                  </Button>
                ))}
                {rowIndex === 0 && (
                  <Button
                    variant="outline"
                    className="px-4 h-10 hover:bg-slate-700 bg-slate-900 border-slate-700 text-white"
                    onClick={onBackspace}
                  >
                    Delete
                  </Button>
                )}
              </div>
            ))}
            <div className="flex justify-center mt-2">
              <Button
                variant="outline"
                className="w-[300px] h-10 hover:bg-slate-700 bg-slate-900 border-slate-700 text-white"
                onClick={onSpace}
              >
                Space
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
