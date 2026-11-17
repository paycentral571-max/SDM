'use client';
import { AlertCircle, Inbox, LoaderCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Resource } from '../lib/types';

export function useData<T>(resource:Resource, params:Record<string,string>={}) {
  const query=new URLSearchParams(params).toString(); const [data,setData]=useState<T|null>(null); const [error,setError]=useState(''); const [loading,setLoading]=useState(true); const [retry,setRetry]=useState(0);
  const refresh=useCallback(()=>setRetry(value=>value+1),[]);
  useEffect(()=>{ const controller=new AbortController(); setLoading(true); setError(''); fetch(`/api/data/${resource}${query?'?'+query:''}`,{signal:controller.signal,cache:'no-store'}).then(async response=>{const json=await response.json(); if(!response.ok) throw new Error(json.message || `Request failed (${response.status})`); return json as T;}).then(value=>{setData(value);setLoading(false)}).catch(reason=>{if(!controller.signal.aborted){setError(reason instanceof Error?reason.message:'Unable to load data');setLoading(false)}}); return()=>controller.abort(); },[resource,query,retry]);
  return {data,error,loading,refresh};
}
export function DataState({loading,error,empty,onRetry,children}: {loading:boolean;error:string;empty?:boolean;onRetry:()=>void;children:React.ReactNode}) {
  if(loading) return <div className="surface flex min-h-64 flex-col items-center justify-center gap-3 text-muted" role="status"><LoaderCircle className="animate-spin text-accent" size={26}/><span>Loading secure data…</span></div>;
  if(error) return <div className="surface flex min-h-64 flex-col items-center justify-center gap-3 px-5 text-center" role="alert"><AlertCircle className="text-amber-300" size={26}/><b>Unable to load this view</b><p className="muted max-w-md">{error}</p><button className="button-ghost mt-2" onClick={onRetry}><RefreshCw size={15}/> Try again</button></div>;
  if(empty) return <div className="surface flex min-h-64 flex-col items-center justify-center gap-3 px-5 text-center"><Inbox className="text-accent" size={26}/><b>No records found</b><p className="muted">Try another search or filter, or check back when records are available.</p></div>;
  return <>{children}</>;
}
export function Status({value}: {value:string}) { const tone=/protected|active|clean|ready|resolved|success/i.test(value)?'badge-good':/critical|revoked|failed|denied/i.test(value)?'badge-bad':/high|medium|review|pending|offline/i.test(value)?'badge-warn':'badge-neutral'; return <span className={`badge ${tone}`}>{value.replaceAll('_',' ')}</span>; }
export function DateText({value}: {value:string|null}) { if(!value) return <>Never</>; const date=new Date(value); return <>{Number.isNaN(date.valueOf())?value:date.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'})}</>; }
