'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ModusWcAlert,
  ModusWcBadge,
  ModusWcButton,
  ModusWcCard,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTable,
  ModusWcTextInput,
  ModusWcToast,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import {
  mockQueueSummary,
  mockValidationCandidates,
  type ValidationCandidate,
} from '@/lib/validation-dashboard-mock';
import { readInputString } from '@/lib/modusFormEvents';
import { PresentationNav } from '@/components/presentation-nav';

type ToastVariant = 'success' | 'warning' | 'info';

type ToastState = {
  variant: ToastVariant;
  title: string;
  message: string;
};

type QueueStats = {
  totalStaged: number;
  blockerErrors: number;
  warnings: number;
  handoverReady: number;
};

type ResolutionField =
  | {
      kind: 'text';
      label: string;
      placeholder: string;
      suggested: string;
      helper: string;
    }
  | {
      kind: 'select';
      label: string;
      options: { label: string; value: string }[];
      suggested: string;
      helper: string;
    };

type StatusColor = 'danger' | 'warning' | 'success';

const ERROR_TYPE_OPTIONS = [
  { label: 'All error types', value: '' },
  { label: 'Schema Domain', value: 'Schema Domain' },
  { label: 'Lineage Gap', value: 'Lineage Gap' },
  { label: 'Spec Alignment', value: 'Spec Alignment' },
  { label: 'Regex Format', value: 'Regex Format' },
];

const SEVERITY_OPTIONS = [
  { label: 'All severities', value: '' },
  { label: 'Blocker', value: 'blocker' },
  { label: 'Warning', value: 'warning' },
  { label: 'Clean', value: 'clean' },
];

function cloneCandidates(): ValidationCandidate[] {
  return mockValidationCandidates.map((row) => ({ ...row }));
}

function matchesErrorType(candidate: ValidationCandidate, filter: string): boolean {
  if (!filter) return true;
  if (filter === 'Regex Format') {
    return candidate.errorType === 'Tag Format Regex';
  }
  return candidate.errorType === filter;
}

function statusMeta(candidate: ValidationCandidate): { color: StatusColor; label: string } {
  if (candidate.severity === 'blocker' || candidate.status === 'alert') {
    return { color: 'danger', label: 'Blocker' };
  }
  if (candidate.severity === 'warning' || candidate.status === 'warn') {
    return { color: 'warning', label: 'Warning' };
  }
  return { color: 'success', label: 'Validated' };
}

function createStatusBadge(candidate: ValidationCandidate) {
  const meta = statusMeta(candidate);
  const badge = document.createElement('modus-wc-badge');
  badge.setAttribute('size', 'sm');
  badge.setAttribute('variant', 'filled');
  badge.setAttribute('color', meta.color);
  badge.textContent = meta.label;
  return badge;
}

function resolutionFor(candidate: ValidationCandidate): ResolutionField | null {
  switch (candidate.id) {
    case '1':
      return {
        kind: 'text',
        label: 'Serial number',
        placeholder: 'BG-2026-981120',
        suggested: 'BG-2026-981120',
        helper: 'Enter the verified nameplate serial to close the lineage gap.',
      };
    case '2':
      return {
        kind: 'select',
        label: 'Fluid type',
        options: [
          { label: 'Water', value: 'Water' },
          { label: 'Propylene Glycol', value: 'Propylene Glycol' },
          { label: 'Chilled Water', value: 'Chilled Water' },
        ],
        suggested: 'Water',
        helper: "Replace 'Glycol Solution' with a value from the ArcGIS domain picklist.",
      };
    case '3':
      return {
        kind: 'select',
        label: 'Spec alignment action',
        options: [
          { label: 'Accept GAP-AM-012 with documented exception', value: 'accept-gap' },
          { label: 'Re-align to Spec Section 23 09 23', value: 'realign' },
        ],
        suggested: 'accept-gap',
        helper: 'Close the missing rule for Spec Section 23 09 23.',
      };
    case '4':
      return {
        kind: 'text',
        label: 'Corrected asset tag',
        placeholder: 'VLV-0201',
        suggested: 'VLV-0201',
        helper: 'Update V-201 to the project naming convention ^VLV-\\d{4}$.',
      };
    default:
      return null;
  }
}

function applyResolvedFields(
  candidate: ValidationCandidate,
  correction: string,
): ValidationCandidate {
  const next: ValidationCandidate = {
    ...candidate,
    errorType: 'Validated',
    severity: 'clean',
    status: 'ok',
    issueDescription: `Record complete. Correction applied: ${correction}. All required attributes and Golden Key lineage verified.`,
  };

  if (candidate.id === '4') {
    next.assetTag = correction.trim() || 'VLV-0201';
  }

  return next;
}

function checklistLabel(value?: string): string {
  const id = value?.match(/CK-\d+/)?.[0];
  return id ? `ProjectSight Checklist #${id}` : (value ?? 'Checklist not recorded');
}

function submittalLabel(value?: string): string {
  const id = value?.match(/SUB-\d+/)?.[0];
  return id ? `Submittal ${id}` : (value ?? 'Submittal not recorded');
}

function spatialLabel(value?: string): string {
  return value?.replace(/[()]/g, '').replace(/\s+/g, ' ').trim() || 'Spatial anchor not recorded';
}

function readSelectedId(detail: unknown): string | null {
  if (!detail || typeof detail !== 'object') return null;
  const rec = detail as {
    selectedRowIds?: string[];
    selectedRows?: Array<{ id?: unknown }>;
    row?: { id?: unknown };
  };
  if (rec.selectedRowIds?.[0]) return String(rec.selectedRowIds[0]);
  if (rec.selectedRows?.[0]?.id != null) return String(rec.selectedRows[0].id);
  if (rec.row?.id != null) return String(rec.row.id);
  return null;
}

function StatCard({
  icon,
  title,
  value,
  badge,
  badgeColor,
  valueClass,
}: {
  icon: string;
  title: string;
  value: number;
  badge: string;
  badgeColor: 'default' | 'danger' | 'warning' | 'success';
  valueClass?: string;
}) {
  return (
    <ModusWcCard bordered={true} padding="compact" customClass="h-full w-full min-w-0">
      <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
        <ModusWcIcon name={icon} decorative />
        <ModusWcTypography hierarchy="h2" size="md" weight="semibold" label={title} />
      </div>
      <div className="flex items-end justify-between gap-3">
        <ModusWcTypography
          hierarchy="p"
          size="2xl"
          weight="semibold"
          customClass={valueClass ? `!m-0 ${valueClass}` : '!m-0'}
          label={String(value)}
        />
        <ModusWcBadge size="sm" variant="filled" color={badgeColor}>
          {badge}
        </ModusWcBadge>
      </div>
    </ModusWcCard>
  );
}

export default function SandboxValidationPage() {
  const [candidates, setCandidates] = useState<ValidationCandidate[]>(cloneCandidates);
  const [stats, setStats] = useState<QueueStats>({ ...mockQueueSummary });
  const [search, setSearch] = useState('');
  const [errorType, setErrorType] = useState('');
  const [severity, setSeverity] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correction, setCorrection] = useState('');
  const [tableReady, setTableReady] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

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

  useEffect(() => {
    const id = requestAnimationFrame(() => setTableReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const selected = useMemo(
    () => candidates.find((row) => row.id === selectedId) ?? null,
    [candidates, selectedId],
  );

  const resolution = selected ? resolutionFor(selected) : null;

  useEffect(() => {
    const current = mockValidationCandidates.find((row) => row.id === selectedId);
    const field = current ? resolutionFor(current) : null;
    setCorrection(field?.suggested ?? '');
  }, [selectedId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return candidates.filter((row) => {
      const matchesSearch = !query || row.assetTag.toLowerCase().includes(query);
      const matchesType = matchesErrorType(row, errorType);
      const matchesSeverity = !severity || row.severity === severity;
      return matchesSearch && matchesType && matchesSeverity;
    });
  }, [candidates, search, errorType, severity]);

  const columns = useMemo(
    () => [
      { id: 'assetTag', accessor: 'assetTag', header: 'Asset Tag' },
      { id: 'assetClass', accessor: 'assetClass', header: 'Asset Class' },
      { id: 'errorType', accessor: 'errorType', header: 'Error Type' },
      { id: 'issueDescription', accessor: 'issueDescription', header: 'Issue Description' },
      { id: 'goldenKey', accessor: 'goldenKey', header: 'Golden Key ID' },
      {
        id: 'status',
        accessor: 'status',
        header: 'Status',
        cellRenderer: (_value: unknown, row: unknown) =>
          createStatusBadge(row as ValidationCandidate),
      },
    ],
    [],
  );

  const tableData = useMemo(() => filtered.map((row) => ({ ...row })), [filtered]);

  const handleRowSelectionChange = (e: CustomEvent) => {
    setSelectedId(readSelectedId(e.detail));
  };

  const handleRowClick = (e: CustomEvent) => {
    const id = readSelectedId(e.detail);
    if (id) setSelectedId(id);
  };

  const applyCorrection = () => {
    if (!selected || selected.severity === 'clean') return;
    const value = correction.trim();
    if (!value) {
      showToast({
        variant: 'warning',
        title: 'Correction required',
        message: `Enter a value to resolve ${selected.assetTag} before applying the correction.`,
      });
      return;
    }

    const previousSeverity = selected.severity;
    setCandidates((prev) =>
      prev.map((row) => (row.id === selected.id ? applyResolvedFields(row, value) : row)),
    );
    setStats((prev) => ({
      ...prev,
      blockerErrors:
        previousSeverity === 'blocker' ? Math.max(0, prev.blockerErrors - 1) : prev.blockerErrors,
      warnings: previousSeverity === 'warning' ? Math.max(0, prev.warnings - 1) : prev.warnings,
      handoverReady: prev.handoverReady + 1,
    }));
    showToast({
      variant: 'success',
      title: 'Error resolved',
      message: `${selected.assetTag} is now Validated. The sandbox queue counts were updated.`,
    });
  };

  const exportAudit = () => {
    showToast({
      variant: 'info',
      title: 'Audit report exported',
      message: `Sandbox validation report prepared for ${stats.totalStaged} staged candidates.`,
    });
  };

  const saveCorrections = () => {
    showToast({
      variant: 'success',
      title: 'Corrections saved',
      message: 'Sandbox corrections were saved to the staged ALCS queue.',
    });
  };

  const authorizeHandover = () => {
    if (stats.blockerErrors > 0) {
      showToast({
        variant: 'warning',
        title: 'Handover blocked',
        message: `Cannot execute handover push: ${stats.blockerErrors} blocker errors remain in the sandbox queue.`,
      });
      return;
    }
    showToast({
      variant: 'success',
      title: 'Handover authorized',
      message: 'Authorize Handover Push (F-06) can proceed. The sandbox queue has no blocker errors.',
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
          label="AM-C01: Review and resolve sandbox validation errors"
        />
        <ModusWcTypography
          hierarchy="p"
          size="md"
          customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
          label="Inspect staged ALCS candidates, correct blocker and warning errors, then authorize the F-06 handover push."
        />
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="package"
          title="Total staged candidates"
          value={stats.totalStaged}
          badge="Queue"
          badgeColor="default"
        />
        <StatCard
          icon="warning"
          title="Blocker errors"
          value={stats.blockerErrors}
          badge="Blocker"
          badgeColor="danger"
          valueClass="stat-card-value-danger"
        />
        <StatCard
          icon="alert"
          title="Warnings"
          value={stats.warnings}
          badge="Warning"
          badgeColor="warning"
          valueClass="stat-card-value-warning"
        />
        <StatCard
          icon="check_circle"
          title="Handover ready"
          value={stats.handoverReady}
          badge="Ready"
          badgeColor="success"
          valueClass="stat-card-value-success"
        />
      </div>

      <ModusWcCard bordered={true} padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
          <ModusWcIcon name="filter" decorative />
          <ModusWcTypography
            hierarchy="h2"
            size="md"
            weight="semibold"
            label="Filter and search"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ModusWcTextInput
            label="Asset tag"
            size="sm"
            includeSearch
            includeClear
            placeholder="Search asset tags"
            value={search}
            onInputChange={(e: CustomEvent) => setSearch(readInputString(e))}
            onClearClick={() => setSearch('')}
          />
          <ModusWcSelect
            label="Error type"
            size="sm"
            value={errorType}
            options={ERROR_TYPE_OPTIONS}
            onInputChange={(e: CustomEvent) => setErrorType(readInputString(e))}
          />
          <ModusWcSelect
            label="Error severity"
            size="sm"
            value={severity}
            options={SEVERITY_OPTIONS}
            onInputChange={(e: CustomEvent) => setSeverity(readInputString(e))}
          />
        </div>
      </ModusWcCard>

      <ModusWcCard bordered={true} padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ModusWcIcon name="table" decorative />
            <ModusWcTypography
              hierarchy="h2"
              size="md"
              weight="semibold"
              label="Validation queue"
            />
          </div>
          <div className="shrink-0">
            <ModusWcBadge size="sm" variant="filled" color="default">
              {filtered.length} shown
            </ModusWcBadge>
          </div>
        </div>
        <div hidden={filtered.length === 0} className="min-w-0">
          {tableReady ? (
            <ModusWcTable
              columns={columns}
              data={tableData}
              zebra
              hover
              density="compact"
              sortable={false}
              selectable="single"
              selectedRowIds={selectedId ? [selectedId] : []}
              caption="Sandbox validation candidates with asset tag, class, error type, issue, golden key, and status"
              onRowSelectionChange={handleRowSelectionChange}
              onRowClick={handleRowClick}
            />
          ) : (
            <ModusWcTypography hierarchy="p" size="sm" label="Loading validation queue…" />
          )}
        </div>
        <div hidden={filtered.length > 0}>
          <ModusWcTypography
            hierarchy="p"
            size="md"
            customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
            label="No candidates match the current filters."
          />
        </div>
      </ModusWcCard>

      <ModusWcCard bordered={true} padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <ModusWcIcon name="clipboard" decorative />
            <ModusWcTypography
              hierarchy="h2"
              size="md"
              weight="semibold"
              label={
                selected
                  ? `Resolution drawer · ${selected.assetTag}`
                  : 'Resolution drawer'
              }
            />
          </div>
          <div className="shrink-0">
            <ModusWcBadge
              size="sm"
              variant="filled"
              color={selected ? statusMeta(selected).color : 'default'}
            >
              {selected ? statusMeta(selected).label : 'Select a row'}
            </ModusWcBadge>
          </div>
        </div>

        <div hidden={Boolean(selected)}>
          <div className="flex flex-col gap-1">
            <ModusWcTypography
              hierarchy="p"
              size="md"
              customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
              label="Select a candidate row in the validation queue to inspect source lineage and apply a correction."
            />
          </div>
        </div>

        <div hidden={!selected}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <ModusWcTypography
                hierarchy="h3"
                size="sm"
                weight="semibold"
                label="Source document lineage"
              />
              <ModusWcTypography
                hierarchy="p"
                size="md"
                label={
                  selected
                    ? `${checklistLabel(selected.sourceChecklist)} · ${submittalLabel(selected.sourceSubmittal)} · ${spatialLabel(selected.spatialAnchor)}`
                    : 'Lineage unavailable'
                }
              />
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                label={
                  selected
                    ? `${selected.sourceChecklist ?? ''} · ${selected.sourceSubmittal ?? ''} · Golden Key ${selected.goldenKey}`
                    : ''
                }
              />
            </div>

            <div hidden={!selected || selected.severity === 'clean'}>
              <div className="flex flex-col gap-4">
                <ModusWcTypography
                  hierarchy="p"
                  size="md"
                  label={selected?.issueDescription ?? ''}
                />
                <div hidden={resolution?.kind !== 'text'}>
                  <ModusWcTextInput
                    label={resolution?.kind === 'text' ? resolution.label : 'Correction'}
                    size="sm"
                    placeholder={resolution?.kind === 'text' ? resolution.placeholder : ''}
                    value={correction}
                    onInputChange={(e: CustomEvent) => setCorrection(readInputString(e))}
                  />
                </div>
                <div hidden={resolution?.kind !== 'select'}>
                  <ModusWcSelect
                    label={resolution?.kind === 'select' ? resolution.label : 'Correction'}
                    size="sm"
                    value={correction}
                    options={resolution?.kind === 'select' ? resolution.options : []}
                    onInputChange={(e: CustomEvent) => setCorrection(readInputString(e))}
                  />
                </div>
                <ModusWcTypography
                  hierarchy="p"
                  size="sm"
                  customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                  label={resolution?.helper ?? ''}
                />
                <div className="flex justify-end">
                  <ModusWcButton
                    variant="filled"
                    color="primary"
                    size="sm"
                    onButtonClick={applyCorrection}
                  >
                    <ModusWcIcon name="check_circle" size="xs" decorative />
                    Apply Correction & Resolve Error
                  </ModusWcButton>
                </div>
              </div>
            </div>

            <div hidden={!selected || selected.severity !== 'clean'}>
              <div className="flex flex-col gap-1">
                <ModusWcTypography
                  hierarchy="p"
                  size="md"
                  label={selected?.issueDescription ?? ''}
                />
                <ModusWcTypography
                  hierarchy="p"
                  size="sm"
                  customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
                  label="This candidate is Validated and ready for handover."
                />
              </div>
            </div>
          </div>
        </div>
      </ModusWcCard>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <ModusWcButton variant="outlined" color="tertiary" size="sm" onButtonClick={exportAudit}>
          <ModusWcIcon name="export" size="xs" decorative />
          Export Audit Report
        </ModusWcButton>
        <ModusWcButton variant="outlined" color="tertiary" size="sm" onButtonClick={saveCorrections}>
          <ModusWcIcon name="save_disk" size="xs" decorative />
          Save Corrections
        </ModusWcButton>
        <ModusWcButton
          variant="filled"
          color="primary"
          size="sm"
          onButtonClick={authorizeHandover}
        >
          <ModusWcIcon name="launch" size="xs" decorative />
          Authorize Handover Push (F-06)
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
