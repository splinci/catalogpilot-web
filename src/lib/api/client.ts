export async function apiClient<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  const contentType = response.headers.get("content-type") || "";
  let data: any = {};

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Authentication error (${response.status}): ${text.slice(0, 80)}`);
    }
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || "Authentication request failed.");
  }

  return data;
}