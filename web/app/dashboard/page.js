'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';

const formatDate=value=>new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(value));
export default function Dashboard(){
  const [user,setUser]=useState(null),[sessions,setSessions]=useState([]),[counts,setCounts]=useState(null),[duration,setDuration]=useState(60),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const router=useRouter();
  const refresh=useCallback(async()=>{try{const [me,history,bank]=await Promise.all([api('/auth/me'),api('/sessions'),api('/problems/counts')]);setUser(me.user);setSessions(history.sessions);setCounts(bank.counts)}catch{router.replace('/login')}finally{setLoading(false)}},[router]);
  useEffect(()=>{refresh()},[refresh]);
  async function start(){setBusy(true);setError('');try{const result=await api('/sessions',{method:'POST',body:JSON.stringify({durationMinutes:duration})});router.push(`/interview/${result.session.id}`)}catch(e){setError(e.message)}finally{setBusy(false)}}
  async function logout(){await api('/auth/logout',{method:'POST'});router.replace('/')}
  if(loading||!user)return <main className="shell"><SiteHeader /><div className="loading">Getting your practice space ready…</div></main>;
  return <main className="shell"><SiteHeader><span>{user.name}</span><button className="button quiet" onClick={logout}>Log out</button></SiteHeader><div className="page-wrap dashboard">
    <div className="welcome-row"><div><div className="eyebrow">Your practice space</div><h1>Good to see you, {user.name.split(' ')[0]}.</h1></div><span className="pill accent">JavaScript ready</span></div>
    <div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><h2>Set up a mock interview</h2><span className="small muted">Choose a window and settle in.</span></div><span className="pill">03 problems</span></div><div className="duration-grid">{[45,60,90].map(n=><button key={n} className={`duration-option ${duration===n?'selected':''}`} onClick={()=>setDuration(n)} aria-pressed={duration===n}><strong>{n} min</strong><span>{n===45?'A focused round':n===60?'The classic format':'Room to go deeper'}</span></button>)}</div><div className="meta-list"><div><strong>Easy</strong>{counts?.easy??'—'} ready</div><div><strong>Medium</strong>{counts?.medium??'—'} ready</div><div><strong>Hard</strong>{counts?.hard??'—'} ready</div></div>{error&&<div className="error-box" role="alert" style={{marginBottom:12}}>{error}</div>}<button className="button full" onClick={start} disabled={busy}>{busy?'Preparing your questions…':'Start interview'} <span>↗</span></button><p className="form-note" style={{textAlign:'center',marginBottom:0}}>One question per difficulty. Your timer starts when the interview opens.</p></section>
      <section className="panel"><div className="panel-head"><div><h2>Past interviews</h2><span className="small muted">Your progress, kept in one place.</span></div></div>{sessions.length?<div className="history">{sessions.map(s=><Link href={s.status==='active'?`/interview/${s.id}`:`/review/${s.id}`} className="history-item" key={s.id}><div><strong>{s.durationMinutes} minute interview</strong><small>{formatDate(s.startedAt)} · {s.problems.map(p=>p.difficulty).join(' / ')}</small></div><div style={{textAlign:'right'}}><span className={`pill ${s.status==='active'?'warning':'accent'}`}>{s.status==='active'?'Resume':s.status}</span>{s.score!==null&&<small style={{display:'block',marginTop:5}}>{s.score}%</small>}</div></Link>)}</div>:<div className="empty">Your completed sessions will show up here.</div>}</section></div>
  </div><SiteFooter message="Small steps count." /></main>;
}
