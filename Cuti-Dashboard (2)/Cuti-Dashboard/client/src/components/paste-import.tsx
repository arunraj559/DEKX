import { useState } from "react";
import { parseLeaveText, ParsedLeaveData } from "@/lib/parse-leave-data";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NeonCard } from "./ui/neon-card";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasteImportProps {
  onImport: (data: ParsedLeaveData) => void;
}

export function PasteImport({ onImport }: PasteImportProps) {
  const [pasteText, setPasteText] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handlePaste = () => {
    if (!pasteText.trim()) {
      toast({
        title: "Teks Kosong",
        description: "Silakan paste data terlebih dahulu.",
        variant: "destructive"
      });
      return;
    }

    const parsed = parseLeaveText(pasteText);
    
    if (!parsed.situs && !parsed.perihal) {
      toast({
        title: "Format Tidak Dikenali",
        description: "Pastikan format sesuai dengan template.",
        variant: "destructive"
      });
      return;
    }

    onImport(parsed);
    setPasteText("");
    toast({
      title: "Data Berhasil Diparse",
      description: "Form telah otomatis terisi.",
      className: "bg-black border-[var(--color-primary)] text-[var(--color-primary)]"
    });
  };

  const exampleText = `PENGAJUAN CUTI STAFF - INDONESIA
Situs : TYVOTO
Perihal : Pengajuan Cuti Ambil Paspor
No Paspor : C0629TTR
Tanggal Pengajuan : 2 December - 16 December 2025
Keterangan : CUTI INDONESIA
ACC LDR : BUFON`;

  const handleCopyExample = async () => {
    try {
      await navigator.clipboard.writeText(exampleText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Template Disalin",
        description: "Silakan paste dan modifikasi sesuai kebutuhan.",
        className: "bg-black border-[var(--color-primary)] text-[var(--color-primary)]"
      });
    } catch {
      toast({
        title: "Gagal Menyalin",
        variant: "destructive"
      });
    }
  };

  return (
    <NeonCard title="Impor Data (Copy-Paste)">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold tracking-wider text-[var(--color-primary)] uppercase mb-2 block">
            Tempel Data di Sini
          </label>
          <Textarea
            placeholder="Tempel format seperti ini:&#10;Situs : TYVOTO&#10;Perihal : Pengajuan Cuti Ambil Paspor&#10;No Paspor : C0629TTR&#10;Tanggal Pengajuan : 2 December - 16 December 2025&#10;Keterangan : CUTI INDONESIA&#10;ACC LDR : BUFON"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="resize-none bg-black/40 border-[var(--color-secondary)] focus:border-[var(--color-primary)] text-white min-h-32"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handlePaste}
            className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-black font-bold tracking-widest uppercase font-display py-6 shadow-[0_0_20px_rgba(0,212,255,0.4)]"
          >
            Parse & Isi Form
          </Button>
          <Button 
            onClick={handleCopyExample}
            variant="outline"
            className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 font-bold"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Tersalin
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Template
              </>
            )}
          </Button>
        </div>

        <div className="bg-black/50 border border-[var(--color-secondary)]/30 rounded p-3">
          <p className="text-xs font-mono text-muted-foreground">
            💡 Tip: Salin data dari spreadsheet atau dokumen, tempel di atas, lalu klik "Parse & Isi Form"
          </p>
        </div>
      </div>
    </NeonCard>
  );
}
