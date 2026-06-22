// Client for the AI workout summary (/api/summary, backed by Groq).

export type SummaryError = 'not_configured' | 'request_failed';

export async function fetchSummary(facts: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ facts }),
    });
  } catch {
    throw 'not_configured' as SummaryError;
  }

  if (res.status === 503) throw 'not_configured' as SummaryError;
  if (!res.ok) throw 'request_failed' as SummaryError;

  let data: { text?: string; error?: string };
  try {
    data = await res.json();
  } catch {
    throw 'not_configured' as SummaryError;
  }
  if (data.error) {
    throw (data.error === 'not_configured' ? 'not_configured' : 'request_failed') as SummaryError;
  }
  return data.text ?? '';
}
