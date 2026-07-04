export type AvailabilityStatus = 'available' | 'limited' | 'busy';

// Edit this to change the hero badge; site is static, so a rebuild/redeploy is required.
export const availabilityStatus: AvailabilityStatus = 'available';

export const availabilityCopy: Record<AvailabilityStatus, { label: string; dotClass: string }> = {
  available: { label: 'open_to_new_projects', dotClass: 'bg-status-available' },
  limited: { label: 'limited_availability', dotClass: 'bg-accent' },
  busy: { label: 'currently_booked', dotClass: 'bg-status-busy' },
};
