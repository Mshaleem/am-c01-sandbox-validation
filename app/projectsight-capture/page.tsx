'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ModusWcAlert,
  ModusWcBadge,
  ModusWcBreadcrumbs,
  ModusWcButton,
  ModusWcCard,
  ModusWcFileDropzone,
  ModusWcIcon,
  ModusWcTextInput,
  ModusWcToast,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import { PresentationNav } from '@/components/presentation-nav';
import { readInputString } from '@/lib/modusFormEvents';
import { mockChecklist, mockOcrResult, type OcrHarvestResult } from '@/lib/projectsight-mock';

type HarvestDraft = {
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  designGpm: string;
  headFt: string;
  electricalRating: string;
  confidenceScore: string;
};

function toDraft(result: OcrHarvestResult): HarvestDraft {
  return {
    manufacturer: result.manufacturer,
    modelNumber: result.modelNumber,
    serialNumber: result.serialNumber,
    designGpm: result.designGpm,
    headFt: result.headFt,
    electricalRating: result.electricalRating,
    confidenceScore: `${Math.round(result.confidenceScore * 100)}%`,
  };
}

const STAGED_MESSAGE =
  'Asset candidate PMP-0104 staged successfully to ALCS Sandbox (EP-003 / FR-003).';

export default function ProjectSightCapturePage() {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [harvest, setHarvest] = useState<HarvestDraft>(() => toDraft(mockOcrResult));
  const [toastOpen, setToastOpen] = useState(false);

  const breadcrumbItems = useMemo(
    () => [
      { label: 'Checklists', url: '/projectsight-capture' },
      { label: mockChecklist.checklistId, url: '/projectsight-capture' },
      { label: 'Nameplate capture' },
    ],
    [],
  );

  const capturePhoto = () => {
    setHarvest(toDraft(mockOcrResult));
    setPhotoUploaded(true);
  };

  useEffect(() => {
    if (!toastOpen) return;
    const id = window.setTimeout(() => setToastOpen(false), 5000);
    return () => window.clearTimeout(id);
  }, [toastOpen]);

  const updateField = (key: keyof HarvestDraft) => (e: CustomEvent) => {
    setHarvest((prev) => ({ ...prev, [key]: readInputString(e) }));
  };

  return (
    <div className="page-section">
      <PresentationNav />
      <nav className="capture-subnav" aria-label="Checklist path">
        <ModusWcBreadcrumbs aria-label="Checklists path" size="sm" items={breadcrumbItems} />
        <ModusWcBadge color="default" variant="filled" size="sm">
          {`Assigned: ${mockChecklist.subcontractor}`}
        </ModusWcBadge>
      </nav>

      <section className="page-section">
        <ModusWcTypography
          hierarchy="h1"
          size="2xl"
          weight="semibold"
          label={mockChecklist.title}
        />
        <ModusWcTypography
          hierarchy="p"
          size="md"
          customClass="!m-0 text-[var(--modus-wc-color-base-content-low-contrast)]"
          label={`${mockChecklist.project} · ${mockChecklist.checklistId}`}
        />
      </section>

      <ModusWcCard bordered={true} padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
          <ModusWcIcon name="file" decorative />
          <ModusWcTypography hierarchy="h2" size="md" weight="semibold" label="Checklist details" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MetaItem term="Spec section" value={mockChecklist.specSection} />
          <MetaItem term="Drawing tag" value={mockChecklist.drawingTag} />
          <MetaItem term="Drawing sheet" value={mockChecklist.sheetRef} />
          <MetaItem term="Linked submittal" value={mockChecklist.submittalRef} />
        </div>
      </ModusWcCard>

      <div hidden={!photoUploaded} aria-hidden={!photoUploaded}>
        <ModusWcAlert
          variant="success"
          alertTitle="Asset candidate ready to stage"
          alertDescription="Golden Thread lineage linked to Submittal SUB-042 and Plan Sheet M-102."
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div hidden={photoUploaded} className="min-w-0">
          <ModusWcCard bordered={true} padding="compact">
            <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
              <ModusWcIcon name="camera" decorative />
              <ModusWcTypography hierarchy="h2" size="md" weight="semibold" label="Nameplate photo" />
            </div>
            <div className="flex flex-col gap-3">
              <ModusWcFileDropzone
                acceptFileTypes="image/*"
                instructions="Drag a nameplate photo here or simulate capture"
                fileDraggedOverInstructions="Release to simulate capture"
                invalidFileTypeMessage="Use an image file for nameplate capture."
                onFileSelect={() => capturePhoto()}
              >
                <div slot="dropzone" className="mt-3">
                  <ModusWcButton
                    variant="filled"
                    color="primary"
                    size="sm"
                    onButtonClick={capturePhoto}
                  >
                    <ModusWcIcon name="camera" size="xs" decorative />
                    Simulate nameplate photo capture
                  </ModusWcButton>
                </div>
              </ModusWcFileDropzone>
            </div>
          </ModusWcCard>
        </div>

        <div hidden={!photoUploaded} className="min-w-0 xl:col-span-2">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <div className="min-w-0">
              <ModusWcCard bordered={true} padding="compact">
                <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
                  <ModusWcIcon name="image" decorative />
                  <ModusWcTypography
                    hierarchy="h2"
                    size="md"
                    weight="semibold"
                    label="Captured nameplate"
                  />
                </div>
                <div className="nameplate-preview" aria-label="Simulated nameplate photo">
                  <ModusWcTypography
                    hierarchy="p"
                    size="sm"
                    customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
                    label="Simulated field photo · Mechanical Room B-12"
                  />
                  <div className="nameplate-preview-plate">
                    <ModusWcTypography hierarchy="p" size="sm" weight="semibold" label={harvest.manufacturer} />
                    <ModusWcTypography hierarchy="p" size="sm" label={`Model ${harvest.modelNumber}`} />
                    <ModusWcTypography hierarchy="p" size="sm" label={`S/N ${harvest.serialNumber}`} />
                    <ModusWcTypography
                      hierarchy="p"
                      size="sm"
                      label={`${harvest.designGpm} · ${harvest.headFt}`}
                    />
                    <ModusWcTypography hierarchy="p" size="sm" label={harvest.electricalRating} />
                  </div>
                </div>
              </ModusWcCard>
            </div>

            <div className="min-w-0">
              <ModusWcCard bordered={true} padding="compact">
                <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <ModusWcIcon name="stars" decorative />
                    <ModusWcTypography
                      hierarchy="h2"
                      size="md"
                      weight="semibold"
                      label="ALCS AI nameplate harvest"
                    />
                  </div>
                  <div className="shrink-0">
                    <ModusWcBadge color="success" variant="filled" size="sm">
                      {`Confidence ${harvest.confidenceScore}`}
                    </ModusWcBadge>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <ModusWcTextInput
                    label="Manufacturer"
                    value={harvest.manufacturer}
                    onInputChange={updateField('manufacturer')}
                  />
                  <ModusWcTextInput
                    label="Model number"
                    value={harvest.modelNumber}
                    onInputChange={updateField('modelNumber')}
                  />
                  <ModusWcTextInput
                    label="Serial number"
                    value={harvest.serialNumber}
                    onInputChange={updateField('serialNumber')}
                  />
                  <ModusWcTextInput
                    label="Design GPM"
                    value={harvest.designGpm}
                    onInputChange={updateField('designGpm')}
                  />
                  <ModusWcTextInput
                    label="Confidence score"
                    value={harvest.confidenceScore}
                    onInputChange={updateField('confidenceScore')}
                  />
                </div>
              </ModusWcCard>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <ModusWcButton variant="outlined" color="tertiary" size="sm">
          Save draft
        </ModusWcButton>
        <ModusWcButton
          variant="filled"
          color="primary"
          size="sm"
          disabled={!photoUploaded}
          onButtonClick={() => setToastOpen(true)}
        >
          <ModusWcIcon name="check" size="xs" decorative />
          Submit and stage to ALCS sandbox
        </ModusWcButton>
      </div>

      {toastOpen ? (
        <div className="pointer-events-none fixed inset-0 z-[200]" aria-live="polite">
          <ModusWcToast position="top-end" delay={5000} customClass="pointer-events-auto">
            <ModusWcAlert
              variant="success"
              alertTitle="Staged to ALCS sandbox"
              alertDescription={STAGED_MESSAGE}
            />
          </ModusWcToast>
        </div>
      ) : null}
    </div>
  );
}

function MetaItem({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <ModusWcTypography
        hierarchy="p"
        size="sm"
        customClass="text-[var(--modus-wc-color-base-content-low-contrast)]"
        label={term}
      />
      <ModusWcTypography hierarchy="p" size="md" weight="semibold" label={value} />
    </div>
  );
}
