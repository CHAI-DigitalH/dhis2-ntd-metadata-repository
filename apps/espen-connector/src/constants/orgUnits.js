// Sierra Leone districts — confirmed UIDs from DHIS2 instance
export const ORG_UNITS = [
  { id: 'O6uvpzGd5pu', code: 'OU_533', name: 'Bo' },
  { id: 'fdc6uOvgoji', code: 'OU_197', name: 'Bombali' },
  { id: 'lc3eMKXaEfw', code: 'OU_544', name: 'Bonthe' },
  { id: 'jUb8gELQApl', code: 'OU_204', name: 'Kailahun' },
  { id: 'PMa2VCrupOd', code: 'OU_226', name: 'Kambia' },
  { id: 'kJq2mPyFEHo', code: 'OU_234', name: 'Kenema' },
  { id: 'qhqAxPSTUXp', code: 'OU_247', name: 'Koinadugu' },
  { id: 'Vth0fbpFcsO', code: 'OU_258', name: 'Kono' },
  { id: 'jmIPBj66vD6', code: 'OU_266', name: 'Moyamba' },
  { id: 'TEQlaapDQoK', code: 'OU_651', name: 'Port Loko' },
  { id: 'bL4ooGhyHRQ', code: 'OU_276', name: 'Pujehun' },
  { id: 'eIQbndfxQMb', code: 'OU_268149', name: 'Tonkolili' },
  { id: 'at6UHUQatSo', code: 'OU_278310', name: 'Western Area' },
]

// Convenience: set of all OU UIDs for analytics dimension strings
export const ORG_UNIT_UIDS = ORG_UNITS.map(ou => ou.id)

// Lookup by UID
export const ORG_UNIT_BY_ID = Object.fromEntries(ORG_UNITS.map(ou => [ou.id, ou]))
