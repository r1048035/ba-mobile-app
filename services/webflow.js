const WEBFLOW_TOKEN = process.env.EXPO_PUBLIC_WEBFLOW_TOKEN;
const WEBFLOW_SITE_ID = process.env.EXPO_PUBLIC_WEBFLOW_SITE_ID;
const WEBFLOW_PRODUCTS_COLLECTION_ID = process.env.EXPO_PUBLIC_WEBFLOW_PRODUCTS_COLLECTION_ID;
const WEBFLOW_NEWS_COLLECTION_ID = process.env.EXPO_PUBLIC_WEBFLOW_NEWS_COLLECTION_ID;
const WEBFLOW_CAMPUSES_COLLECTION_ID = process.env.EXPO_PUBLIC_WEBFLOW_CAMPUSES_COLLECTION_ID;

function buildWebflowUrl(path, params = {}) {
  const url = new URL(`https://api.webflow.com/v2/sites/${WEBFLOW_SITE_ID}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function webflowFetch(path, params = {}) {
  const response = await fetch(buildWebflowUrl(path, params), {
    headers: {
      Authorization: `Bearer ${WEBFLOW_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Webflow request failed: ${response.status}`);
  }

  return response.json();
}

async function fetchAllCollectionItems(collectionId) {
  const limit = 100;
  let offset = 0;
  const allItems = [];

  while (true) {
    const response = await webflowFetch(`/collections/${collectionId}/items`, { limit, offset });
    const items = response.items || response?.data?.items || [];
    allItems.push(...items);

    const total = response.pagination?.total ?? response.total;
    if (items.length < limit) break;
    if (typeof total === 'number' && allItems.length >= total) break;
    offset += limit;
  }

  return allItems;
}

export async function fetchWebflowProducts() {
  if (!WEBFLOW_SITE_ID || !WEBFLOW_TOKEN || !WEBFLOW_PRODUCTS_COLLECTION_ID) {
    throw new Error('Missing Webflow products config');
  }

  const items = await fetchAllCollectionItems(WEBFLOW_PRODUCTS_COLLECTION_ID);
  try {
    console.log('[webflow] fetchWebflowProducts:', { collectionId: WEBFLOW_PRODUCTS_COLLECTION_ID, count: items.length, sample: items.slice(0, 5).map(i => i._id || i.id || i.slug) });
  } catch (e) {
    // ignore logging errors
  }
  return { items };
}

export async function fetchWebflowNews() {
  if (!WEBFLOW_SITE_ID || !WEBFLOW_TOKEN || !WEBFLOW_NEWS_COLLECTION_ID) {
    throw new Error('Missing Webflow news config');
  }

  const items = await fetchAllCollectionItems(WEBFLOW_NEWS_COLLECTION_ID);
  return { items };
}

export async function fetchWebflowCampuses() {
  if (!WEBFLOW_SITE_ID || !WEBFLOW_TOKEN || !WEBFLOW_CAMPUSES_COLLECTION_ID) {
    throw new Error('Missing Webflow campuses config');
  }

  const items = await fetchAllCollectionItems(WEBFLOW_CAMPUSES_COLLECTION_ID);
  return { items };
}