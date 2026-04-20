const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;
const writeToken = process.env.SANITY_WRITE_TOKEN!;

const BASE_URL = `https://${projectId}.api.sanity.io/v${apiVersion}`;

interface SanityMutationResult {
  transactionId: string;
  documentId: string;
}

export async function createDocument(
  doc: Record<string, unknown>,
  isDraft: boolean
): Promise<SanityMutationResult> {
  const docId = crypto.randomUUID();
  const _id = isDraft ? `drafts.${docId}` : docId;

  const body = {
    mutations: [
      {
        createOrReplace: {
          ...doc,
          _id,
        },
      },
    ],
  };

  const res = await fetch(`${BASE_URL}/data/mutate/${dataset}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${writeToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Sanity mutation failed: ${error}`);
  }

  const result = await res.json();
  return {
    transactionId: result.transactionId,
    documentId: _id,
  };
}

interface SanityImageAsset {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
}

export async function uploadImage(
  imageBuffer: Buffer,
  filename: string,
  contentType: string = "image/png"
): Promise<SanityImageAsset> {
  const res = await fetch(
    `${BASE_URL}/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Authorization: `Bearer ${writeToken}`,
      },
      body: imageBuffer as any,
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Sanity image upload failed: ${error}`);
  }

  const result = await res.json();
  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: result.document._id,
    },
  };
}

export async function fetchCategories(): Promise<
  Array<{ _id: string; title: string }>
> {
  const query = encodeURIComponent('*[_type == "category"]{_id, title}');
  const res = await fetch(`${BASE_URL}/data/query/${dataset}?query=${query}`, {
    headers: { Authorization: `Bearer ${writeToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.result;
}

export async function fetchAuthors(): Promise<
  Array<{ _id: string; name: string }>
> {
  const query = encodeURIComponent('*[_type == "author"]{_id, name}');
  const res = await fetch(`${BASE_URL}/data/query/${dataset}?query=${query}`, {
    headers: { Authorization: `Bearer ${writeToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch authors");
  const data = await res.json();
  return data.result;
}
