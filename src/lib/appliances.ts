import type { HourEstimate } from './solarModel'

export type Appliance = {
  id: string
  label: string
  typicalKw: number
  deferrable: boolean
  notes: string
}

export const APPLIANCES: Appliance[] = [
  {
    id: 'ev',
    label: 'EV charging',
    typicalKw: 7,
    deferrable: true,
    notes: 'Best during sustained peaks; stagger if you have a power limit.',
  },
  {
    id: 'ac',
    label: 'AC / heat pump',
    typicalKw: 3,
    deferrable: true,
    notes: 'Pre-cool or pre-heat before peaks end; huge impact on comfort vs cost.',
  },
  {
    id: 'oven',
    label: 'Oven / cooktop',
    typicalKw: 2.5,
    deferrable: true,
    notes: 'Short high draw; align with the strongest hour if meal timing allows.',
  },
  {
    id: 'washer',
    label: 'Washing machine',
    typicalKw: 2,
    deferrable: true,
    notes: 'Heating water spikes usage; run in a top solar hour when possible.',
  },
  {
    id: 'dryer',
    label: 'Dryer',
    typicalKw: 3,
    deferrable: true,
    notes: 'Often the largest flexible load after an EV.',
  },
  {
    id: 'fridge',
    label: 'Fridge / freezer',
    typicalKw: 0.15,
    deferrable: false,
    notes: 'Runs in short cycles all day; solar alignment matters less than big loads.',
  },
]

export function adviceForDay(
  hours: HourEstimate[],
  peakHours: HourEstimate[],
  timeZone: string,
): { appliance: Appliance; summary: string }[] {
  if (!hours.length || !peakHours.length) {
    return APPLIANCES.map((a) => ({ appliance: a, summary: 'Add location and refresh forecast.' }))
  }

  const maxKw = Math.max(...hours.map((h) => h.estimatedKw), 0.001)
  const strongest = peakHours[0]
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))

  const windowLabel = `${fmt(strongest.timeIso)} · ~${strongest.estimatedKw.toFixed(2)} kW est.`

  return APPLIANCES.map((a) => {
    if (!a.deferrable) {
      return {
        appliance: a,
        summary: `${a.notes} Today’s model peak is around ${fmt(strongest.timeIso)}.`,
      }
    }
    const fits = maxKw >= a.typicalKw * 0.85
    const summary = fits
      ? `Good overlap: your modeled peak (${windowLabel}) can cover ~${a.typicalKw} kW loads. ${a.notes}`
      : `Peak model (~${maxKw.toFixed(2)} kW) may clip a full ${a.typicalKw} kW draw—stagger loads or expect grid/supplement. ${a.notes}`
    return { appliance: a, summary }
  })
}
