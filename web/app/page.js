import Link from 'next/link';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
export default function Home(){
  return <main className="shell">
    <SiteHeader><a href="#how">How it works</a><Link href="/login">Log in</Link><Link className="button" href="/register">Start practicing <span>↗</span></Link></SiteHeader>
    <div className="page-wrap">
      <section className="hero">
        <div><div className="eyebrow">A little more like the real thing</div><h1>Find your rhythm.<br/><em>Then find the answer.</em></h1><p className="hero-copy">A focused space to practice the way interviews happen: one problem at a time, a clock on the wall, and room to think clearly.</p><div className="hero-actions"><Link className="button" href="/register">Set up an interview <span>↗</span></Link><Link className="text-link" href="/login">I have an account</Link></div><p className="hero-note">45, 60, or 90 minutes · Three problems · Your own pace</p></div>
        <div className="hero-card" aria-label="Preview of the interview workspace"><div className="mock-top"><div className="mock-dots"><i/><i/><i/></div><span className="mock-clock">◷ &nbsp; 42:18</span></div><div className="mock-screen"><div className="mock-side"><div className="mock-label">Your round</div><div className="mock-problem active">01 &nbsp; Two Sum</div><div className="mock-problem">02 &nbsp; Merge Intervals</div><div className="mock-problem">03 &nbsp; Shortest Path</div></div><div className="mock-main"><div className="mock-title">Two Sum</div><span className="mock-tag">Easy · Arrays</span><div className="mock-lines"><i/><i/><i/></div><div className="mock-editor"><span>function</span> solve(nums, target) {'{'}<br/>&nbsp; <b>{'// your approach starts here'}</b><br/>&nbsp; <span>return</span> [];<br/>{'}'}</div></div></div></div>
      </section>
      <div className="stats-strip"><div><strong>Three</strong> carefully chosen problems</div><div><strong>One hour</strong> of uninterrupted focus</div><div><strong>Your pace</strong> no pressure, just practice</div></div>
      <section id="how" className="section"><div className="section-heading"><div className="eyebrow">The format</div><h2>Practice with a little more intention.</h2><p className="muted">A simple interview loop that lets you focus on the part that matters: working through the problem.</p></div><div className="feature-grid"><article className="feature-card"><div className="feature-icon">01</div><h3>Choose your window</h3><p>Set aside 45, 60, or 90 minutes. The clock starts when your questions are ready.</p></article><article className="feature-card"><div className="feature-icon">02</div><h3>Meet three challenges</h3><p>One easy, one medium, one hard. Topics span the patterns that show up in real interviews.</p></article><article className="feature-card"><div className="feature-icon">03</div><h3>Learn from the review</h3><p>Submit JavaScript, see how your solution did, then compare it with a clear reference answer.</p></article></div></section>
    </div><SiteFooter message="Practice thoughtfully." />
  </main>;
}
