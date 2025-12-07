export type Division = 'KAPTEN' | 'CS' | 'KASIR' | 'CS_LINE';

export interface LeaveRequest {
  id: string;
  nama: string;
  division: Division;
  situs: string;
  perihal: string;
  noPaspor: string;
  startDate: string;
  endDate: string;
  keterangan: string;
  accLdr: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const DIVISIONS: Record<Division, { label: string; limit: number; id: Division }> = {
  KAPTEN: { label: 'KAPTEN', limit: 1, id: 'KAPTEN' },
  CS: { label: 'CS', limit: 2, id: 'CS' },
  KASIR: { label: 'KASIR', limit: 3, id: 'KASIR' },
  CS_LINE: { label: 'CS LINE', limit: 1, id: 'CS_LINE' },
};
