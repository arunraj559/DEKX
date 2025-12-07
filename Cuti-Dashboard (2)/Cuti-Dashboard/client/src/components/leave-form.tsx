import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addMonths, isAfter, parse, differenceInDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DIVISIONS, Division, LeaveRequest } from "@/lib/types";
import { ParsedLeaveData } from "@/lib/parse-leave-data";
import { cn } from "@/lib/utils";
import { NeonCard } from "./ui/neon-card";

const formSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  division: z.enum(['KAPTEN', 'CS', 'KASIR', 'CS_LINE']),
  situs: z.string().min(2, "Situs minimal 2 karakter"),
  perihal: z.string().min(5, "Perihal minimal 5 karakter"),
  noPaspor: z.string().optional(),
  startDate: z.date({ required_error: "Tanggal mulai wajib diisi" }),
  endDate: z.date({ required_error: "Tanggal selesai wajib diisi" }),
  keterangan: z.string().min(5, "Keterangan minimal 5 karakter"),
  accLdr: z.string().min(2, "Nama ACC LDR minimal 2 karakter"),
});

interface LeaveFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  importData?: ParsedLeaveData;
  requests?: LeaveRequest[];
}

export function LeaveForm({ onSubmit, importData, requests = [] }: LeaveFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      division: "CS",
      situs: "",
      perihal: "",
      noPaspor: "",
      keterangan: "",
      accLdr: "",
    },
  });

  const selectedDivision = form.watch('division') as Division;

  // Hitung slot tersedia untuk divisi di bulan saat ini - REACTIVE
  const slotInfo = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Hitung pengajuan yang sudah APPROVED di bulan ini
    const approvedThisMonth = requests.filter(req => {
      if (req.status !== 'APPROVED' || req.division !== selectedDivision) return false;
      
      const reqStart = new Date(req.startDate);
      const reqMonth = reqStart.getMonth();
      const reqYear = reqStart.getFullYear();
      
      return reqMonth === currentMonth && reqYear === currentYear;
    }).length;

    const totalSlots = DIVISIONS[selectedDivision].limit;
    const available = Math.max(0, totalSlots - approvedThisMonth);

    return { 
      available, 
      total: totalSlots, 
      used: approvedThisMonth,
      isFull: available === 0
    };
  }, [selectedDivision, requests]);

  // Parse tanggal dari berbagai format
  const parseDateRange = (dateRangeStr: string): { start: Date; end: Date } | null => {
    try {
      console.log('Parsing date range:', dateRangeStr);
      
      // Format: "2 December - 16 December 2025" atau "2 DECEMBER - 16 DECEMBER 2025"
      // Format: "11 DESEMBER 2025 - 28 DESEMBER 2025"
      const parts = dateRangeStr.toUpperCase().split(/[-–]/).map(p => p.trim());
      console.log('Split parts:', parts);
      
      if (parts.length !== 2) {
        console.log('Not 2 parts, returning null');
        return null;
      }

      const startPart = parts[0].trim();
      const endPart = parts[1].trim();

      // Normalize month names Indonesian -> English
      const monthMap: { [key: string]: number } = {
        'JANUARI': 0, 'JANUARY': 0,
        'FEBRUARI': 1, 'FEBRUARY': 1,
        'MARET': 2, 'MARCH': 2,
        'APRIL': 3,
        'MEI': 4, 'MAY': 4,
        'JUNI': 5, 'JUNE': 5,
        'JULI': 6, 'JULY': 6,
        'AGUSTUS': 7, 'AUGUST': 7,
        'SEPTEMBER': 8,
        'OKTOBER': 9, 'OCTOBER': 9,
        'NOVEMBER': 10,
        'DESEMBER': 11, 'DECEMBER': 11
      };

      // Parse start date
      const startDayMatch = startPart.match(/(\d+)\s+([\w]+)\s+(\d{4})?/);
      if (!startDayMatch) {
        console.log('Start date format invalid');
        return null;
      }

      let startDay = parseInt(startDayMatch[1]);
      let startMonth = monthMap[startDayMatch[2].toUpperCase()];
      let startYear = startDayMatch[3] ? parseInt(startDayMatch[3]) : new Date().getFullYear();

      if (startMonth === undefined) {
        console.log('Invalid start month:', startDayMatch[2]);
        return null;
      }

      // Parse end date
      const endDayMatch = endPart.match(/(\d+)\s+([\w]+)\s+(\d{4})?/);
      if (!endDayMatch) {
        console.log('End date format invalid');
        return null;
      }

      let endDay = parseInt(endDayMatch[1]);
      let endMonth = monthMap[endDayMatch[2].toUpperCase()];
      let endYear = endDayMatch[3] ? parseInt(endDayMatch[3]) : new Date().getFullYear();

      if (endMonth === undefined) {
        console.log('Invalid end month:', endDayMatch[2]);
        return null;
      }

      // Jika tidak ada year di start, gunakan tahun dari end
      if (!startDayMatch[3]) {
        startYear = endYear;
      }

      console.log(`Creating dates: Start (${startDay} / ${startMonth} / ${startYear}), End (${endDay} / ${endMonth} / ${endYear})`);

      const startDate = new Date(startYear, startMonth, startDay);
      const endDate = new Date(endYear, endMonth, endDay);

      console.log('Created dates:', startDate, endDate);

      return { start: startDate, end: endDate };
    } catch (e) {
      console.error('Error parsing date:', e);
      return null;
    }
  };

  useEffect(() => {
    if (importData) {
      if (importData.namaStar) form.setValue("nama", importData.namaStar);
      if (importData.situs) form.setValue("situs", importData.situs);
      if (importData.perihal) form.setValue("perihal", importData.perihal);
      if (importData.noPaspor) form.setValue("noPaspor", importData.noPaspor);
      if (importData.keterangan) form.setValue("keterangan", importData.keterangan);
      if (importData.accLdr) form.setValue("accLdr", importData.accLdr);
      if (importData.division) form.setValue("division", importData.division);

      if (importData.tanggalPengajuan) {
        const dateRange = parseDateRange(importData.tanggalPengajuan);
        if (dateRange) {
          form.setValue("startDate", dateRange.start);
          form.setValue("endDate", dateRange.end);
        }
      }
    }
  }, [importData, form]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (data.startDate > data.endDate) {
      form.setError("endDate", { 
        message: "Tanggal selesai harus setelah tanggal mulai" 
      });
      return;
    }
    
    const maxDate = addMonths(new Date(), 2);
    if (isAfter(data.startDate, maxDate)) {
      form.setError("startDate", { 
        message: "Pengajuan maksimal 2 bulan sebelum cuti" 
      });
      return;
    }

    // Validasi slot - hanya cek jika pengajuan di bulan saat ini
    const startMonth = data.startDate.getMonth();
    const startYear = data.startDate.getFullYear();
    const now = new Date();
    
    if (startMonth === now.getMonth() && startYear === now.getFullYear()) {
      if (slotInfo.isFull) {
        form.setError("division", { 
          message: "Slot cuti untuk divisi ini bulan ini sudah penuh" 
        });
        return;
      }
    }
    
    onSubmit(data);
    form.reset();
  };

  return (
    <NeonCard title="Pengajuan Cuti Staff">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--color-primary)] uppercase tracking-wider text-xs font-bold">Nama Staff</FormLabel>
                <FormControl>
                  <Input placeholder="Ketik nama anda..." {...field} className="bg-black/40 border-[var(--color-secondary)] focus:border-[var(--color-primary)] text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="division"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--color-primary)] uppercase tracking-wider text-xs font-bold">Divisi</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-black/40 border-[var(--color-secondary)] text-white">
                      <SelectValue placeholder="Pilih Divisi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#1a1a2e] border-[var(--color-primary)] text-white">
                    {Object.values(DIVISIONS).map((div) => (
                      <SelectItem key={div.id} value={div.id}>
                        {div.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                
                {/* Slot Info - Real-time Update */}
                <div className={`mt-3 p-3 rounded border-2 flex items-center gap-2 transition-all ${
                  slotInfo.isFull
                    ? 'bg-[var(--color-destructive)]/10 border-[var(--color-destructive)]'
                    : 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]'
                }`}>
                  {slotInfo.isFull && <AlertCircle className="w-4 h-4 text-[var(--color-destructive)] flex-shrink-0" />}
                  <div className="text-xs font-mono">
                    <span className={slotInfo.isFull ? 'text-[var(--color-destructive)]' : 'text-[var(--color-primary)]'}>
                      Slot Bulan Ini: <span className="font-bold">{slotInfo.used}/{slotInfo.total}</span>
                      {slotInfo.available > 0 && <span className="text-[var(--color-primary)]"> ({slotInfo.available} Tersedia)</span>}
                      {slotInfo.isFull && <span className="text-[var(--color-destructive)]"> - PENUH</span>}
                    </span>
                  </div>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="situs"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--color-primary)] uppercase tracking-wider text-xs font-bold">Situs</FormLabel>
                <FormControl>
                  <Input placeholder="Nama situs..." {...field} className="bg-black/40 border-[var(--color-secondary)] focus:border-[var(--color-primary)] text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="perihal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--color-primary)] uppercase tracking-wider text-xs font-bold">Perihal</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: PENGAJUAN CUTI INDONESIA AMBIL PASPOR" {...field} className="bg-black/40 border-[var(--color-secondary)] focus:border-[var(--color-primary)] text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="noPaspor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--color-primary)] uppercase tracking-wider text-xs font-bold">No Paspor</FormLabel>
                <FormControl>
                  <Input placeholder="Nomor paspor (opsional)" {...field} className="bg-black/40 border-[var(--color-secondary)] focus:border-[var(--color-primary)] text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[var(--color-primary)] uppercase tracking-wider text-xs font-bold">Tanggal Mulai</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-black/40 border-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary)] hover:text-black h-auto py-6 text-lg font-bold tracking-wider",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                            <span className="font-display">
                              {format(field.value, "dd MMM yyyy", { locale: localeId })}
                            </span>
                          ) : (
                            <span>Pilih Tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#141428] border-[var(--color-primary)]" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                        className="text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[var(--color-primary)] uppercase tracking-wider text-xs font-bold">Tanggal Selesai</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-black/40 border-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary)] hover:text-black h-auto py-6 text-lg font-bold tracking-wider",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                            <span className="font-display">
                              {format(field.value, "dd MMM yyyy", { locale: localeId })}
                            </span>
                          ) : (
                            <span>Pilih Tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#141428] border-[var(--color-primary)]" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                        className="text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="keterangan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--color-primary)] uppercase tracking-wider text-xs font-bold">Keterangan</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Jelaskan keterangan cuti anda..." 
                    className="resize-none bg-black/40 border-[var(--color-secondary)] focus:border-[var(--color-primary)] text-white min-h-24" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accLdr"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--color-primary)] uppercase tracking-wider text-xs font-bold">ACC LDR</FormLabel>
                <FormControl>
                  <Input placeholder="Nama leader/atasan..." {...field} className="bg-black/40 border-[var(--color-secondary)] focus:border-[var(--color-primary)] text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 text-black font-bold tracking-widest uppercase font-display py-6 shadow-[0_0_20px_rgba(0,212,255,0.4)]">
            Kirim Pengajuan
          </Button>
        </form>
      </Form>
    </NeonCard>
  );
}
