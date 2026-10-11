'use client';

import Link from 'next/link';
import SiteFooter from '../../../components/SiteFooter';
import SiteHeader from '../../../components/SiteHeader';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function ReviewPage(){
  const {id}=useParams(),router=useRouter();
  const [session,setSession]=useState(null),[error,setError]=useState('');
  useEffect(()=>{api(`/sessions/${id}/review`).then(d=>setSession(d.session)).catch(e=>{if(e.message.includes('sign in'))router.replace('/login');else if(e.message.includes('Finish'))router.replace(`/interview/${id}`);else setError(e.message)})},[id,router]);
  if(error)return <main className="shell"><SiteHeader><Link href="/dashboard">Your practice space</Link></SiteHeader><div className="loading"><p>{error}</p><Link className="button" href="/dashboard">Back to your practice space</Link></div></main>;
  if(!session)return <main className="shell"><SiteHeader><Link href="/dashboard">Your practice space</Link></SiteHeader><div className="loading">Preparing your review…</div></main>;
  const accepted=session.problems.filter(p=>p.submission.status==='accepted').length;
  return <main className="shell"><SiteHeader><Link href="/dashboard">Your practice space</Link></SiteHeader><div className="page-wrap review"><div className="eyebrow">Interview review · {session.durationMinutes} minutes</div><section className="review-hero"><div><h1 style={{font:'600 31px/1.12 var(--display)',letterSpacing:'-.06em',margin:'8px 0'}}>A round well spent.</h1><p className="muted" style={{margin:0}}>{accepted} of 3 problems passed all hidden tests.</p></div><div className="score-num">{session.score}<small> / 100</small></div></section><div className="review-grid">{session.problems.map((p,i)=><article className="review-card" key={p.id}><div className="review-card-head"><div><div className="eyebrow">Problem 0{i+1} · {p.difficulty}</div><h2 style={{marginTop:5}}>{p.title}</h2></div><span className={`pill ${p.submission.status==='accepted'?'accent':'warning'}`}>{p.submission.status==='accepted'?'Passed all tests':p.submission.status==='not_submitted'?'Not submitted':`${p.submission.passedTests}/${p.submission.totalTests} passed`}</span></div><p className="muted small">{p.prompt}</p><h3 style={{fontSize:12,marginBottom:5}}>Reference approach</h3><p className="small">{p.explanation}</p><h3 style={{fontSize:12,marginBottom:5}}>Reference answer</h3><pre className="code-answer"><code>{p.referenceAnswer}</code></pre><details><summary className="small text-link" style={{cursor:'pointer'}}>View your submitted solution</summary><pre className="code-answer"><code>{p.submission.sourceCode||'No solution submitted.'}</code></pre></details></article>)}</div><div style={{display:'flex',justifyContent:'center',paddingTop:25}}><Link className="button" href="/dashboard">Back to your practice space <span>↗</span></Link></div></div><SiteFooter message="Keep showing up." /></main>;
}
