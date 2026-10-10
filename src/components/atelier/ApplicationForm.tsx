import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowUpRight, Check, Loader2, Plus } from "lucide-react";

const EMPTY = { name: "", email: "", website: "", description: "" };
const PROJECT_TYPES = ["Website", "Reels & content", "App or extension", "Something else"];
const FAILED = "Your note couldn't be sent. Your answers are still here. Try again, or email contact@slowebdesign.com.";

/** Three essentials, optional context, and the existing studio inbox. */
export default function ApplicationForm() {
  const [fields, setFields] = useState(EMPTY);
  const [direction, setDirection] = useState("");
  const [botField, setBotField] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [sentTo, setSentTo] = useState("");
  const busy = useRef(false);
  const result = useRef<HTMLHeadingElement>(null);
  const error = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status === "sent") result.current?.focus();
    if (status === "error") error.current?.focus();
  }, [status]);

  const update = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((previous) => ({ ...previous, [event.target.name]: event.target.value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    if (!fields.name.trim() || !fields.description.trim()) {
      setStatus("error");
      setMessage("Add your name and a short note about the project.");
      return;
    }
    busy.current = true;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          name: fields.name.trim(),
          email: fields.email.trim(),
          description: fields.description.trim(),
          services: direction || "Project inquiry",
          botField,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setStatus("error");
        setMessage(response.status === 429
          ? "Too many attempts. Give it a few minutes, then try again. Your answers are saved here."
          : body.error === "invalid_email"
            ? "Check your email address so Ben can reply."
            : FAILED);
        return;
      }
      setSentTo(fields.email.trim());
      setFields(EMPTY);
      setDirection("");
      setBotField("");
      setStatus("sent");
    } catch {
      setStatus("error");
      setMessage(FAILED);
    } finally {
      busy.current = false;
    }
  };

  if (status === "sent") {
    return (
      <div className="atelier-inquiry is-sent" role="status">
        <Check className="atelier-inquiry-check" size={28} aria-hidden="true" />
        <h3 ref={result} tabIndex={-1}>Your project is in.</h3>
        <p>Ben will read your note and reply to <strong>{sentTo}</strong> with the next step.
          Nothing is booked or charged at this point.</p>
        <button className="atelier-inquiry-reset" type="button" onClick={() => setStatus("idle")}>Send another project</button>
      </div>
    );
  }

  return (
    <form className="atelier-inquiry" onSubmit={submit} aria-labelledby="apply-title" aria-busy={status === "sending"}>
      <header className="atelier-inquiry-head">
        <h3 id="apply-title">A little about your idea.</h3>
        <p>Three things to get the conversation started.</p>
      </header>
      <div aria-hidden="true" className="atelier-honeypot">
        <label htmlFor="apply-bot">Leave this empty</label>
        <input id="apply-bot" name="botField" tabIndex={-1} autoComplete="off" value={botField} onChange={(event) => setBotField(event.target.value)} />
      </div>
      <fieldset className="atelier-inquiry-fields" disabled={status === "sending"}>
        <div className="atelier-inquiry-field">
          <label htmlFor="apply-name">Your name</label>
          <input id="apply-name" name="name" value={fields.name} onChange={update} required maxLength={200} autoComplete="name" placeholder="What should we call you?" />
        </div>
        <div className="atelier-inquiry-field">
          <label htmlFor="apply-email">Your email</label>
          <input id="apply-email" name="email" type="email" inputMode="email" value={fields.email} onChange={update} required maxLength={320} autoComplete="email" placeholder="Where Ben can reply" />
        </div>
        <div className="atelier-inquiry-field">
          <label htmlFor="apply-description">What would you like to make happen?</label>
          <textarea id="apply-description" name="description" value={fields.description} onChange={update} required rows={3} maxLength={5000}
            placeholder="The idea, the problem, or the thing you're ready to change. A few sentences is plenty." />
        </div>
        <details className="atelier-inquiry-details">
          <summary><Plus size={16} aria-hidden="true" />Add a project type or link <span>Optional</span></summary>
          <fieldset className="atelier-inquiry-types">
            <legend>What kind of project?</legend>
            <div>{PROJECT_TYPES.map((type) => (
              <label key={type}>
                <input type="radio" name="direction" value={type} checked={direction === type} onChange={() => setDirection(type)} />
                <span>{type}</span>
              </label>
            ))}</div>
          </fieldset>
          <div className="atelier-inquiry-field">
            <label htmlFor="apply-website">A useful link <small>Optional</small></label>
            <input id="apply-website" name="website" inputMode="url" value={fields.website} onChange={update} maxLength={500}
              placeholder="Your current site, or something you like" />
          </div>
        </details>
      </fieldset>
      {status === "error" && <p ref={error} tabIndex={-1} className="atelier-inquiry-error" role="alert">{message}</p>}
      <div className="atelier-inquiry-foot">
        <button className="atelier-inquiry-submit" type="submit" disabled={status === "sending"}>
          <span>{status === "sending" ? "Sending your project" : "Send my project"}</span>
          {status === "sending" ? <Loader2 className="is-spinning" size={20} aria-hidden="true" /> : <ArrowUpRight size={20} aria-hidden="true" />}
        </button>
        <p>Your note goes directly to Ben. No commitment, no payment.</p>
      </div>
    </form>
  );
}
