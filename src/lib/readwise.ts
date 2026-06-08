interface SaveParams {
  url: string;
  title: string;
  tags?: string[];
  location?: 'new' | 'later' | 'archive';
}

interface SaveResult {
  success: boolean;
  alreadySaved: boolean;
  documentId?: string;
  error?: string;
}

export async function saveToReader(params: SaveParams): Promise<SaveResult> {
  const apiKey = process.env.READWISE_API_KEY;
  if (!apiKey) {
    return { success: false, alreadySaved: false, error: 'READWISE_API_KEY not configured' };
  }

  const res = await fetch('https://readwise.io/api/v3/save/', {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: params.url,
      title: params.title,
      tags: params.tags,
      location: params.location ?? 'new',
    }),
  });

  if (res.status === 200 || res.status === 201) {
    const data = await res.json();
    return {
      success: true,
      alreadySaved: data.document_already_exists ?? res.status === 200,
      documentId: data.data?.id,
    };
  }

  const text = await res.text();
  return { success: false, alreadySaved: false, error: `Readwise API error ${res.status}: ${text}` };
}
