import { types as sdkTypes } from './sdkLoader';
import { boundsCenter, distanceInKm } from './maps';

const { LatLng, LatLngBounds } = sdkTypes;

describe('boundsCenter', () => {
  it('returns the middle of the bounds', () => {
    const bounds = new LatLngBounds(new LatLng(60.3, 25.2), new LatLng(60.1, 24.8));
    const center = boundsCenter(bounds);
    expect(center.lat).toBeCloseTo(60.2);
    expect(center.lng).toBeCloseTo(25.0);
  });

  it('returns null without bounds', () => {
    expect(boundsCenter(null)).toBeNull();
    expect(boundsCenter({ ne: {}, sw: {} })).toBeNull();
  });
});

describe('distanceInKm', () => {
  it('measures Helsinki to Tampere as about 160 km', () => {
    const helsinki = new LatLng(60.1699, 24.9384);
    const tampere = new LatLng(61.4978, 23.761);
    expect(distanceInKm(helsinki, tampere)).toBeGreaterThan(155);
    expect(distanceInKm(helsinki, tampere)).toBeLessThan(165);
  });

  it('is zero for the same point', () => {
    const point = new LatLng(60.17, 24.94);
    expect(distanceInKm(point, point)).toBe(0);
  });

  it('returns null if a point is missing', () => {
    expect(distanceInKm(null, new LatLng(60, 25))).toBeNull();
  });
});
