import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  DatabaseBackup,
  RefreshCw,
  ShieldAlert,
  Trash2,
  UploadCloud,
  X,
  XCircle
} from 'lucide-react';
import type { CmsAllowedTable } from '../context/dbAdapter';
import type { CmsDraftItem, CmsAction } from '../context/cmsDraftStore';
import {
  CmsConflictResolution,
  CmsPostPublishSyncPayload,
  CmsPublishItemResult,
  CmsPublishOptions,
  CmsPublishProgress,
  CmsPublishSummary,
  detectSensitiveChanges,
  publishCmsDrafts,
  resolveCmsPublishConflict
} from '../context/cmsPublish';

export interface CmsPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: CmsDraftItem[];
  currentSiteSettings?: Record<string, unknown> | null;
  isBn?: boolean;
  publishOptions?: Omit<CmsPublishOptions, 'confirmSensitive' | 'currentSiteSettings' | 'onProgress'>;
  onDraftsChanged?: () => void;
  onKeepRemoteRow?: (table: CmsAllowedTable, row: Record<string, unknown> | null) => void;
  onPostPublishSync?: (data: CmsPostPublishSyncPayload) => void | Promise<void>;
}

const TABLE_ORDER: CmsAllowedTable[] = [
  'campaigns',
  'programs',
  'homepage_config',
  'site_settings'
];

const TABLE_LABELS: Record<CmsAllowedTable, { bn: string; en: string }> = {
  campaigns: { bn: 'ক্যাম্পেইন', en: 'Campaigns' },
  programs: { bn: 'প্রোগ্রাম', en: 'Programs' },
  homepage_config: { bn: 'হোমপেজ', en: 'Homepage' },
  site_settings: { bn: 'সাইট সেটিংস', en: 'Site Settings' }
};

const ACTION_BADGES: Record<
  CmsAction,
  { bn: string; en: string; className: string }
> = {
  CREATE: {
    bn: 'নতুন',
    en: 'New',
    className: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  UPDATE: {
    bn: 'সম্পাদনা',
    en: 'Edit',
    className: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  DELETE: {
    bn: 'মোছা',
    en: 'Delete',
    className: 'bg-red-100 text-red-900 border-red-300'
  }
};

function toBnDigits(value: number): string {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(value).replace(/\d/g, (d) => map[Number(d)] ?? d);
}

const CmsPublishModalContent: React.FC<CmsPublishModalProps> = ({
  onClose,
  drafts,
  currentSiteSettings,
  isBn = true,
  publishOptions,
  onDraftsChanged,
  onKeepRemoteRow,
  onPostPublishSync
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [sensitiveConfirmed, setSensitiveConfirmed] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState<CmsPublishProgress | null>(null);
  const [summary, setSummary] = useState<CmsPublishSummary | null>(null);
  const [resolvingDraftId, setResolvingDraftId] = useState<string | null>(null);
  const [resolutionNotice, setResolutionNotice] = useState<string | null>(null);

  const hasDeleteDrafts = useMemo(
    () => drafts.some((d) => d.action === 'DELETE'),
    [drafts]
  );

  const sensitiveChanges = useMemo(
    () => detectSensitiveChanges(drafts, currentSiteSettings),
    [drafts, currentSiteSettings]
  );

  const groupedDrafts = useMemo(() => {
    const groups: Array<{ table: CmsAllowedTable; items: CmsDraftItem[] }> = [];
    for (const table of TABLE_ORDER) {
      const items = drafts.filter((d) => d.table === table);
      if (items.length > 0) {
        groups.push({ table, items });
      }
    }
    return groups;
  }, [drafts]);

  const draftById = useMemo(() => {
    const map = new Map<string, CmsDraftItem>();
    for (const d of drafts) map.set(d.draftId, d);
    return map;
  }, [drafts]);

  const canStartPublish =
    drafts.length > 0 &&
    !isPublishing &&
    (!hasDeleteDrafts || deleteConfirmed) &&
    (sensitiveChanges.length === 0 || sensitiveConfirmed);

  // Focus trap, body scroll lock, Escape handling, and focus restoration
  useEffect(() => {
    previousFocusRef.current =
      typeof document !== 'undefined'
        ? (document.activeElement as HTMLElement | null)
        : null;

    const originalOverflow =
      typeof document !== 'undefined' ? document.body.style.overflow : '';
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    const focusableSelectors =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!isPublishing) {
          onClose();
        }
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

        if (focusable.length === 0) return;

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else if (
          document.activeElement === lastEl ||
          !modalRef.current.contains(document.activeElement)
        ) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = originalOverflow;
      }
      window.removeEventListener('keydown', handleKeyDown);
      if (
        previousFocusRef.current &&
        typeof previousFocusRef.current.focus === 'function'
      ) {
        previousFocusRef.current.focus();
      }
    };
  }, [isPublishing, onClose]);

  const handlePublish = async () => {
    if (!canStartPublish) return;
    setIsPublishing(true);
    setSummary(null);
    setResolutionNotice(null);
    setProgress({ current: 0, total: drafts.length, draft: drafts[0] });

    try {
      const result = await publishCmsDrafts(drafts, {
        ...publishOptions,
        confirmSensitive: sensitiveChanges.length === 0 ? true : sensitiveConfirmed,
        currentSiteSettings,
        onPostPublishSync: async (data) => {
          await publishOptions?.onPostPublishSync?.(data);
          await onPostPublishSync?.(data);
        },
        onProgress: (p) => {
          setProgress(p);
        }
      });
      setSummary(result);
      onDraftsChanged?.();
    } finally {
      setIsPublishing(false);
    }
  };

  const handleConflictAction = async (
    itemResult: CmsPublishItemResult,
    resolution: CmsConflictResolution
  ) => {
    const draft = draftById.get(itemResult.draftId);
    if (!draft) return;

    setResolvingDraftId(itemResult.draftId);
    setResolutionNotice(null);

    try {
      const res = await resolveCmsPublishConflict(
        draft,
        resolution,
        itemResult.currentUpdatedAt,
        {
          customRestFetcher: publishOptions?.customRestFetcher ?? publishOptions?.backupOptions?.customFetcher,
          onKeepRemoteRow,
          onPostPublishSync: async (data) => {
            await publishOptions?.onPostPublishSync?.(data);
            await onPostPublishSync?.(data);
          }
        }
      );

      setSummary((prev) => {
        if (!prev) return prev;
        const nextResults = prev.results.map((r) => {
          if (r.draftId !== itemResult.draftId) return r;
          if (res.status === 'SUCCESS') {
            return {
              ...r,
              status: 'SUCCESS' as const,
              success: true,
              error: undefined,
              publishedUpdatedAt: res.publishedUpdatedAt
            };
          }
          if (res.status === 'SKIPPED') {
            return {
              ...r,
              status: 'SKIPPED' as const,
              success: false,
              error: isBn
                ? 'খসড়াটি এড়িয়ে যাওয়া হয়েছে (স্থানীয় খসড়া সংরক্ষিত আছে)।'
                : 'Skipped (local draft preserved).'
            };
          }
          return {
            ...r,
            status: res.status,
            success: false,
            error: res.error,
            currentUpdatedAt: res.currentUpdatedAt ?? r.currentUpdatedAt
          };
        });

        const succeeded = nextResults.filter((r) => r.status === 'SUCCESS').length;
        const skipped = nextResults.filter((r) => r.status === 'SKIPPED').length;
        const failed = nextResults.length - succeeded - skipped;

        return {
          ...prev,
          succeeded,
          failed,
          skipped,
          results: nextResults
        };
      });

      if (res.status === 'SUCCESS') {
        setResolutionNotice(
          isBn
            ? `${itemResult.summary} — সফলভাবে সমাধান করা হয়েছে।`
            : `${itemResult.summary} — resolved successfully.`
        );
      } else if (res.status === 'SKIPPED') {
        setResolutionNotice(
          isBn
            ? `${itemResult.summary} — এড়িয়ে যাওয়া হয়েছে।`
            : `${itemResult.summary} — skipped.`
        );
      } else if (res.error) {
        setResolutionNotice(res.error);
      }

      onDraftsChanged?.();
    } finally {
      setResolvingDraftId(null);
    }
  };

  const countDisplay = isBn ? toBnDigits(drafts.length) : String(drafts.length);
  const progressText = progress
    ? isBn
      ? `প্রকাশ হচ্ছে... (${toBnDigits(progress.current)}/${toBnDigits(progress.total)})`
      : `Publishing... (${progress.current}/${progress.total})`
    : isBn
      ? 'প্রকাশ হচ্ছে...'
      : 'Publishing...';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cms-publish-modal-title"
      onClick={() => {
        if (!isPublishing) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white text-slate-900 rounded-3xl shadow-2xl border border-[#EAE3D9] overflow-hidden outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="cms-publish-modal-title"
                className="text-lg sm:text-xl font-bold text-slate-900 leading-snug"
              >
                {summary
                  ? isBn
                    ? 'প্রকাশের ফলাফল সারসংক্ষেপ'
                    : 'Publish Summary'
                  : isBn
                    ? `মোট ${countDisplay} টি অপ্রকাশিত পরিবর্তন`
                    : `Total ${countDisplay} Unpublished Changes`}
              </h2>
              <p className="text-sm text-slate-700 mt-0.5">
                {summary
                  ? isBn
                    ? `মোট ${toBnDigits(summary.total)}টির মধ্যে ${toBnDigits(summary.succeeded)}টি সফল, ${toBnDigits(summary.failed)}টি ব্যর্থ`
                    : `${summary.succeeded} of ${summary.total} succeeded, ${summary.failed} failed`
                  : isBn
                    ? 'প্রকাশের আগে স্বয়ংক্রিয় ব্যাকআপ ডাউনলোড হবে (CREATE → UPDATE → DELETE ক্রমে)।'
                    : 'An automatic backup downloads before publishing (CREATE → UPDATE → DELETE).'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isPublishing) onClose();
            }}
            disabled={isPublishing}
            aria-label={isBn ? 'মডাল বন্ধ করুন' : 'Close modal'}
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white text-slate-900">
          {/* Publishing Progress Banner */}
          {isPublishing && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl border border-blue-300 bg-blue-50 p-4 flex items-center gap-3 text-blue-950"
            >
              <RefreshCw className="w-5 h-5 animate-spin shrink-0 text-blue-800" aria-hidden="true" />
              <div className="text-sm font-semibold">
                <p>{progressText}</p>
                {progress?.draft?.summary && (
                  <p className="text-xs font-normal text-blue-900 mt-0.5">
                    {progress.draft.summary}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Review View (before publishing) */}
          {!summary && (
            <>
              {drafts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-700 text-sm">
                  {isBn ? 'কোনো অপ্রকাশিত খসড়া নেই।' : 'No unpublished drafts to review.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedDrafts.map((group) => {
                    const tableLabel = TABLE_LABELS[group.table];
                    return (
                      <section
                        key={group.table}
                        aria-label={isBn ? tableLabel.bn : tableLabel.en}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                            {isBn ? tableLabel.bn : tableLabel.en}
                          </h3>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-900">
                            {isBn
                              ? `${toBnDigits(group.items.length)} টি`
                              : `${group.items.length} items`}
                          </span>
                        </div>

                        <ul className="space-y-2.5">
                          {group.items.map((item) => {
                            const badge = ACTION_BADGES[item.action];
                            return (
                              <li
                                key={item.draftId}
                                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-semibold text-sm text-slate-900">
                                    {item.summary}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.className}`}
                                  >
                                    {isBn ? badge.bn : badge.en}
                                  </span>
                                </div>

                                {item.changedFields.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700">
                                    <span className="font-semibold text-slate-800">
                                      {isBn ? 'পরিবর্তিত ফিল্ড:' : 'Changed fields:'}
                                    </span>
                                    {item.changedFields.map((field) => (
                                      <code
                                        key={field}
                                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200 font-mono text-[11px]"
                                      >
                                        {field}
                                      </code>
                                    ))}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              )}

              {/* Pre-publish Backup Notice */}
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 flex items-start gap-3 text-slate-800">
                <DatabaseBackup className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs sm:text-sm leading-relaxed">
                  {isBn
                    ? 'নিরাপত্তার স্বার্থে প্রকাশ শুরু হওয়ার আগেই আক্রান্ত সারির একটি JSON ব্যাকআপ স্বয়ংক্রিয়ভাবে ডাউনলোড হবে। ব্যাকআপ ব্যর্থ হলে প্রকাশ সম্পূর্ণভাবে বন্ধ থাকবে।'
                    : 'For safety, a JSON backup of affected rows is downloaded automatically before publishing begins. If backup fails, publishing will abort.'}
                </p>
              </div>

              {/* Sensitive Fields Warning & Side-by-Side Comparison */}
              {sensitiveChanges.length > 0 && (
                <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 space-y-3 text-amber-950">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h4 className="font-bold text-sm text-amber-950">
                        {isBn
                          ? 'সতর্কতা: সংবেদনশীল পেমেন্ট বা যোগাযোগের তথ্য পরিবর্তন হচ্ছে'
                          : 'Warning: Sensitive Contact or Payment Fields Changed'}
                      </h4>
                      <p className="text-xs text-amber-900 mt-0.5">
                        {isBn
                          ? 'প্রকাশের আগে পুরাতন ও নতুন মান মিলিয়ে দেখুন।'
                          : 'Compare old and new values carefully before publishing.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {sensitiveChanges.map((change) => (
                      <div
                        key={change.field}
                        className="rounded-xl border border-amber-300 bg-white p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"
                      >
                        <div className="sm:col-span-2 font-bold text-slate-900 border-b border-amber-100 pb-1">
                          {isBn ? change.labelBn : change.labelEn} (<code>{change.field}</code>)
                        </div>
                        <div className="rounded-lg bg-slate-100 p-2.5 border border-slate-200">
                          <div className="font-semibold text-slate-700 mb-1">
                            {isBn ? 'পুরাতন মান (ডাটাবেজ)' : 'Old Value (Database)'}
                          </div>
                          <div className="font-mono text-slate-900 break-all">{change.oldValue}</div>
                        </div>
                        <div className="rounded-lg bg-amber-100/70 p-2.5 border border-amber-300">
                          <div className="font-semibold text-amber-950 mb-1">
                            {isBn ? 'নতুন মান (খসড়া)' : 'New Value (Draft)'}
                          </div>
                          <div className="font-mono text-slate-900 break-all">{change.newValue}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <label className="min-h-[44px] flex items-center gap-3 p-2.5 rounded-xl bg-white border border-amber-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sensitiveConfirmed}
                      disabled={isPublishing}
                      onChange={(e) => setSensitiveConfirmed(e.target.checked)}
                      className="w-5 h-5 accent-amber-700 shrink-0"
                    />
                    <span className="text-sm font-semibold text-slate-900">
                      {isBn
                        ? 'আমি সংবেদনশীল তথ্যের (বিকাশ/নগদ/ব্যাংক/ফোন/ইমেইল) পরিবর্তন যাচাই করেছি ও নিশ্চিত করছি'
                        : 'I have verified and confirm these sensitive contact/payment changes'}
                    </span>
                  </label>
                </div>
              )}

              {/* Delete Confirmation Warning */}
              {hasDeleteDrafts && (
                <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-4 space-y-3 text-red-950">
                  <div className="flex items-start gap-2.5">
                    <Trash2 className="w-5 h-5 text-red-800 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <h4 className="font-bold text-sm text-red-950">
                        {isBn
                          ? 'স্থায়ীভাবে তথ্য মোছার সতর্কবার্তা'
                          : 'Permanent Deletion Warning'}
                      </h4>
                      <p className="text-xs text-red-900 mt-0.5">
                        {isBn
                          ? 'তালিকায় মোছা (DELETE) চিহ্নিত পরিবর্তন রয়েছে। প্রকাশ করলে ডাটাবেজ থেকে সংশ্লিষ্ট তথ্য স্থায়ীভাবে মুছে যাবে।'
                          : 'This batch contains DELETE operations that will permanently remove records from the database.'}
                      </p>
                    </div>
                  </div>

                  <label className="min-h-[44px] flex items-center gap-3 p-2.5 rounded-xl bg-white border border-red-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={deleteConfirmed}
                      disabled={isPublishing}
                      onChange={(e) => setDeleteConfirmed(e.target.checked)}
                      className="w-5 h-5 accent-red-700 shrink-0"
                    />
                    <span className="text-sm font-semibold text-red-950">
                      {isBn
                        ? 'আমি বুঝে শুনে মোছার সিদ্ধান্ত নিশ্চিত করছি'
                        : 'I consciously confirm the deletion decision'}
                    </span>
                  </label>
                </div>
              )}
            </>
          )}

          {/* Post-Publish Results View */}
          {summary && (
            <div className="space-y-4">
              {summary.backupFailed && (
                <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-4 flex items-start gap-3 text-red-950">
                  <XCircle className="w-5 h-5 text-red-800 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-sm space-y-1">
                    <p className="font-bold">
                      {isBn ? 'ব্যাকআপ ব্যর্থ হওয়ায় প্রকাশ স্থগিত' : 'Publish Halted Due to Backup Failure'}
                    </p>
                    <p className="text-red-900">{summary.backupError}</p>
                  </div>
                </div>
              )}

              {summary.haltedByAuth && (
                <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-4 flex items-start gap-3 text-red-950">
                  <AlertTriangle className="w-5 h-5 text-red-800 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm font-semibold">
                    {isBn
                      ? 'সেশন মেয়াদোত্তীর্ণ হয়েছে (AUTH_REQUIRED)। বাকি পরিবর্তনগুলো নিরাপদে খসড়ায় রাখা হয়েছে — আবার সাইন ইন করে পুনরায় চেষ্টা করুন।'
                      : 'Session expired (AUTH_REQUIRED). Remaining changes were halted and kept safely in drafts.'}
                  </p>
                </div>
              )}

              {resolutionNotice && (
                <div className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900">
                  {resolutionNotice}
                </div>
              )}

              <ul className="space-y-3">
                {summary.results.map((item) => {
                  const isSuccess = item.status === 'SUCCESS';
                  const isConflict = item.status === 'CONFLICT';
                  const isSkipped = item.status === 'SKIPPED';

                  const cardStyle = isSuccess
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                    : isConflict
                      ? 'border-amber-400 bg-amber-50 text-amber-950'
                      : isSkipped
                        ? 'border-slate-300 bg-slate-50 text-slate-900'
                        : 'border-red-300 bg-red-50 text-red-950';

                  return (
                    <li key={item.draftId} className={`rounded-2xl border p-4 space-y-2.5 ${cardStyle}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isSuccess ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" aria-hidden="true" />
                          ) : isConflict ? (
                            <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0" aria-hidden="true" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-800 shrink-0" aria-hidden="true" />
                          )}
                          <span className="font-bold text-sm">{item.summary}</span>
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/80 border border-current/20">
                          {item.status}
                        </span>
                      </div>

                      {item.error && (
                        <p className="text-xs sm:text-sm leading-relaxed font-medium">
                          {item.error}
                        </p>
                      )}

                      {isConflict && draftById.has(item.draftId) && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={resolvingDraftId === item.draftId}
                            onClick={() => handleConflictAction(item, 'keepRemote')}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-amber-400 text-amber-950 text-xs sm:text-sm font-semibold hover:bg-amber-100 disabled:opacity-50"
                          >
                            {isBn ? 'ডাটাবেজের তথ্য রাখুন' : 'Keep Remote'}
                          </button>
                          <button
                            type="button"
                            disabled={resolvingDraftId === item.draftId}
                            onClick={() => handleConflictAction(item, 'forceOverwrite')}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-800 text-white text-xs sm:text-sm font-semibold hover:bg-amber-900 disabled:opacity-50"
                          >
                            {isBn ? 'জোরপূর্বক প্রতিস্থাপন' : 'Force Overwrite'}
                          </button>
                          <button
                            type="button"
                            disabled={resolvingDraftId === item.draftId}
                            onClick={() => handleConflictAction(item, 'skip')}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs sm:text-sm font-semibold hover:bg-slate-900 disabled:opacity-50"
                          >
                            {isBn ? 'এড়িয়ে যান' : 'Skip'}
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            disabled={isPublishing}
            onClick={() => {
              if (!isPublishing) onClose();
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {summary ? (isBn ? 'বন্ধ করুন' : 'Close') : isBn ? 'বাতিল করুন' : 'Cancel'}
          </button>

          {!summary && (
            <button
              type="button"
              disabled={!canStartPublish}
              onClick={handlePublish}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-700 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" aria-hidden="true" />
              <span>
                {isPublishing
                  ? progressText
                  : isBn
                    ? 'ব্যাকআপ নিয়ে প্রকাশ করুন'
                    : 'Backup & Publish'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Publish Review Modal wrapper: renders strictly nothing when `isOpen` is false.
 */
export const CmsPublishModal: React.FC<CmsPublishModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <CmsPublishModalContent {...props} />;
};
