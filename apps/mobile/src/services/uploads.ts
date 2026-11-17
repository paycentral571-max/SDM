import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { apiRequest } from './api';

export async function choosePhoto() {
  const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsMultipleSelection:false,quality:0.85});
  if(result.canceled)return null;
  const asset=result.assets[0];
  return {uri:asset.uri,name:asset.fileName??`selected-image-${Date.now()}.jpg`,mimeType:asset.mimeType??'image/jpeg',size:asset.fileSize??0};
}
export async function chooseDocument() {
  const result=await DocumentPicker.getDocumentAsync({copyToCacheDirectory:true,multiple:false});
  if(result.canceled)return null;
  const file=result.assets[0];
  return {uri:file.uri,name:file.name,mimeType:file.mimeType??'application/octet-stream',size:file.size??0};
}
export async function uploadSelectedFile(file:{uri:string;name:string;mimeType:string;size:number},deviceId:string,consentId:string) {
  let size=file.size;
  if(size<=0){const info=await FileSystem.getInfoAsync(file.uri);if(info.exists&&'size'in info)size=info.size;}
  if(size<=0||size>50*1024*1024)throw new Error('Choose a file smaller than 50 MB.');
  const upload=await apiRequest<{objectId:string;uploadUrl:string}>('/evidence/upload-requests',{method:'POST',body:JSON.stringify({deviceId,consentId,fileName:file.name,contentType:file.mimeType,size})});
  let uploadUrl:URL;
  try{uploadUrl=new URL(upload.uploadUrl)}catch{throw new Error('The server returned an invalid secure upload URL.')}
  if(uploadUrl.protocol!=='https:')throw new Error('The server did not provide an HTTPS upload URL.');
  const result=await FileSystem.uploadAsync(uploadUrl.toString(),file.uri,{httpMethod:'PUT',uploadType:FileSystem.FileSystemUploadType.BINARY_CONTENT,headers:{'Content-Type':file.mimeType}});
  if(result.status<200||result.status>=300)throw new Error(`Private upload failed (${result.status}).`);
  await apiRequest(`/evidence/${encodeURIComponent(upload.objectId)}/complete`,{method:'POST',body:JSON.stringify({})});
  return upload.objectId;
}
