// frontend/utils/api.ts
export async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });

  if (res.status === 401) {
    // You can optionally trigger refresh logic here
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}
