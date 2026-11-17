import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Camera } from 'expo-camera';

export type PermissionPurpose = 'camera_test' | 'selected_media' | 'location_sharing' | 'notifications';
export async function permissionStatus(purpose:PermissionPurpose) {
  if(purpose==='camera_test') return (await Camera.getCameraPermissionsAsync()).status;
  if(purpose==='selected_media') return (await ImagePicker.getMediaLibraryPermissionsAsync()).status;
  if(purpose==='location_sharing') return (await Location.getForegroundPermissionsAsync()).status;
  return (await Notifications.getPermissionsAsync()).status;
}
export async function requestOsPermission(purpose:PermissionPurpose) {
  // Call only from the explicit owner action on the matching permission card.
  if(purpose==='camera_test') return (await Camera.requestCameraPermissionsAsync()).status==='granted';
  if(purpose==='selected_media') return (await ImagePicker.requestMediaLibraryPermissionsAsync()).status==='granted';
  if(purpose==='location_sharing') return (await Location.requestForegroundPermissionsAsync()).status==='granted';
  return (await Notifications.requestPermissionsAsync()).status==='granted';
}
