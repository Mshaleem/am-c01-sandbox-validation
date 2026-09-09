export interface ChecklistContext {
  checklistId: string;
  title: string;
  project: string;
  subcontractor: string;
  specSection: string;
  drawingTag: string;
  sheetRef: string;
  submittalRef: string;
}

export const mockChecklist: ChecklistContext = {
  checklistId: 'CK-4092',
  title: 'Mechanical Room B-12 Rough-In & Equipment Placement',
  project: 'Water Treatment Plant Expansion',
  subcontractor: 'Apex Mechanical LLC',
  specSection: '23 21 23 - Hydronic Pumps',
  drawingTag: 'PMP-0104',
  sheetRef: 'Sheet M-102 (Grid B-4)',
  submittalRef: 'SUB-042 (Bell & Gossett Base-Mounted Centrifugal Pumps)',
};

export interface OcrHarvestResult {
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  designGpm: string;
  headFt: string;
  electricalRating: string;
  confidenceScore: number;
}

export const mockOcrResult: OcrHarvestResult = {
  manufacturer: 'Bell & Gossett',
  modelNumber: 'e-1510 3EB',
  serialNumber: 'BG-2026-981120',
  designGpm: '450 GPM',
  headFt: '65 FT',
  electricalRating: '460V / 3 Phase / 60 Hz',
  confidenceScore: 0.96,
};
