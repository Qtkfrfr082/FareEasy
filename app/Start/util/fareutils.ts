// fareUtils.ts
export const fareMatrix = {
  LRT_BASE: 15,
  LRT_EXTRA: 1,
  MRT_BASE: 13,
  MRT_EXTRA: 1,
  EDSA_Carousel: 15,
  BUS_BASE: 13,
  BUS_EXTRA: 2.2,
  TRICYCLE_BASE: 12,
  TRICYCLE_EXTRA: 2,
  TAXI_BASE: 45,
  TAXI_EXTRA: 13.5,
  JEEP_BASE: 13,
  JEEP_EXTRA: 2,
  WALK: 0,
};

export const discountTypes = ['Student', 'PWD', 'Senior Citizen'];

export function parseDistance(text: string): number {
  if (!text) return 0;
  if (text.includes('km')) return parseFloat(text.replace(' km', '').trim());
  if (text.includes('m')) return parseFloat(text.replace(' m', '').trim()) / 1000;
  return 0;
}

export function getVehicleType(step: any): string {
  if (step.travel_mode === 'WALKING') return 'WALK';
  if (step.travel_mode === 'TRANSIT') {
    const vehicle = step.transit_details?.line?.vehicle;
    const name = vehicle?.name?.toLowerCase() || '';
    const type = vehicle?.type?.toUpperCase() || '';
    const lineShortName = step.transit_details?.line?.short_name?.toLowerCase() || '';
    const lineName = step.transit_details?.line?.name?.toLowerCase() || '';
    if (
      type === 'BUS' &&
      (lineShortName.includes('edsa carousel') || lineName.includes('edsa carousel'))
    ) return 'EDSA_Carousel';
    if (lineShortName.includes('edsa carousel') || lineName.includes('edsa carousel')) return 'EDSA_Carousel';
    if (type === 'BUS') return 'BUS';
    if (type === 'JEEPNEY' || name.includes('jeep')) return 'JEEP';
    if (type === 'TAXI' || name.includes('taxi')) return 'TAXI';
    if (name.includes('tricycle')) return 'TRICYCLE';
    if (name.includes('lrt') || lineName.includes('lrt')) return 'LRT';
    if (name.includes('mrt') || lineName.includes('mrt')) return 'MRT';
    return 'BUS';
  }
  return 'WALK';
}

export function getStepFare(step: any): number {
  const vehicleType = getVehicleType(step);
  const distance = parseDistance(step.distance?.text || '0');
  if (vehicleType === 'WALK') return 0;
  if (step.transit_details?.fare?.value) return step.transit_details.fare.value;
  switch (vehicleType) {
    case 'LRT':
      return fareMatrix.LRT_BASE + Math.max(0, distance - 3) * fareMatrix.LRT_EXTRA;
    case 'MRT':
      return fareMatrix.MRT_BASE + Math.max(0, distance - 3) * fareMatrix.MRT_EXTRA;
    case 'EDSA_Carousel':
      return Math.min(15 + Math.max(0, distance - 4) * 2.65, 75.5);
    case 'BUS':
      return fareMatrix.BUS_BASE + Math.max(0, distance - 0) * fareMatrix.BUS_EXTRA;
    case 'TRICYCLE':
      return fareMatrix.TRICYCLE_BASE + Math.max(0, distance - 1) * fareMatrix.TRICYCLE_EXTRA;
    case 'TAXI':
      return fareMatrix.TAXI_BASE + Math.max(0, distance - 0.5) * fareMatrix.TAXI_EXTRA;
    case 'JEEP':
      return fareMatrix.JEEP_BASE + Math.max(0, distance - 4) * fareMatrix.JEEP_EXTRA;
    default:
      return 0;
  }
}

export function getRouteTotalFare(route: any, isDiscounted: boolean): number {
  let total = 0;
  const steps = route.legs[0]?.steps || [];
  for (let i = 0; i < steps.length; i++) {
    let fare = getStepFare(steps[i]);
    const vehicleType = getVehicleType(steps[i]);
    if (isDiscounted && vehicleType !== 'WALK') {
    }
    total += fare;
  }
  return total;
}