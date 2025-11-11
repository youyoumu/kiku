export const AnkiConnect = {
  call: async (action: string, params: Record<string, unknown> = {}) => {
    const res = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, version: 6, params }),
    });

    const result = (await res.json()) as { result: unknown; error?: string };
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  },
};
