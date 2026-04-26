import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string) => {
  // Buat worksheet dari data
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Buat workbook dan tambahkan worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Nilai");
  
  // Modifikasi nama file agar ada ekstensi .xlsx jika belum
  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  
  // Generate file dan trigger download
  XLSX.writeFile(workbook, finalFilename);
};
