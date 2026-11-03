import { sessionToken } from "../../../shared/public/websiteAccess.js";
export async function api(url, body, method) {
  const response = await fetch(url, {
    method: method || (body ? 'POST' : 'GET'),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken() ? {
        Authorization: `Bearer ${sessionToken()}`
      } : {})
    },
    ...(body ? {
      body: JSON.stringify(body)
    } : {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(data.message || (response.status === 401 ? 'Open this app from Eco Sphere after signing in.' : 'The request could not be completed.'));
  return data;
}
export const money = value => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(Number(value || 0));
export const uid = () => crypto.randomUUID();
