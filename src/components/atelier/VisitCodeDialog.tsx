import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { StepButton } from './Step';

export default function VisitCodeDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState('');
  const [mobile, setMobile] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const viewport = window.matchMedia('(max-width: 800px)');
    const update = () => setMobile(viewport.matches);
    update();
    viewport.addEventListener('change', update);
    element?.showModal();
    return () => { viewport.removeEventListener('change', update); element?.close(); };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/visits/resolve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }), credentials: 'omit', cache: 'no-store',
      });
      if (!response.ok) throw new Error('That visit code wasn’t found. Check the six digits in your email.');
      window.location.assign(`/visit/${code}`);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Please try again.');
      setBusy(false);
    }
  }

  return <dialog ref={dialog} className="atelier-code-dialog" aria-labelledby="visit-code-title"
    onCancel={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <div className="atelier-code-panel">
      <button className="atelier-code-close" type="button" onClick={onClose} aria-label="Close visit code dialog"><X size={20} /></button>
      <span className="atelier-overview-label">Your private preview</span>
      <h2 id="visit-code-title">Have a visit code?</h2>
      {mobile && <p className="atelier-code-device-note">For the full preview on your phone, choose “Request Desktop Site” in your browser. You can still continue here.</p>}
      <form onSubmit={submit}>
        <p>Enter the six-digit visit code we sent you. Your personal access code comes next.</p>
        <label htmlFor="visit-code">Visit code</label>
        <input id="visit-code" autoFocus inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" maxLength={6}
          required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))}
          placeholder="000000" aria-describedby={error ? 'visit-code-error' : undefined} />
        {error && <p id="visit-code-error" className="atelier-code-error" role="alert">{error}</p>}
        <StepButton type="submit" disabled={busy || code.length !== 6}>{busy ? 'Finding your preview…' : 'Find my preview'}</StepButton>
      </form>
    </div>
  </dialog>;
}
