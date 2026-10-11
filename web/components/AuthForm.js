'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

export function AuthForm({ mode }){
  const register = mode === 'register';
  const [form,setForm]=useState({name:'',email:'',password:''});
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const buttonRef=useRef(null);
  const atmosphereRef=useRef(null);
  const router=useRouter();
  const googleClientId=process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const finishGoogle=useCallback(async credential=>{setBusy(true);setError('');try{await api('/auth/google',{method:'POST',body:JSON.stringify({credential})});router.push('/dashboard')}catch(e){setError(e.message)}finally{setBusy(false)}},[router]);
  const initGoogle=useCallback(()=>{
    if(!googleClientId||!buttonRef.current||!window.google?.accounts?.id)return;
    window.google.accounts.id.initialize({client_id:googleClientId,callback:response=>finishGoogle(response.credential)});
    window.google.accounts.id.renderButton(buttonRef.current,{theme:'outline',size:'large',shape:'rectangular',width:380,text:'continue_with'});
  },[googleClientId,finishGoogle]);
  useEffect(()=>{initGoogle()},[initGoogle]);
  function moveAtmosphere(event){
    if(event.pointerType==='touch'||!atmosphereRef.current)return;
    const bounds=event.currentTarget.getBoundingClientRect();
    const x=Math.max(0,Math.min(1,(event.clientX-bounds.left)/bounds.width));
    const y=Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height));
    const surface=atmosphereRef.current;
    surface.style.setProperty('--focus-x',`${x*100}%`);
    surface.style.setProperty('--focus-y',`${y*100}%`);
    surface.style.setProperty('--drift-x',`${(x-.5)*22}px`);
    surface.style.setProperty('--drift-y',`${(y-.5)*22}px`);
  }
  function resetAtmosphere(){
    const surface=atmosphereRef.current;
    if(!surface)return;
    surface.style.setProperty('--focus-x','50%');
    surface.style.setProperty('--focus-y','50%');
    surface.style.setProperty('--drift-x','0px');
    surface.style.setProperty('--drift-y','0px');
  }
  async function submit(event){event.preventDefault();setBusy(true);setError('');try{await api(register?'/auth/register':'/auth/login',{method:'POST',body:JSON.stringify(form)});router.push('/dashboard')}catch(e){setError(e.message)}finally{setBusy(false)}}
  return <main className="shell"><SiteHeader><span>{register?'Already have an account?':'New here?'}</span><Link className="text-link" href={register?'/login':'/register'}>{register?'Log in':'Create an account'}</Link></SiteHeader>
    <div className="auth-grid"><section className="auth-panel"><div className="eyebrow">{register?'Make space to practice':'Welcome back'}</div><h1>{register?'Start with a clear mind.':'Pick up where you left off.'}</h1><p className="muted">{register?'Create your account and set up your first mock interview.':'Your next practice round is only a few minutes away.'}</p>
      <form className="form" onSubmit={submit}>{register&&<div className="field"><label htmlFor="name">Your name</label><input id="name" autoComplete="name" required maxLength={80} placeholder="Alex Morgan" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>}<div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div><div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete={register?'new-password':'current-password'} required minLength={register?8:1} placeholder={register?'At least 8 characters':'Your password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>{register&&<span className="form-note">Use at least 8 characters.</span>}</div>{error&&<div className="error-box" role="alert">{error}</div>}<button className="button full" disabled={busy}>{busy?'One moment…':register?'Create account':'Log in'} <span>↗</span></button></form>
      {googleClientId&&<><div className="divider" style={{maxWidth:410,marginTop:20}}>or</div><div ref={buttonRef} style={{marginTop:15,minHeight:40}}/><Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initGoogle}/></>}
      {!googleClientId&&<p className="form-note" style={{marginTop:17}}>Google sign-in will appear when configured by the project owner.</p>}
      <p className="form-note" style={{marginTop:23}}>Your interview history stays with your account.</p>
    </section><aside className="auth-side" onPointerMove={moveAtmosphere} onPointerLeave={resetAtmosphere}><div className="auth-atmosphere" ref={atmosphereRef} aria-hidden="true"><span className="auth-orbit auth-orbit-outer"/><span className="auth-orbit auth-orbit-inner"/><span className="auth-orbit-point"/></div><div className="auth-quote">“The best way to get comfortable with the hard part is to give it a little room.”<small>Stillpoint · A calmer interview practice space</small></div></aside></div><SiteFooter />
  </main>;
}
