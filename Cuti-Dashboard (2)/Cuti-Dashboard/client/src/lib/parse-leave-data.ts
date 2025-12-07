import { parse } from "date-fns";
import { id as localeId } from "date-fns/locale";

export interface ParsedLeaveData {
  situs?: string;
  perihal?: string;
  noPaspor?: string;
  namaStar?: string;
  nama?: string; // Added alias
  tanggalPengajuan?: string;
  startDate?: Date; // Added parsed date
  endDate?: Date; // Added parsed date
  keterangan?: string;
  accLdr?: string;
  division?: 'KAPTEN' | 'CS' | 'KASIR' | 'CS_LINE';
}

export function parseLeaveText(text: string): ParsedLeaveData {
  const data: ParsedLeaveData = {};

  // Bersihkan teks - pisahkan dengan newline
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Array untuk menyimpan semua date ranges yang ditemukan
  const dateRanges: Array<{ type: string; dateStr: string }> = [];
  
  for (const line of lines) {
    // Extract Situs
    if (line.toLowerCase().includes('situs')) {
      const match = line.match(/situs\s*:\s*(.+?)$/i);
      if (match) data.situs = match[1].trim();
    }

    // Extract Perihal
    if (line.toLowerCase().includes('perihal')) {
      const match = line.match(/perihal\s*:\s*(.+?)$/i);
      if (match) data.perihal = match[1].trim();
    }

    // Extract No Paspor
    if (line.toLowerCase().includes('no paspor') || line.toLowerCase().includes('no.paspor')) {
      const match = line.match(/(?:no\.?\s*paspor|nomor\s*paspor)\s*:\s*(.+?)$/i);
      if (match) {
        const noPaspor = match[1].trim();
        if (noPaspor.toLowerCase() !== '-' && noPaspor !== '' && noPaspor.toLowerCase() !== 'no paspor') {
          data.noPaspor = noPaspor;
        }
      }
    }

    // Extract Nama Staff
    if (line.toLowerCase().includes('nama staff')) {
      const match = line.match(/nama\s*staff\s*:\s*(.+?)$/i);
      if (match) {
        data.namaStar = match[1].trim();
        data.nama = data.namaStar; // Populate alias
      }
    }

    // Extract Tanggal Pengajuan - HANDLE MULTIPLE DATES (e.g., CUTI KERJA, CUTI LOKAL)
    if ((line.toLowerCase().includes('tanggal') || line.toLowerCase().includes('pada')) && 
        (line.includes('-') || line.includes('–'))) {
      // Check for CUTI type (CUTI KERJA, CUTI LOKAL, etc)
      const cutiTypeMatch = line.match(/cuti\s+(\w+)/i);
      const cutiType = cutiTypeMatch ? cutiTypeMatch[1].trim() : 'CUTI';
      
      // Extract everything setelah ':' sampai '(' jika ada
      const match = line.match(/:\s*(.+?)(?:\s*\(|$)/i);
      if (match) {
        let dateStr = match[1].trim();
        // Hapus "(X HARI)" atau "( X HARI )" jika ada
        dateStr = dateStr.replace(/\s*\(\s*\d+\s*(?:hari|day)s?\s*\)\s*/i, '').trim();
        
        if (dateStr) {
          dateRanges.push({ type: cutiType, dateStr });
        }
      }
    }

    // Extract Keterangan
    if (line.toLowerCase().includes('keterangan')) {
      const match = line.match(/keterangan\s*:\s*(.+?)$/i);
      if (match) data.keterangan = match[1].trim();
    }

    // Extract ACC LDR
    if (line.toLowerCase().includes('acc ldr') || (line.toLowerCase().includes('acc') && !line.toLowerCase().includes('cuti'))) {
      const match = line.match(/acc\s*(?:ldr)?\s*:\s*(.+?)$/i);
      if (match && !match[1].toLowerCase().includes('acc')) {
        data.accLdr = match[1].trim();
      }
    }
  }

  // Jika ada multiple date ranges, gabungkan mulai dari yang pertama sampai yang terakhir
  if (dateRanges.length > 0) {
    if (dateRanges.length === 1) {
      // Hanya satu date range
      data.tanggalPengajuan = dateRanges[0].dateStr;
      if (!data.keterangan) {
        data.keterangan = `CUTI ${dateRanges[0].type.toUpperCase()}`;
      }
    } else {
      // Multiple date ranges - gabungkan dari tanggal awal sampai akhir
      const firstDateRange = dateRanges[0].dateStr;
      const lastDateRange = dateRanges[dateRanges.length - 1].dateStr;
      
      // Extract end date dari last range
      const endMatch = lastDateRange.match(/(\d+)\s+([\w]+)\s+(\d{4})?$/i);
      
      if (endMatch) {
        // Ambil start dari range pertama, end dari range terakhir
        const startParts = firstDateRange.split('-')[0].trim();
        const endParts = lastDateRange.split('-')[1] ? lastDateRange.split('-')[1].trim() : lastDateRange;
        data.tanggalPengajuan = `${startParts} - ${endParts}`;
      } else {
        data.tanggalPengajuan = firstDateRange;
      }
      
      // Buat keterangan dari tipe-tipe cuti
      if (!data.keterangan) {
        const cutiTypes = dateRanges.map(r => `CUTI ${r.type.toUpperCase()}`).join(', ');
        data.keterangan = cutiTypes;
      }
    }
  }

  // Parse Date Objects
  if (data.tanggalPengajuan) {
    try {
      const [startStr, endStr] = data.tanggalPengajuan.split(/\s*[-–]\s*/);
      
      if (startStr && endStr) {
        // Format dates properly for parsing if year is missing
        const currentYear = new Date().getFullYear();
        
        // Helper to parse date string like "20 OKTOBER 2024" or "20 OKTOBER"
        const parseDateString = (str: string) => {
          str = str.trim();
          // If no year, assume current year
          if (!/\d{4}/.test(str)) {
            str = `${str} ${currentYear}`;
          }
          // Try parsing with Indonesian locale
          return parse(str, "dd MMMM yyyy", new Date(), { locale: localeId });
        };

        data.startDate = parseDateString(startStr);
        data.endDate = parseDateString(endStr);
      }
    } catch (e) {
      console.error("Error parsing dates:", e);
    }
  }

  // Detect division dari seluruh text
  const textUpper = text.toUpperCase();
  if (textUpper.includes('CS LINE') || textUpper.includes('CUTI LOKAL')) {
    data.division = 'CS_LINE';
  } else if (textUpper.includes('KASIR')) {
    data.division = 'KASIR';
  } else if (textUpper.includes('CS') && !textUpper.includes('CS LINE')) {
    data.division = 'CS';
  } else if (textUpper.includes('KAPTEN')) {
    data.division = 'KAPTEN';
  }

  return data;
}
