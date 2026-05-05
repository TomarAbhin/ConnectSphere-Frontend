export function promptForReportReason(entityLabel) {
  if (typeof window === 'undefined' || typeof window.prompt !== 'function') {
    return null;
  }

  const reason = window.prompt(`Tell us why you're reporting this ${entityLabel}.`);
  if (!reason) {
    return null;
  }

  const trimmed = reason.trim();
  return trimmed || null;
}