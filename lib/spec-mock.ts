export interface SpecMapping {
  id: string;
  specNumber: string;
  specTitle: string;
  alignedClass: string;
  mappingRule: 'MasterFormat' | 'Custom Override' | 'Unmapped';
  status: 'Auto-Linked' | 'Manual Link' | 'Rule Missing';
}

export const initialSpecs: SpecMapping[] = [
  { id: '1', specNumber: '23 21 23', specTitle: 'Hydronic Pumps', alignedClass: 'Mechanical: Pump', mappingRule: 'MasterFormat', status: 'Auto-Linked' },
  { id: '2', specNumber: '23 22 16', specTitle: 'Steam Piping Specialties', alignedClass: 'Piping: Steam Valve', mappingRule: 'MasterFormat', status: 'Auto-Linked' },
  { id: '3', specNumber: '26 24 16', specTitle: 'Panelboards', alignedClass: 'Electrical: Panelboard', mappingRule: 'MasterFormat', status: 'Auto-Linked' },
  { id: '4', specNumber: '21 13 13', specTitle: 'Wet-Pipe Sprinkler Systems', alignedClass: 'Fire Protection: Sprinkler', mappingRule: 'Custom Override', status: 'Manual Link' },
  { id: '5', specNumber: '23 09 23', specTitle: 'Direct Digital Control Systems', alignedClass: '-- Unmapped --', mappingRule: 'Unmapped', status: 'Rule Missing' },
];

export const availableAssetClasses = [
  'Mechanical: Pump',
  'Piping: Steam Valve',
  'Electrical: Panelboard',
  'Fire Protection: Sprinkler',
  'HVAC: Air Handling Unit',
  'Plumbing: Water Heater',
];
