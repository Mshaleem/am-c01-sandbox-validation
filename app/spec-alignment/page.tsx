'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ModusWcAlert,
  ModusWcBadge,
  ModusWcButton,
  ModusWcCard,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTable,
  ModusWcToast,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import {
  availableAssetClasses,
  initialSpecs,
  type SpecMapping,
} from '@/lib/spec-mock';
import { readInputString } from '@/lib/modusFormEvents';
import { PresentationNav } from '@/components/presentation-nav';

const CLASSIFICATION_OPTIONS = [
  { label: 'CSI MasterFormat 2016', value: 'mf-2016' },
  { label: 'CSI MasterFormat 2018', value: 'mf-2018' },
  { label: 'CSI MasterFormat 2020', value: 'mf-2020' },
];

const UNMAPPED = '-- Unmapped --';

function statusColor(status: SpecMapping['status']): 'success' | 'primary' | 'warning' {
  if (status === 'Auto-Linked') return 'success';
  if (status === 'Manual Link') return 'primary';
  return 'warning';
}

function ruleColor(rule: SpecMapping['mappingRule']): 'default' | 'primary' | 'warning' {
  if (rule === 'MasterFormat') return 'default';
  if (rule === 'Custom Override') return 'primary';
  return 'warning';
}

function createBadge(label: string, color: 'default' | 'primary' | 'success' | 'warning') {
  const badge = document.createElement('modus-wc-badge');
  badge.setAttribute('size', 'sm');
  badge.setAttribute('variant', 'filled');
  badge.setAttribute('color', color);
  badge.textContent = label;
  return badge;
}

function createClassSelect(
  row: SpecMapping,
  onAlign: (id: string, assetClass: string) => void,
) {
  const select = document.createElement('modus-wc-select');
  select.size = 'sm';
  const current = row.alignedClass === UNMAPPED ? '' : row.alignedClass;
  select.value = current;
  select.options = [
    { label: 'Unmapped', value: '' },
    ...availableAssetClasses.map((name) => ({ label: name, value: name })),
  ];
  select.addEventListener('inputChange', (event) => {
    const value = readInputString(event as CustomEvent);
    onAlign(row.id, value);
  });
  return select;
}

export default function SpecAlignmentPage() {
  const router = useRouter();
  const [specs, setSpecs] = useState<SpecMapping[]>(() =>
    initialSpecs.map((item) => ({ ...item })),
  );
  const [scheme, setScheme] = useState('mf-2020');
  const [quickClass, setQuickClass] = useState('');
  const [quickSpecId, setQuickSpecId] = useState('');
  const [tableReady, setTableReady] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const alignRef = useRef<(id: string, assetClass: string) => void>(() => undefined);

  const alignClass = useCallback((id: string, assetClass: string) => {
    setSpecs((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        if (!assetClass) {
          return {
            ...row,
            alignedClass: UNMAPPED,
            mappingRule: 'Unmapped',
            status: 'Rule Missing',
          };
        }
        return {
          ...row,
          alignedClass: assetClass,
          mappingRule: 'Custom Override',
          status: 'Manual Link',
        };
      }),
    );
  }, []);

  alignRef.current = alignClass;

  useEffect(() => {
    const id = requestAnimationFrame(() => setTableReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const missing = specs.filter((row) => row.status === 'Rule Missing');

  useEffect(() => {
    if (missing.length === 0) {
      setQuickSpecId('');
      return;
    }
    if (!missing.some((row) => row.id === quickSpecId)) {
      setQuickSpecId(missing[0].id);
    }
  }, [missing, quickSpecId]);

  const columns = useMemo(
    () => [
      { id: 'specNumber', accessor: 'specNumber', header: 'Spec number' },
      { id: 'specTitle', accessor: 'specTitle', header: 'Specification title' },
      {
        id: 'alignedClass',
        accessor: 'alignedClass',
        header: 'Aligned ALCS asset class',
        cellRenderer: (_value: unknown, row: unknown) =>
          createClassSelect(row as SpecMapping, (id, assetClass) =>
            alignRef.current(id, assetClass),
          ),
      },
      {
        id: 'mappingRule',
        accessor: 'mappingRule',
        header: 'Mapping rule',
        cellRenderer: (value: unknown) =>
          createBadge(String(value), ruleColor(value as SpecMapping['mappingRule'])),
      },
      {
        id: 'status',
        accessor: 'status',
        header: 'Status',
        cellRenderer: (value: unknown) =>
          createBadge(String(value), statusColor(value as SpecMapping['status'])),
      },
    ],
    [],
  );

  const tableData = useMemo(
    () =>
      specs.map((row) => ({
        ...row,
      })),
    [specs],
  );

  const classOptions = useMemo(
    () => [
      { label: 'Select an asset class', value: '', hidden: true },
      ...availableAssetClasses.map((name) => ({ label: name, value: name })),
    ],
    [],
  );

  const missingSpecOptions = useMemo(
    () => missing.map((row) => ({
      label: `${row.specNumber} — ${row.specTitle}`,
      value: row.id,
    })),
    [missing],
  );

  const applyQuickMap = (assetClass: string) => {
    const targetId = quickSpecId || missing[0]?.id;
    if (!targetId || !assetClass) return;
    alignClass(targetId, assetClass);
    setQuickClass('');
  };

  const saveRules = () => {
    setToast({
      title: 'Alignment rules saved',
      message: `${specs.length} specification mappings stored for ${PROJECT_LABEL}.`,
    });
    window.setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="page-section">
      <PresentationNav />
      <section className="page-section">
        <ModusWcTypography
          hierarchy="h1"
          size="2xl"
          weight="semibold"
          label="AM-A02: Define asset class and spec alignment"
        />
        <ModusWcTypography
          hierarchy="p"
          size="md"
          customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
          label="Bind CSI MasterFormat sections to ALCS asset classes so staged equipment inherits the governed schema."
        />
      </section>

      <div hidden={missing.length === 0} aria-hidden={missing.length === 0}>
        {missing.length > 0 ? (
          <ModusWcCard bordered={true} padding="compact">
            <ModusWcAlert
              variant="warning"
              alertTitle="GAP-AM-012: Governed inclusion mapping is incomplete"
              alertDescription="At least one specification has a Rule Missing status. Map it to an ALCS asset class before closeout capture, or inclusion rules will not govern that scope."
            />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <ModusWcSelect
                label="Specification to map"
                size="sm"
                value={quickSpecId}
                options={missingSpecOptions}
                onInputChange={(e: CustomEvent) => setQuickSpecId(readInputString(e))}
              />
              <ModusWcSelect
                label="Quick-action asset class"
                size="sm"
                value={quickClass}
                options={classOptions}
                onInputChange={(e: CustomEvent) => {
                  const next = readInputString(e);
                  setQuickClass(next);
                  applyQuickMap(next);
                }}
              />
            </div>
          </ModusWcCard>
        ) : null}
      </div>

      <ModusWcCard bordered={true} padding="comfortable">
        <div slot="title" className="flex w-full min-w-0 items-center justify-start gap-2">
          <ModusWcIcon name="settings" decorative />
          <ModusWcTypography hierarchy="h2" size="md" weight="semibold" label="Policy controls" />
        </div>
        <ModusWcSelect
          label="Classification scheme"
          size="sm"
          value={scheme}
          options={CLASSIFICATION_OPTIONS}
          onInputChange={(e: CustomEvent) => setScheme(readInputString(e))}
        />
      </ModusWcCard>

      <ModusWcCard bordered={true} padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ModusWcIcon name="list_bulleted" decorative />
            <ModusWcTypography hierarchy="h2" size="md" weight="semibold" label="Specifications" />
          </div>
          <div className="shrink-0">
            <ModusWcBadge size="sm" variant="filled" color="default">
              {`${specs.length} rows`}
            </ModusWcBadge>
          </div>
        </div>
        <div className="min-w-0">
          {tableReady ? (
            <ModusWcTable
              columns={columns}
              data={tableData}
              zebra
              hover
              density="compact"
              caption="CSI specifications and ALCS asset class alignment"
            />
          ) : (
            <ModusWcTypography hierarchy="p" size="sm" label="Loading specifications…" />
          )}
        </div>
      </ModusWcCard>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <ModusWcButton
          variant="outlined"
          color="tertiary"
          size="sm"
          onButtonClick={() => router.push('/')}
        >
          <ModusWcIcon name="chevron_left" size="xs" decorative />
          Return to project setup
        </ModusWcButton>
        <ModusWcButton variant="filled" color="primary" size="sm" onButtonClick={saveRules}>
          <ModusWcIcon name="save_disk" size="xs" decorative />
          Save alignment rules
        </ModusWcButton>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-0 z-[200]" aria-live="polite">
          <ModusWcToast position="bottom-end" customClass="pointer-events-auto">
            <ModusWcAlert variant="success" alertTitle={toast.title} alertDescription={toast.message} />
          </ModusWcToast>
        </div>
      ) : null}
    </div>
  );
}

const PROJECT_LABEL = 'Water Treatment Plant Expansion';
