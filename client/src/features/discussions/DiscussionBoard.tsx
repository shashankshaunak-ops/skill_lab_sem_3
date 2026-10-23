import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert, Button, Loading } from "../../components/Primitives";
import { useAuth } from "../../contexts/AuthContext";
import { errorMessage } from "../teams/api";
import { discussionApi, type DiscussionMessage } from "./api";

export function DiscussionBoard({ projectId, isMember }: { projectId: string; isMember: boolean }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [revision, setRevision] = useState(0);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!user || !isMember) { setMessages([]); return; }
    const controller = new AbortController();
    setLoading(true); setError("");
    discussionApi.list(projectId, controller.signal).then((result) => { if (!controller.signal.aborted) setMessages(result.messages); })
      .catch((caught: unknown) => { if (!controller.signal.aborted) { setMessages([]); setError(errorMessage(caught)); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [projectId, user, isMember, revision]);
  async function post(event: FormEvent) {
    event.preventDefault(); if (!content.trim() || busy) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      await discussionApi.post(projectId, content.trim());
      if (!mounted.current) return;
      setContent(""); setSuccess("Message posted."); setRevision((value) => value + 1);
    } catch (caught) { if (mounted.current) setError(errorMessage(caught)); }
    finally { if (mounted.current) setBusy(false); }
  }
  return <section className="content-card workspace-section" aria-labelledby="discussion-heading">
    <div className="section-heading"><h2 id="discussion-heading">Team discussion</h2>{user && isMember && <Button variant="secondary" disabled={loading || busy} onClick={() => setRevision((value) => value + 1)}>Refresh</Button>}</div>
    {!user || !isMember ? <p className="muted">Only team members can view and post messages.</p> : <>
      <p className="muted">Latest 100 messages, oldest first. Refresh to see new replies.</p>
      {error && <Alert>{error}</Alert>}{success && <Alert kind="success">{success}</Alert>}
      {loading ? <Loading label="Loading discussion..." /> : <ol className="workspace-list discussion-messages" aria-label="Discussion messages">{messages.length ? messages.map((message) => <li key={message._id} className="discussion-message"><div className="workspace-member"><strong>{message.authorId?.name ?? "Former student"}</strong><time className="muted" dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time></div><p>{message.content}</p></li>) : !error && <li className="muted">No messages yet. Start the discussion.</li>}</ol>}
      <form className="form-stack" onSubmit={post}><label>Message<textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} maxLength={2000} required disabled={busy} aria-describedby="message-help" /></label><span id="message-help" className="field-help">{content.length}/2,000 characters. Messages are visible only to your team.</span><div><Button type="submit" disabled={busy || !content.trim()}>{busy ? "Posting..." : "Post message"}</Button></div></form>
    </>}
  </section>;
}
