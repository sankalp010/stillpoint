import Link from 'next/link';
import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';

export default function NotFound() {
  return (
    <main className="shell">
      <SiteHeader><Link href="/">Back to home</Link></SiteHeader>
      <section className="page-wrap not-found">
        <div className="eyebrow">404 · Page not found</div>
        <h1>That page wandered off.</h1>
        <p className="muted">The link may be out of date, but your next practice round is still here.</p>
        <Link className="button" href="/">Return to Stillpoint <span>↗</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
