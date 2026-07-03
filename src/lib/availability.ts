export type AvailabilityStatus = 'available' | 'limited' | 'busy';

// Edit this to change the hero badge; site is static, so a rebuild/redeploy is required.
export const availabilityStatus: AvailabilityStatus = 'available';

export const availabilityCopy: Record<AvailabilityStatus, { label: string; dotClass: string }> = {
  available: { label: 'Available for new projects', dotClass: 'bg-status-available' },
  limited: { label: 'Limited availability', dotClass: 'bg-status-limited' },
  busy: { label: 'Deep in current projects', dotClass: 'bg-status-busy' },
};
