export default function SiteFooter({ message, compact = false }) {
  return (
    <footer className={`footer${compact ? ' footer-compact' : ''}`}>
      <div className="page-wrap">
        <div className="footer-credit">
          <span>© 2026 Stillpoint</span>
          <span className="footer-built">
            Built with <span className="footer-heart" aria-hidden="true">♥</span> by sankalP
          </span>
        </div>
        {message && <span>{message}</span>}
      </div>
    </footer>
  );
}
