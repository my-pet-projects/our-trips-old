export const http = {
  request: <TResponse>(url: string, config: RequestInit) =>
    request<TResponse>(url, config),
};

async function request<TResponse>(
  url: string,
  config: RequestInit
): Promise<TResponse> {
  const response = await fetch(url, config);
  if (!response.ok) {
    console.error("error response", response);
    throw new Error(response.statusText);
  }
  return (await response.json()) as Promise<TResponse>;
}
