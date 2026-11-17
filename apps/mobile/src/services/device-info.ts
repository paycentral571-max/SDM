import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Battery from 'expo-battery';
import { Platform } from 'react-native';
export async function readDeviceDiagnostics() {
  let battery:string|undefined;
  try { const level=await Battery.getBatteryLevelAsync(); if(level>=0) battery=`${Math.round(level*100)}%`; } catch { /* unsupported platform */ }
  return { model:Device.modelName??'Unavailable', manufacturer:Device.manufacturer??'Unavailable', os:`${Platform.OS} ${Device.osVersion??Platform.Version}`, appVersion:Application.nativeApplicationVersion??'Unavailable', battery, isDevice:Device.isDevice };
}
