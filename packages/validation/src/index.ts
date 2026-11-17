export const devicePlatforms = ['android', 'ios'] as const;
export const consentPurposes = [
  'device_registration',
  'camera_test',
  'selected_media',
  'location_sharing',
  'notifications',
] as const;

export type DevicePlatform = (typeof devicePlatforms)[number];
export type ConsentPurpose = (typeof consentPurposes)[number];

export function isDevicePlatform(value: unknown): value is DevicePlatform {
  return typeof value === 'string' && devicePlatforms.some(platform => platform === value);
}

export function isConsentPurpose(value: unknown): value is ConsentPurpose {
  return typeof value === 'string' && consentPurposes.some(purpose => purpose === value);
}
