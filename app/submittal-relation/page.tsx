'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ModusWcAlert,
  ModusWcBadge,
  ModusWcButton,
  ModusWcCard,
  ModusWcCheckbox,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTable,
  ModusWcToast,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import {
  mockExtractedAttributes,
  mockSubmittal,
  targetCandidates,
  type ExtractedAttribute,
} from '@/lib/submittal-mock';
import { readInputChecked, readInputString } from '@/lib/modusFormEvents';
import { PresentationNav } from '@/components/presentation-nav';

type ToastState = {
  variant: 'success' | 'warning' | 'info';
  title: string;
  message: string;
};

type EditableAttribute = ExtractedAttribute & { id: string };

function cloneAttributes(): EditableAttribute[] {
  return mockExtractedAttributes.map((row) => ({
    ...row,
    id: row.field,
  }));
}

function confidenceColor(status: ExtractedAttribute['status']): 'success' | 'warning' | 'danger' {
  if (status === 'high') return 'success';
  if (status === 'medium') return 'warning';
  return 'danger';
}

function createConfidenceBadge(row: EditableAttribute) {
  const badge = document.createElement('modus-wc-badge');
  badge.setAttribute('size', 'sm');
  badge.setAttribute('variant', 'filled');
  badge.setAttribute('color', confidenceColor(row.status));
  badge.textContent = `${row.confidence}% ${row.status}`;
  return badge;
}

function createValueInput(
  row: EditableAttribute,
  onChange: (field: string, value: string) => void,
) {
  const input = document.createElement('modus-wc-text-input');
  input.size = 'sm';
  input.value = row.value;
  input.setAttribute('aria-label', `Edit ${row.field.replace(/_/g, ' ')}`);
  input.addEventListener('inputChange', (event) => {
    onChange(row.field, readInputString(event as CustomEvent));
  });
  return input;
}

export default function SubmittalRelationPage() {
  const [selectedCandidate, setSelectedCandidate] = useState(targetCandidates[0].id);
  const [attributes, setAttributes] = useState<EditableAttribute[]>(cloneAttributes);
  const [applyToSection, setApplyToSection] = useState(false);
  const [tableReady, setTableReady] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const updateValueRef = useRef<(field: string, value: string) => void>(() => undefined);

  const showToast = useCallback((next: ToastState) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = window.setTimeout(() => setToast(null), 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const updateValue = useCallback((field: string, value: string) => {
    setAttributes((prev) =>
      prev.map((row) => (row.field === field ? { ...row, value } : row)),
    );
  }, []);

  updateValueRef.current = updateValue;

  useEffect(() => {
    const id = requestAnimationFrame(() => setTableReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const candidateOptions = useMemo(
    () => targetCandidates.map((item) => ({ label: item.text, value: item.id })),
    [],
  );

  const columns = useMemo(
    () => [
      { id: 'field', accessor: 'field', header: 'Field' },
      {
        id: 'value',
        accessor: 'value',
        header: 'Extracted value',
        cellRenderer: (_value: unknown, row: unknown) =>
          createValueInput(row as EditableAttribute, (field, value) =>
            updateValueRef.current(field, value),
          ),
      },
      {
        id: 'confidence',
        accessor: 'confidence',
        header: 'Confidence',
        cellRenderer: (_value: unknown, row: unknown) =>
          createConfidenceBadge(row as EditableAttribute),
      },
    ],
    [],
  );

  const tableData = useMemo(() => attributes.map((row) => ({ ...row })), [attributes]);

  const selectedLabel =
    targetCandidates.find((item) => item.id === selectedCandidate)?.text ?? selectedCandidate;

  const rerunExtraction = () => {
    setAttributes(cloneAttributes());
    setRejected(false);
    showToast({
      variant: 'info',
      title: 'Extraction refreshed',
      message: `AI values were restored from ${mockSubmittal.fileName}. Review them before enriching.`,
    });
  };

  const rejectRelation = () => {
    setRejected(true);
    showToast({
      variant: 'warning',
      title: 'Relation rejected',
      message: `${mockSubmittal.id} was not written to ${selectedCandidate}. Re-run extraction if you need to try again.`,
    });
  };

  const enrichAsset = () => {
    const scope = applyToSection
      ? `all matched candidates in spec section 23 21 23`
      : selectedCandidate;
    showToast({
      variant: 'success',
      title: 'Asset candidate enriched successfully and Golden Thread document lineage established!',
      message: `${mockSubmittal.id} attributes were applied to ${scope}.`,
    });
  };

  return (
    <div className="page-section">
      <PresentationNav />
      <section className="page-section">
        <ModusWcTypography
          hierarchy="h1"
          size="2xl"
          weight="semibold"
          label="AM-B02: Submittal auto-relation and enrichment"
        />
        <ModusWcTypography
          hierarchy="p"
          size="md"
          customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
          label="Review the approved ProjectSight O&M manual, refine AI-extracted attributes, and write them to the staged asset candidate."
        />
      </section>

      <ModusWcCard bordered={true} padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ModusWcIcon name="link" decorative />
            <ModusWcTypography
              hierarchy="h2"
              size="md"
              weight="semibold"
              label="ProjectSight submittal context"
            />
          </div>
          <div className="shrink-0">
            <ModusWcBadge size="sm" variant="filled" color="success">
              {mockSubmittal.projectSightStatus}
            </ModusWcBadge>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <ModusWcTypography
            hierarchy="p"
            size="md"
            weight="semibold"
            label={`${mockSubmittal.id} · Rev ${mockSubmittal.revision} · ${mockSubmittal.title}`}
          />
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
            label={`Spec section ${mockSubmittal.specSection}`}
          />
        </div>
      </ModusWcCard>

      <div className="relation-split">
        <div className="relation-split-col">
          <ModusWcCard
            bordered={true}
            padding="compact"
            className="flex h-full min-h-0 w-full flex-col"
            customClass="box-border flex h-full min-h-0 w-full flex-col"
          >
            <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <ModusWcIcon name="file_type_pdf" decorative />
                <ModusWcTypography hierarchy="h2" size="md" weight="semibold" label="PDF preview" />
              </div>
              <div className="shrink-0">
                <ModusWcBadge size="sm" variant="filled" color="default">
                  {mockSubmittal.fileSize}
                </ModusWcBadge>
              </div>
            </div>
            <div className="pdf-preview-shell">
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                label={mockSubmittal.fileName}
              />
              <div
                className="pdf-preview-page"
                role="img"
                aria-label={`${mockSubmittal.fileName} cover page. Bell and Gossett Series e-1510 technical specifications.`}
              >
                <div className="pump-schematic" aria-hidden="true">
                  <div className="pump-row">
                    <div className="pump-motor" />
                    <div className="pump-shaft" />
                    <div className="pump-volute">
                      <div className="pump-impeller" />
                    </div>
                    <div className="pump-discharge" />
                  </div>
                  <div className="pump-base" />
                </div>
                <div className="catalog-copy">
                  <ModusWcTypography
                    hierarchy="p"
                    size="lg"
                    weight="semibold"
                    label="Bell & Gossett / Series e-1510 / Technical Specifications"
                  />
                  <ModusWcTypography
                    hierarchy="p"
                    size="sm"
                    customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                    label="Base-mounted centrifugal pump catalog cover"
                  />
                </div>
              </div>
            </div>
          </ModusWcCard>
        </div>

        <div className="relation-split-col">
          <ModusWcCard
            bordered={true}
            padding="compact"
            className="flex h-full min-h-0 w-full flex-col"
            customClass="box-border flex h-full min-h-0 w-full flex-col"
          >
            <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
              <ModusWcIcon name="settings" decorative />
              <ModusWcTypography hierarchy="h2" size="md" weight="semibold" label="AI extraction" />
            </div>
            <div className="flex flex-col gap-4">
              <ModusWcSelect
                label="Staged asset candidate"
                size="sm"
                value={selectedCandidate}
                options={candidateOptions}
                onInputChange={(e: CustomEvent) => setSelectedCandidate(readInputString(e))}
              />
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                label={`Refine extracted values for ${selectedLabel} before confirming enrichment.`}
              />
              <div className="min-w-0">
                {tableReady ? (
                  <ModusWcTable
                    columns={columns}
                    data={tableData}
                    zebra
                    hover
                    density="compact"
                    sortable={false}
                    caption="AI-extracted submittal attributes, values, and confidence"
                  />
                ) : (
                  <ModusWcTypography hierarchy="p" size="sm" label="Loading extracted attributes…" />
                )}
              </div>
              <ModusWcCheckbox
                size="sm"
                label="Apply these values to all matched candidates in spec section 23 21 23"
                value={applyToSection}
                onInputChange={(e: CustomEvent) => setApplyToSection(readInputChecked(e))}
              />
            </div>
          </ModusWcCard>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <ModusWcButton variant="outlined" color="tertiary" size="sm" onButtonClick={rerunExtraction}>
          <ModusWcIcon name="refresh" size="xs" decorative />
          Re-run AI extraction
        </ModusWcButton>
        <ModusWcButton variant="outlined" color="tertiary" size="sm" onButtonClick={rejectRelation}>
          <ModusWcIcon name="close" size="xs" decorative />
          Reject relation
        </ModusWcButton>
        <ModusWcButton
          variant="filled"
          color="primary"
          size="sm"
          disabled={rejected}
          onButtonClick={enrichAsset}
        >
          <ModusWcIcon name="check_circle" size="xs" decorative />
          Enrich staged asset
        </ModusWcButton>
      </div>

      {toast ? (
        <div
          className="pointer-events-none fixed inset-0 z-[200]"
          aria-live={toast.variant === 'warning' ? 'assertive' : 'polite'}
        >
          <ModusWcToast position="bottom-end" customClass="pointer-events-auto">
            <ModusWcAlert
              variant={toast.variant}
              alertTitle={toast.title}
              alertDescription={toast.message}
            />
          </ModusWcToast>
        </div>
      ) : null}
    </div>
  );
}
