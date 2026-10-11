import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { StepButton } from '@/src/components/atelier/Step';
import { getBrandCopy, getRequestBrandVariant, type BrandVariant } from '@/src/lib/schema';
import registry from '../../../private-demos/registry.json';
import { LOCAL_PREVIEW_TOKEN, localDemoPreviewEnabled } from '../../../tools/local-demo-preview.mjs';

type Props = { code: string; title: string; variant: BrandVariant; localVisit: Visit | null };
type Visit = { token: string; expiresAt: number; remaining: number };

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, req, res }) => {
  const item = registry.find(demo => demo.code === params?.code);
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (!item) return { notFound: true };
  const localVisit = await localDemoPreviewEnabled(req)
    ? { token: LOCAL_PREVIEW_TOKEN, expiresAt: Date.now() + 3600000, remaining: 2 } : null;
  return { props: { code: item.code, title: item.title, variant: getRequestBrandVariant(req.headers), localVisit } };
};

export default function PrivateVisit({ code, title, variant, localVisit }: Props) {
  const brand = getBrandCopy(variant);
  const [accessCode, setAccessCode] = useState('');
  const [visit, setVisit] = useState<Visit | null>(localVisit);
  const localPreview = !!localVisit && visit?.token === localVisit.token;
  const [mobile, setMobile] = useState(true);
  const [phone, setPhone] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [phoneScale, setPhoneScale] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [minutes, setMinutes] = useState(60);
  const [light, setLight] = useState(false);
  useEffect(() => {
    if (!phone || !visit || mobile || !stageRef.current) return;
    const stage = stageRef.current;
    const resize = () => setPhoneScale(Math.max(0.1, Math.min(1,
      (stage.clientWidth - 32) / 393, (stage.clientHeight - 32) / 852)));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [phone, visit, mobile]);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px)');
    const update = () => setMobile(query.matches);
    update(); query.addEventListener('change', update);
    try { setLight(localStorage.getItem('slo-theme') === 'light'); } catch { /* optional theme */ }
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    const toggle = (event: Event) => { event.preventDefault(); setLight(value => !value); };
    window.addEventListener('studio:toggle-theme', toggle);
    return () => window.removeEventListener('studio:toggle-theme', toggle);
  }, [light]);
  useEffect(() => {
    if (!visit) return;
    const expire = () => { setVisit(null); setError('Your one-hour visit has ended. You can use your access code again if you have a visit left. Otherwise, email Ben for a new code.'); };
    const timer = localPreview ? undefined : window.setTimeout(expire, Math.max(0, visit.expiresAt - Date.now()));
    const poll = window.setInterval(async () => {
      setMinutes(Math.max(0, Math.ceil((visit.expiresAt - Date.now()) / 60_000)));
      try {
        const response = await fetch(`/api/visits/session?code=${code}`, { headers: { Authorization: `Bearer ${visit.token}` }, credentials: 'omit', cache: 'no-store' });
        if (response.status === 401) expire();
      } catch { /* Server still checks every demo and asset request. */ }
    }, 15000);
    return () => { clearTimeout(timer); clearInterval(poll); };
  }, [visit, code, localPreview]);
  async function unlock(event: FormEvent) {
    event.preventDefault();
    if (busy || mobile) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/visits/unlock', { method: 'POST', credentials: 'omit', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, accessCode }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      setVisit(result); setAccessCode(''); setMinutes(60);
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Please try again.'); }
    finally { setBusy(false); }
  }

  return <div className="atelier private-visit" data-theme={light ? 'light' : 'dark'}>
    <Head><title>{`${title} | Your private preview`}</title><meta name="robots" content="noindex,nofollow,noarchive" /></Head>
    <header className="private-visit-bar"><a href="/">{brand.siteName}</a><span>{title} · Private concept</span>
      <button type="button" onClick={() => setLight(value => !value)}>{light ? 'Dark' : 'Light'}</button></header>
    {mobile ? <section className="private-visit-entry atelier-code-panel"><h1>A bigger screen for the first look.</h1>
      <p>Your demo includes desktop and mobile layouts. Open this link on a desktop or laptop to explore both.</p><a href="/">Back to the studio</a></section>
    : visit ? <>
      <div className="private-visit-tools"><div role="group" aria-label="Preview layout">
        <button type="button" aria-pressed={!phone} onClick={() => setPhone(false)}>Desktop</button>
        <button type="button" aria-pressed={phone} onClick={() => setPhone(true)}>Mobile preview</button></div>
        <span aria-live="polite">{localPreview ? 'Local design preview · password temporarily disabled' : `${minutes} min left · ${visit.remaining} return visit${visit.remaining === 1 ? '' : 's'} left`}</span>
        <a href={`mailto:${brand.contactEmail}?subject=${encodeURIComponent(`${title} demo`)}`}>Talk to Ben</a></div>
      <div ref={stageRef} className={`private-visit-stage ${phone ? 'is-phone' : ''}`}>
        <div className="private-visit-frame" style={phone ? { width: 393 * phoneScale, height: 852 * phoneScale } : undefined}>
          <iframe title={`${title} ${phone ? 'iPhone 15' : 'desktop'} preview`} referrerPolicy="no-referrer"
            style={phone ? { transform: `scale(${phoneScale})` } : undefined}
            src={`/visit/${code}/content/${visit.token}/`} sandbox="allow-scripts allow-same-origin allow-popups" />
        </div>
      </div>
    </> : <section className="private-visit-entry atelier-code-panel">
      <span className="atelier-overview-label">Made for {title}</span><h1>Your next website, imagined.</h1>
      <p>A private, independent concept you can explore. Enter the four-digit access code Ben sent you.</p>
      <form onSubmit={unlock}><label htmlFor="access-code">Access code</label>
        <input id="access-code" type="password" inputMode="numeric" autoComplete="off" maxLength={4} pattern="[0-9]{4}" required
          value={accessCode} onChange={event => setAccessCode(event.target.value.replace(/\D/g, ''))} placeholder="••••" />
        {error && <p className="atelier-code-error" role="alert">{error}</p>}
        <StepButton type="submit" disabled={busy || accessCode.length !== 4}>{busy ? 'Opening…' : 'Explore the preview'}</StepButton>
      </form><p className="private-visit-note">Two visits. An hour to explore each time. This preview stays private.</p>
      <a href={`mailto:${brand.contactEmail}?subject=${encodeURIComponent(`${title} demo access`)}`}>Need an access code? Email Ben.</a>
    </section>}
  </div>;
}
