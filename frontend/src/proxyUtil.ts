// Hack until I can get proxying working
const absoluteFetch =
  (
    fetch: (
      input: RequestInfo,
      init?: RequestInit | undefined
    ) => Promise<Response>
  ) =>
  (baseUrl: string) =>
  (url: RequestInfo, params: RequestInit | undefined) => {
    if (typeof url === 'string' && url.startsWith('/')) {
      return fetch(baseUrl + url, params)
    }
    return fetch(url, params)
  }

export default absoluteFetch(fetch)('http://localhost:8000')
