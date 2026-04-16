import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardPaste, AlertCircle } from 'lucide-react';

interface BulkInputModalProps {
  title: string;
  description: string;
  columns: { key: string; label: string }[];
  onSave: (data: any[]) => Promise<void>;
  buttonText?: string;
}

export function BulkInputModal({ title, description, columns, onSave, buttonText = "Input Masal (Copy-Paste)" }: BulkInputModalProps) {
  const [open, setOpen] = useState(false);
  const [pastedData, setPastedData] = useState('');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedData(text);
    setError('');

    if (!text.trim()) {
      setParsedData([]);
      return;
    }

    try {
      const rows = text.trim().split('\n');
      const parsed = rows.map((row, index) => {
        const cols = row.split('\t');
        const obj: any = {};
        
        columns.forEach((col, i) => {
          obj[col.key] = cols[i]?.trim() || '';
        });
        
        return obj;
      });

      // Basic validation: ensure at least the first column has data
      const validData = parsed.filter(row => row[columns[0].key] !== '');
      
      if (validData.length === 0) {
        setError('Format tidak valid. Pastikan Anda copy-paste dari Excel/Spreadsheet.');
      }

      setParsedData(validData);
    } catch (err) {
      setError('Gagal memproses data. Pastikan format sesuai.');
      setParsedData([]);
    }
  };

  const handleSave = async () => {
    if (parsedData.length === 0) return;
    
    setSaving(true);
    try {
      await onSave(parsedData);
      setOpen(false);
      setPastedData('');
      setParsedData([]);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ClipboardPaste className="w-4 h-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-slate-500">{description}</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">1. Paste data dari Excel/Spreadsheet di sini:</p>
            <Textarea 
              placeholder={`Paste data di sini...\nFormat kolom: ${columns.map(c => c.label).join(' | ')}`}
              value={pastedData}
              onChange={handlePaste}
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm border border-red-200">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {parsedData.length > 0 && (
            <div className="flex-1 overflow-hidden flex flex-col space-y-2">
              <p className="text-sm font-medium">2. Preview Data ({parsedData.length} baris):</p>
              <div className="border rounded-md overflow-y-auto flex-1">
                <Table>
                  <TableHeader className="sticky top-0 bg-white shadow-sm">
                    <TableRow>
                      {columns.map(col => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, i) => (
                      <TableRow key={i}>
                        {columns.map(col => (
                          <TableCell key={col.key}>{row[col.key]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={parsedData.length === 0 || saving}>
            {saving ? 'Menyimpan...' : `Simpan ${parsedData.length} Data`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
