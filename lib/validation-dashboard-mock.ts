export const mockQueueSummary = {
  totalStaged: 14,
  blockerErrors: 3,
  warnings: 2,
  handoverReady: 9,
};

export interface ValidationCandidate {
    id: string;
    assetTag: string;
    assetClass: string;
    errorType: 'Schema Domain' | 'Lineage Gap' | 'Spec Alignment' | 'Tag Format Regex' | 'Validated';
    severity: 'blocker' | 'warning' | 'clean';
    issueDescription: string;
    goldenKey: string;
    sourceChecklist?: string;
    sourceSubmittal?: string;
    spatialAnchor?: string;
    status: 'alert' | 'warn' | 'ok';
  }
  
  export const mockValidationCandidates: ValidationCandidate[] = [
    {
      id: '1',
      assetTag: 'PMP-0104',
      assetClass: 'Mechanical: Pump',
      errorType: 'Lineage Gap',
      severity: 'blocker',
      issueDescription: 'Missing Serial Number (Nameplate photo OCR unverified)',
      goldenKey: 'GK-8821-0104',
      sourceChecklist: 'CK-4092 (Mechanical Room B-12)',
      sourceSubmittal: 'SUB-042 (Bell & Gossett Pumps)',
      spatialAnchor: 'Sheet M-102 (Grid B-4)',
      status: 'alert',
    },
    {
      id: '2',
      assetTag: 'PMP-0105',
      assetClass: 'Mechanical: Pump',
      errorType: 'Schema Domain',
      severity: 'warning',
      issueDescription: "Fluid_Type value 'Glycol Solution' outside ArcGIS domain picklist",
      goldenKey: 'GK-8821-0105',
      sourceChecklist: 'CK-4093 (Mechanical Room B-12)',
      sourceSubmittal: 'SUB-042 (Bell & Gossett Pumps)',
      spatialAnchor: 'Sheet M-102 (Grid B-5)',
      status: 'warn',
    },
    {
      id: '3',
      assetTag: 'DDC-0301',
      assetClass: 'Direct Digital Control',
      errorType: 'Spec Alignment',
      severity: 'blocker',
      issueDescription: 'Spec Section 23 09 23 has Rule Missing status (GAP-AM-012)',
      goldenKey: 'GK-8821-0301',
      sourceChecklist: 'CK-3011 (Control Panel Alpha)',
      sourceSubmittal: 'SUB-088 (DDC Automation Controllers)',
      spatialAnchor: 'Sheet E-201 (Grid C-1)',
      status: 'alert',
    },
    {
      id: '4',
      assetTag: 'VLV-0201',
      assetClass: 'Piping: Valve',
      errorType: 'Tag Format Regex',
      severity: 'blocker',
      issueDescription: "Tag 'V-201' fails project naming convention regex ^VLV-\\d{4}$",
      goldenKey: 'GK-8821-0201',
      sourceChecklist: 'CK-1044 (Main Water Line)',
      sourceSubmittal: 'SUB-019 (Gate Valves)',
      spatialAnchor: 'Sheet P-101 (Grid A-2)',
      status: 'alert',
    },
    {
      id: '5',
      assetTag: 'PNL-0101',
      assetClass: 'Electrical: Panelboard',
      errorType: 'Validated',
      severity: 'clean',
      issueDescription: 'Record complete. All required attributes and Golden Key lineage verified.',
      goldenKey: 'GK-8821-0101',
      sourceChecklist: 'CK-5001 (Electrical Room 1)',
      sourceSubmittal: 'SUB-012 (Square D Panelboards)',
      spatialAnchor: 'Sheet E-101 (Grid B-1)',
      status: 'ok',
    },
  ];