export const calculateFare = (mode: string, distance: number): number => {
    let fare = 0;
  
    switch (mode) {
      case 'car':
        fare = distance * 2; // $2 per km for car
        break;
      case 'bus':
        fare = distance * 1.5; // $1.5 per km for bus
        break;
      case 'train':
        fare = distance * 1.8; // $1.8 per km for train
        break;
      case 'walk':
        fare = 0; // Walking is free
        break;
      case 'tricycle':
        fare = 0.8 * distance; // Tricycle fare per km
        break;
      default:
        fare = 0;
    }
  
    return fare;
  };
  