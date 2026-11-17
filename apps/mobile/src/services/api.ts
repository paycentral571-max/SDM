import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
const ACCESS_KEY = 'sdm.access.v1';
const REFRESH_KEY = 'sdm.refresh.v1';
export interface Session { accessToken:string; refreshToken:string; expiresIn?:number; user?:{id:string;name:string;email:string}; }
let refreshInFlight:Promise<string|null>|null=null;
export class ApiError extends Error { constructor(message:string, public status:number) { super(message); } }
async function storeSession(session:Session) { await SecureStore.setItemAsync(ACCESS_KEY,session.accessToken); await SecureStore.setItemAsync(REFRESH_KEY,session.refreshToken); }
export async function clearSession() { await SecureStore.deleteItemAsync(ACCESS_KEY); await SecureStore.deleteItemAsync(REFRESH_KEY); }
export async function getSessionToken() { return SecureStore.getItemAsync(ACCESS_KEY); }
async function refreshToken() {
 if(refreshInFlight) return refreshInFlight;
 refreshInFlight=(async()=>{ const token=await SecureStore.getItemAsync(REFRESH_KEY); if(!token)return null; try { const response=await fetch(`${API_URL}/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:token})}); if(!response.ok){await clearSession();return null;} const updated=await response.json() as Session; if(!updated.accessToken||!updated.refreshToken){await clearSession();return null;} await storeSession(updated); return updated.accessToken; } catch { return null; } finally { refreshInFlight=null; }})();
 return refreshInFlight;
}
export async function apiRequest<T>(path:string, options:RequestInit={}) : Promise<T> {
 const access=await SecureStore.getItemAsync(ACCESS_KEY);
 if(!access) throw new ApiError('Sign in to continue.',401);
 const send=(token:string)=>fetch(`${API_URL}${path}`,{...options,headers:{Accept:'application/json',...(options.body instanceof FormData?{}:{'Content-Type':'application/json'}),...options.headers,Authorization:`Bearer ${token}`},cache:'no-store'});
 let response:Response;
 try { response=await send(access); } catch { throw new ApiError('The service is offline. Check your connection and try again.',0); }
 if(response.status===401){const renewed=await refreshToken();if(!renewed)throw new ApiError('Your session expired. Sign in again.',401);try{response=await send(renewed)}catch{throw new ApiError('The service is offline. Check your connection and try again.',0)}}
 if(response.status===204) return undefined as T;
 const result=await response.json().catch(()=>({message:'The server returned an unreadable response.'}));
 if(!response.ok) throw new ApiError(result.message||`Request failed (${response.status})`,response.status);
 return result as T;
}
export async function authenticate(path:'/auth/login'|'/auth/register',body:Record<string,string>) { const response=await fetch(`${API_URL}${path}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body)}).catch(()=>{throw new ApiError('The service is offline. Check your connection and try again.',0)}); const result=await response.json().catch(()=>({message:'The server returned an unreadable response.'})); if(!response.ok)throw new ApiError(result.message||'Unable to authenticate',response.status); if(!result.accessToken||!result.refreshToken)throw new ApiError('The authentication service did not return a secure session.',502); await storeSession(result as Session); return result as Session; }
export const apiBaseUrl=API_URL;
