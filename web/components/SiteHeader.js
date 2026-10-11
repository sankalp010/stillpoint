import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function SiteHeader({ children, leading, variant = 'default' }) {
  const workspace = variant === 'workspace';
  return (
    <header className={`topbar${workspace ? ' workbar' : ''}`}>
      <div className={workspace ? 'workbar-left' : 'site-header-brand'}>
        <Link href="/" className="brand"><span className="brandmark">s.</span><span>stillpoint</span></Link>
        {leading}
      </div>
      {workspace ? (
        <div className="workbar-right">
          {children}
          <ThemeToggle />
        </div>
      ) : (
        <nav className="top-actions" aria-label="Page navigation">
          {children}
          <ThemeToggle />
        </nav>
      )}
    </header>
  );
}
