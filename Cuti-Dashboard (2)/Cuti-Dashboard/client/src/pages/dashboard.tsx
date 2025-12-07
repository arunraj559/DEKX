import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format, differenceInDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { LeaveRequest, DIVISIONS, Division } from "@/lib/types";
import { ParsedLeaveData } from "@/lib/parse-leave-data";
import { StatsCards } from "@/components/stats-cards";
import { LeaveForm } from "@/components/leave-form";
import { PasteImport } from "@/components/paste-import";
import { NeonCard } from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockStorage } from "@/lib/mock-storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Lock, Unlock, Plus, X, CheckCircle, Clock, XCircle, Eye, EyeOff, Trash2, Settings } from "lucide-react";
import logoImage from '@assets/generated_images/neon_hexagon_cybernetic_logo.png';

const DEFAULT_APPROVERS = ["arunraj170845@gmail.com"];

interface RequestTableProps {
  title: string;
  requests: LeaveRequest[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isAdmin: boolean;
  onStatusChange: (id: string, newStatus: 'APPROVED' | 'REJECTED') => void;
  onDelete: (id: string) => void;
  icon: React.ReactNode;
  borderColor: string;
  headerBg: string;
}

function RequestTable({ title, requests, status, isAdmin, onStatusChange, onDelete, icon, borderColor, headerBg }: RequestTableProps) {
  if (requests.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-[var(--color-primary)]">
        {icon}
        <h3 className="text-xl font-bold font-display tracking-widest text-[var(--color-primary)] uppercase">{title}</h3>
        <span className="ml-auto text-sm font-mono bg-[var(--color-secondary)]/20 px-3 py-1 rounded border border-[var(--color-secondary)] text-[var(--color-secondary)]">
          {requests.length} item
        </span>
      </div>
      <div className={`rounded-md border-2 overflow-x-auto ${borderColor}`}>
        <Table>
          <TableHeader className={headerBg}>
            <TableRow className={`${borderColor} hover:bg-transparent`}>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs">Nama</TableHead>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs">Divisi</TableHead>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs">Periode Cuti</TableHead>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs">Perihal</TableHead>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs">ACC LDR</TableHead>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => {
              const startDate = new Date(req.startDate);
              const endDate = new Date(req.endDate);
              const daysCount = differenceInDays(endDate, startDate) + 1;
              const dateRange = `${format(startDate, "dd MMMM yyyy", { locale: localeId }).toUpperCase()} - ${format(endDate, "dd MMMM yyyy", { locale: localeId }).toUpperCase()} (${daysCount} Hari)`;
              
              return (
                <TableRow key={req.id} className={`${borderColor}/30 hover:bg-[var(--color-primary)]/5 transition-colors`}>
                  <TableCell className="font-medium text-white text-sm">{req.nama}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/10 text-xs">
                      {req.division.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--color-secondary)] font-mono text-xs font-bold">{dateRange}</TableCell>
                  <TableCell className="text-white text-sm max-w-xs truncate">{req.perihal}</TableCell>
                  <TableCell className="text-[var(--color-secondary)] font-bold text-sm">{req.accLdr}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {isAdmin && status === 'PENDING' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary)]/80 text-xs h-8 font-bold"
                          onClick={() => onStatusChange(req.id, 'APPROVED')}
                        >
                          ACC
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="text-xs h-8 font-bold"
                          onClick={() => onStatusChange(req.id, 'REJECTED')}
                        >
                          TOLAK
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/20 text-xs h-8 font-bold"
                      onClick={() => onDelete(req.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface DivisionFilterTableProps {
  division: Division;
  requests: LeaveRequest[];
  onDelete: (id: string) => void;
  borderColor: string;
  headerBg: string;
}

function DivisionFilterTable({ division, requests, onDelete, borderColor, headerBg }: DivisionFilterTableProps) {
  if (requests.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-[var(--color-primary)]">
        <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" />
        <h4 className="font-bold font-display tracking-widest text-[var(--color-primary)] uppercase">{DIVISIONS[division].label}</h4>
        <span className="ml-auto text-xs font-mono bg-[var(--color-primary)]/20 px-2 py-1 rounded border border-[var(--color-primary)] text-[var(--color-primary)]">
          {requests.length}
        </span>
      </div>
      <div className={`rounded-md border overflow-x-auto ${borderColor}`}>
        <Table>
          <TableHeader className={headerBg}>
            <TableRow className={`${borderColor} hover:bg-transparent`}>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs">Nama</TableHead>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs">Periode Cuti</TableHead>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs">Perihal</TableHead>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs">ACC LDR</TableHead>
              <TableHead className="text-[var(--color-primary)] font-bold uppercase tracking-wider text-xs text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => {
              const startDate = new Date(req.startDate);
              const endDate = new Date(req.endDate);
              const daysCount = differenceInDays(endDate, startDate) + 1;
              const dateRange = `${format(startDate, "dd MMMM yyyy", { locale: localeId }).toUpperCase()} - ${format(endDate, "dd MMMM yyyy", { locale: localeId }).toUpperCase()} (${daysCount} Hari)`;
              
              return (
                <TableRow key={req.id} className={`${borderColor}/30 hover:bg-[var(--color-primary)]/5 transition-colors`}>
                  <TableCell className="font-medium text-white text-sm">{req.nama}</TableCell>
                  <TableCell className="text-[var(--color-secondary)] font-mono text-xs font-bold">{dateRange}</TableCell>
                  <TableCell className="text-white text-sm max-w-xs truncate">{req.perihal}</TableCell>
                  <TableCell className="text-[var(--color-secondary)] font-bold text-sm">{req.accLdr}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/20 text-xs h-8 font-bold"
                      onClick={() => onDelete(req.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [approverEmails, setApproverEmails] = useState<string[]>(DEFAULT_APPROVERS);
  const [newApproverEmail, setNewApproverEmail] = useState("");
  const [showAddApprover, setShowAddApprover] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [importData, setImportData] = useState<ParsedLeaveData | undefined>();
  const [filterDivision, setFilterDivision] = useState<Division | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [settings, setSettings] = useState(mockStorage.getSettings());

  // Load data from mock storage
  useEffect(() => {
    const loadData = () => {
      try {
        const storedRequests = mockStorage.getRequests();
        const storedSettings = mockStorage.getSettings();
        
        setRequests(storedRequests);
        setSettings(storedSettings);
        setApproverEmails(storedSettings.approverEmails?.split(',') || DEFAULT_APPROVERS);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Add event listener for storage changes (in case settings are updated in other tab)
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const rejectedRequests = requests.filter(r => r.status === 'REJECTED');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');

  const filteredApprovedRequests = filterDivision === 'ALL' 
    ? approvedRequests 
    : approvedRequests.filter(r => r.division === filterDivision);

  const handleLogin = () => {
    if (!adminEmail || !adminPassword) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Masukkan email dan password.",
        variant: "destructive"
      });
      return;
    }

    if (!approverEmails.includes(adminEmail)) {
      toast({
        title: "Akses Ditolak",
        description: "Email tidak terdaftar sebagai approver.",
        variant: "destructive"
      });
      return;
    }

    if (adminPassword !== settings.adminPassword) {
      toast({
        title: "Password Salah",
        description: "Password yang Anda masukkan tidak sesuai.",
        variant: "destructive"
      });
      return;
    }

    setIsAdmin(true);
    setAdminPassword("");
    toast({
      title: "Akses Diterima",
      description: `Selamat datang, Admin (${adminEmail})`,
      className: "bg-black border-[var(--color-primary)] text-[var(--color-primary)]"
    });
  };

  const handleAddApprover = () => {
    if (newApproverEmail && !approverEmails.includes(newApproverEmail)) {
      const updatedEmails = [...approverEmails, newApproverEmail];
      setApproverEmails(updatedEmails);
      
      // Update settings
      const newSettings = { ...settings, approverEmails: updatedEmails.join(',') };
      mockStorage.saveSettings(newSettings);
      setSettings(newSettings);
      
      setNewApproverEmail("");
      setShowAddApprover(false);
      toast({
        title: "Email Approver Ditambahkan",
        description: newApproverEmail,
        className: "bg-black border-[var(--color-primary)] text-[var(--color-primary)]"
      });
    }
  };

  const handleRemoveApprover = (email: string) => {
    if (approverEmails.length > 1) {
      const updatedEmails = approverEmails.filter(e => e !== email);
      setApproverEmails(updatedEmails);
      
      const newSettings = { ...settings, approverEmails: updatedEmails.join(',') };
      mockStorage.saveSettings(newSettings);
      setSettings(newSettings);
    }
  };

  const handleAddRequest = async (data: any) => {
    try {
      const newRequest = mockStorage.saveRequest({
        nama: data.nama,
        division: data.division,
        situs: data.situs,
        perihal: data.perihal,
        noPaspor: data.noPaspor || null,
        startDate: data.startDate,
        endDate: data.endDate,
        keterangan: data.keterangan,
        accLdr: data.accLdr,
        status: 'PENDING',
      });

      setRequests([newRequest, ...requests]);
      setImportData(undefined);
      toast({
        title: "Berhasil",
        description: "Pengajuan cuti berhasil dikirim.",
        className: "bg-black border-[var(--color-primary)] text-[var(--color-primary)]"
      });
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat mengirim pengajuan.",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const updated = mockStorage.updateRequestStatus(id, newStatus);
      if (updated) {
        setRequests(requests.map(req => req.id === id ? updated : req));
        toast({
          title: newStatus === 'APPROVED' ? 'Pengajuan Disetujui ✓' : 'Pengajuan Ditolak ✗',
          description: `Status berhasil diubah dan dipindahkan.`,
          className: `bg-black border-${newStatus === 'APPROVED' ? '[var(--color-primary)]' : '[var(--color-destructive)]'} text-${newStatus === 'APPROVED' ? '[var(--color-primary)]' : '[var(--color-destructive)]'}`
        });
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      mockStorage.deleteRequest(id);
      setRequests(requests.filter(req => req.id !== id));
      toast({
        title: "Pengajuan Dihapus",
        description: "Data telah dihapus dari sistem.",
        className: "bg-black border-[var(--color-destructive)] text-[var(--color-destructive)]"
      });
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-[var(--color-primary)] font-mono text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 border-b-2 border-[var(--color-primary)] pb-6 bg-black/80 sticky top-0 z-50 backdrop-blur-md px-4 rounded-b-lg shadow-[0_0_30px_rgba(0,212,255,0.2)]">
        <div className="flex items-center gap-4">
          <img src={logoImage} alt="Logo" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(0,212,255,0.8)]" />
          <div>
            <h1 className="text-3xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] drop-shadow-[0_0_10px_rgba(255,0,128,0.5)]">
              NEON CUTI
            </h1>
            <p className="text-xs font-mono text-muted-foreground tracking-[0.3em] uppercase">System Dashboard v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/settings")}
            variant="ghost"
            className="text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 font-bold"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4 mr-2" />
            SETTINGS
          </Button>
          {!isAdmin ? (
            <div className="flex gap-2 items-center">
              <Input 
                placeholder="Email..." 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-48 bg-black/50 border-[var(--color-secondary)] text-white placeholder:text-muted-foreground text-sm"
              />
              <div className="relative">
                <Input 
                  placeholder="Password..." 
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-48 bg-black/50 border-[var(--color-secondary)] text-white placeholder:text-muted-foreground text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button onClick={handleLogin} variant="outline" className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black font-bold font-display text-sm">
                <Lock className="w-4 h-4 mr-2" />
                LOGIN
              </Button>
            </div>
          ) : (
            <Button onClick={() => {
              setIsAdmin(false);
              setAdminEmail("");
            }} variant="ghost" className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 font-bold font-display">
              <Unlock className="w-4 h-4 mr-2" />
              LOGOUT
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto">
        <StatsCards requests={requests} currentMonth={new Date()} />

        {isAdmin && showSettings && (
          <NeonCard title="Pengaturan Dashboard" className="mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase mb-3">Email Approver Terdaftar</h3>
                <div className="space-y-2">
                  {approverEmails.map((email) => (
                    <div key={email} className="flex items-center justify-between bg-black/40 p-3 border border-[var(--color-secondary)] rounded">
                      <span className="text-white font-mono text-sm">{email}</span>
                      {approverEmails.length > 1 && (
                        <button 
                          onClick={() => handleRemoveApprover(email)}
                          className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/20 p-2 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!showAddApprover ? (
                <Button 
                  onClick={() => setShowAddApprover(true)}
                  className="w-full bg-[var(--color-primary)]/20 border-[var(--color-primary)] border hover:bg-[var(--color-primary)]/40 text-[var(--color-primary)] font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Email Approver
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Masukkan email baru..." 
                    value={newApproverEmail}
                    onChange={(e) => setNewApproverEmail(e.target.value)}
                    className="bg-black/40 border-[var(--color-secondary)] text-white"
                    type="email"
                  />
                  <Button 
                    onClick={() => {
                      handleAddApprover();
                    }}
                    className="bg-[var(--color-primary)] text-black hover:opacity-90 font-bold"
                  >
                    Tambah
                  </Button>
                  <Button 
                    onClick={() => setShowAddApprover(false)}
                    variant="ghost"
                    className="text-[var(--color-destructive)]"
                  >
                    Batal
                  </Button>
                </div>
              )}

              <Button 
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="w-full border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10"
              >
                Tutup Pengaturan
              </Button>
            </div>
          </NeonCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <NeonCard className="border-[var(--color-primary)]">
              <div className="flex gap-4 mb-6 border-b border-gray-800 pb-4">
                <Button 
                  variant={activeTab === 'PENDING' ? 'default' : 'ghost'}
                  className={activeTab === 'PENDING' 
                    ? "bg-[var(--color-primary)] text-black font-bold" 
                    : "text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"}
                  onClick={() => setActiveTab('PENDING')}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  MENUNGGU ({pendingRequests.length})
                </Button>
                <Button 
                  variant={activeTab === 'APPROVED' ? 'default' : 'ghost'}
                  className={activeTab === 'APPROVED' 
                    ? "bg-[var(--color-secondary)] text-black font-bold" 
                    : "text-[var(--color-secondary)] hover:text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10"}
                  onClick={() => setActiveTab('APPROVED')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  DISETUJUI ({approvedRequests.length})
                </Button>
              </div>

              {activeTab === 'PENDING' ? (
                <>
                  <RequestTable 
                    title="Menunggu Persetujuan" 
                    requests={pendingRequests} 
                    status="PENDING"
                    isAdmin={isAdmin}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteRequest}
                    icon={<Clock className="w-6 h-6 text-[var(--color-primary)] animate-pulse" />}
                    borderColor="border-[var(--color-primary)]"
                    headerBg="bg-[var(--color-primary)]/20"
                  />
                  
                  {rejectedRequests.length > 0 && (
                    <RequestTable 
                      title="Ditolak" 
                      requests={rejectedRequests} 
                      status="REJECTED"
                      isAdmin={isAdmin}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteRequest}
                      icon={<XCircle className="w-6 h-6 text-[var(--color-destructive)]" />}
                      borderColor="border-[var(--color-destructive)]"
                      headerBg="bg-[var(--color-destructive)]/20"
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="mb-6 flex justify-end">
                    <Select value={filterDivision} onValueChange={(v) => setFilterDivision(v as Division | 'ALL')}>
                      <SelectTrigger className="w-[200px] bg-black/40 border-[var(--color-secondary)] text-[var(--color-secondary)]">
                        <SelectValue placeholder="Filter Divisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">SEMUA DIVISI</SelectItem>
                        {Object.values(DIVISIONS).map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {filterDivision === 'ALL' ? (
                    Object.values(DIVISIONS).map(div => (
                      <DivisionFilterTable 
                        key={div.id}
                        division={div.id}
                        requests={filteredApprovedRequests.filter(r => r.division === div.id)}
                        onDelete={handleDeleteRequest}
                        borderColor="border-[var(--color-secondary)]"
                        headerBg="bg-[var(--color-secondary)]/20"
                      />
                    ))
                  ) : (
                    <DivisionFilterTable 
                      division={filterDivision}
                      requests={filteredApprovedRequests}
                      onDelete={handleDeleteRequest}
                      borderColor="border-[var(--color-secondary)]"
                      headerBg="bg-[var(--color-secondary)]/20"
                    />
                  )}
                </>
              )}
            </NeonCard>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {!importData ? (
              <NeonCard title="Form Pengajuan Cuti" className="sticky top-24 border-[var(--color-accent)]">
                <PasteImport onImport={setImportData} />
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-2 text-muted-foreground">Atau isi manual</span>
                  </div>
                </div>
                <LeaveForm onSubmit={handleAddRequest} />
              </NeonCard>
            ) : (
              <NeonCard title="Konfirmasi Data Import" className="sticky top-24 border-[var(--color-accent)] animate-in fade-in zoom-in duration-300">
                <div className="space-y-4">
                  <div className="bg-[var(--color-accent)]/10 p-4 rounded border border-[var(--color-accent)]/30">
                    <h4 className="font-bold text-[var(--color-accent)] mb-2">Data Terdeteksi:</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li><span className="text-gray-500">Nama:</span> {importData.nama}</li>
                      <li><span className="text-gray-500">Divisi:</span> {importData.division}</li>
                      <li><span className="text-gray-500">Tanggal:</span> {importData.startDate && importData.endDate ? `${format(importData.startDate, "dd MMM")} - ${format(importData.endDate, "dd MMM yyyy")}` : importData.tanggalPengajuan}</li>
                      <li><span className="text-gray-500">Perihal:</span> {importData.perihal}</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent)]/80 font-bold"
                      onClick={() => handleAddRequest(importData)}
                    >
                      Konfirmasi & Kirim
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setImportData(undefined)}
                      className="border-[var(--color-destructive)] text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              </NeonCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
