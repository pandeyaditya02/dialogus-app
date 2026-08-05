const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;
const writeToken = process.env.SANITY_WRITE_TOKEN!;

const BASE_URL = `https://${projectId}.api.sanity.io/v${apiVersion}`;

interface SanityMutationResult {
  transactionId: string;
  documentId: string;
}

export async function createDraftDocument(
  doc: Record<string, unknown>
): Promise<SanityMutationResult> {
  const docId = crypto.randomUUID();
  const _id = `drafts.${docId}`;

  const body = {
    mutations: [
      {
        createIfNotExists: {
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
    throw new Error(`Sanity create mutation failed: ${error}`);
  }

  const result = await res.json();
  return {
    transactionId: result.transactionId,
    documentId: _id,
  };
}

export async function patchDraftDocument(
  documentId: string,
  doc: Record<string, unknown>
): Promise<SanityMutationResult> {
  const _id = documentId.startsWith("drafts.") ? documentId : `drafts.${documentId}`;

  const body = {
    mutations: [
      {
        patch: {
          id: _id,
          set: doc,
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
    throw new Error(`Sanity patch mutation failed: ${error}`);
  }

  const result = await res.json();
  return {
    transactionId: result.transactionId,
    documentId: _id,
  };
}

export async function getDraftDocument(
  documentId: string
): Promise<Record<string, any> | null> {
  const _id = documentId.startsWith("drafts.") ? documentId : `drafts.${documentId}`;
  const query = encodeURIComponent(
    `*[_id == "${_id}"][0]{
      _id,
      title,
      "slug": slug.current,
      description,
      body,
      "authorId": author._ref,
      "categoryId": category._ref,
      coverImage
    }`
  );

  const res = await fetch(`${BASE_URL}/data/query/${dataset}?query=${query}&perspective=raw`, {
    headers: { Authorization: `Bearer ${writeToken}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.result || null;
}

export async function createDocument(
  doc: Record<string, unknown>,
  isDraft: boolean,
  existingDocId?: string
): Promise<SanityMutationResult> {
  const rawId = existingDocId
    ? existingDocId.replace(/^drafts\./, "")
    : crypto.randomUUID();
  const _id = isDraft ? `drafts.${rawId}` : rawId;

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
