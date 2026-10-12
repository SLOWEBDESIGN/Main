import directory from '@/src/data/status-directory.json';

export default function StatusLinks() {
  return <details className="atelier-status-links">
    <summary>Service status</summary>
    <nav aria-label="Service status pages">
      <a href="/1LhYKNpDUb9vRK95brXe/index.html">All websites &amp; services</a>
      <a href="/3dprintdash/status/index.html">3D Print Dash status</a>
      {directory.services.map(service => <a key={service.id} href={service.url} target="_blank" rel="noopener noreferrer">{service.name}</a>)}
    </nav>
  </details>;
}
