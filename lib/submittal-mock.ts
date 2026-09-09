export interface ExtractedAttribute {
    field: string;
    value: string;
    confidence: number;
    status: 'high' | 'medium' | 'low';
  }
  
  export const mockSubmittal = {
    id: 'SUB-042',
    revision: '0',
    title: 'Bell & Gossett Base-Mounted Centrifugal Pumps',
    specSection: '23 21 23 - Hydronic Pumps',
    projectSightStatus: 'Approved',
    fileName: 'SUB-042-OM-Manual.pdf',
    fileSize: '14.2 MB',
  };
  
  export const targetCandidates = [
    { id: 'PMP-0104', text: 'PMP-0104 (Staged - Missing Serial/Model)' },
    { id: 'PMP-0105', text: 'PMP-0105 (Staged - Missing Serial/Model)' },
  ];
  
  export const mockExtractedAttributes: ExtractedAttribute[] = [
    { field: 'Manufacturer', value: 'Bell & Gossett', confidence: 99, status: 'high' },
    { field: 'Model_Number', value: 'e-1510 3EB', confidence: 97, status: 'high' },
    { field: 'Motor_HP', value: '15 HP', confidence: 95, status: 'high' },
    { field: 'Impeller_Size', value: '7.5 inches', confidence: 91, status: 'high' },
    { field: 'Design_GPM', value: '450 GPM', confidence: 94, status: 'high' },
  ];