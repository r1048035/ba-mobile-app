const WEBFLOW_TOKEN = process.env.EXPO_PUBLIC_WEBFLOW_TOKEN;
const WEBFLOW_SITE_ID = process.env.EXPO_PUBLIC_WEBFLOW_SITE_ID;
const WEBFLOW_PRODUCTS_COLLECTION_ID = process.env.EXPO_PUBLIC_WEBFLOW_PRODUCTS_COLLECTION_ID;
const WEBFLOW_NEWS_COLLECTION_ID = process.env.EXPO_PUBLIC_WEBFLOW_NEWS_COLLECTION_ID;
const WEBFLOW_CAMPUSES_COLLECTION_ID = process.env.EXPO_PUBLIC_WEBFLOW_CAMPUSES_COLLECTION_ID;

let cachedSkuCollectionId = null;
let cachedSkuPriceMap = null;

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

async function getSkuCollectionId() {
  if (cachedSkuCollectionId) return cachedSkuCollectionId;

  if (!WEBFLOW_SITE_ID || !WEBFLOW_TOKEN) {
    throw new Error('Missing Webflow config');
  }

  const response = await webflowFetch('/collections');
  const collections = response.collections || response.items || [];
  const skuCollection = collections.find((collection) => {
    const displayName = String(collection.displayName || '').toLowerCase();
    const singularName = String(collection.singularName || '').toLowerCase();
    const slug = String(collection.slug || '').toLowerCase();
    return slug === 'sku' || displayName === 'skus' || singularName === 'sku';
  });

  if (!skuCollection?.id) {
    throw new Error('Missing Webflow SKU collection');
  }

  cachedSkuCollectionId = skuCollection.id;
  return cachedSkuCollectionId;
}

function formatSkuPrice(priceField) {
  if (!priceField) return '';

  if (typeof priceField === 'number' && !isNaN(priceField)) {
    return new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(priceField / 100);
  }

  if (typeof priceField === 'object') {
    const rawValue = priceField.value ?? priceField.amount ?? priceField.price ?? null;
    const numericValue = Number(String(rawValue ?? '').replace(',', '.'));
    if (!isNaN(numericValue)) {
      return new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericValue / 100);
    }
  }

  const fallbackValue = Number(String(priceField).replace(',', '.'));
  if (!isNaN(fallbackValue)) {
    return new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(fallbackValue / 100);
  }

  return '';
}

async function getSkuPriceMap() {
  if (cachedSkuPriceMap) return cachedSkuPriceMap;

  const skuCollectionId = await getSkuCollectionId();
  const skuItems = await fetchAllCollectionItems(skuCollectionId);
  const priceMap = new Map();

  skuItems.forEach((skuItem) => {
    const productId = skuItem?.fieldData?.product;
    const price = formatSkuPrice(skuItem?.fieldData?.price);
    if (productId && price) {
      priceMap.set(productId, price);
    }
  });

  cachedSkuPriceMap = priceMap;
  return cachedSkuPriceMap;
}

async function getSkuItemById(skuId) {
  if (!skuId) return null;
  const skuCollectionId = await getSkuCollectionId();
  return webflowFetch(`/collections/${skuCollectionId}/items/${skuId}`);
}

async function attachSkuPriceToProduct(productItem) {
  if (!productItem) return productItem;

  const skuId = productItem?.fieldData?.['default-sku'] || productItem?.fieldData?.defaultSku || productItem?.defaultSku;
  if (!skuId) return productItem;

  try {
    const skuItem = await getSkuItemById(skuId);
    const price = formatSkuPrice(skuItem?.fieldData?.price);
    if (!price) return productItem;
    return {
      ...productItem,
      price,
      fieldData: {
        ...productItem.fieldData,
        price,
      },
    };
  } catch (error) {
    return productItem;
  }
}

export async function fetchWebflowProducts() {
  if (!WEBFLOW_SITE_ID || !WEBFLOW_TOKEN || !WEBFLOW_PRODUCTS_COLLECTION_ID) {
    throw new Error('Missing Webflow products config');
  }

  const items = await fetchAllCollectionItems(WEBFLOW_PRODUCTS_COLLECTION_ID);
  const skuPriceMap = await getSkuPriceMap();
  const enrichedItems = items.map((item) => {
    const price = skuPriceMap.get(item?.id);
    if (!price) return item;
    return {
      ...item,
      price,
      fieldData: {
        ...item.fieldData,
        price,
      },
    };
  });
  try {
    console.log('[webflow] fetchWebflowProducts:', { collectionId: WEBFLOW_PRODUCTS_COLLECTION_ID, count: enrichedItems.length, sample: enrichedItems.slice(0, 5).map(i => i._id || i.id || i.slug) });
  } catch (e) {
    // ignore logging errors
  }
  return { items: enrichedItems };
}

export async function getProductById(itemId) {
  if (!WEBFLOW_SITE_ID || !WEBFLOW_TOKEN || !WEBFLOW_PRODUCTS_COLLECTION_ID) {
    throw new Error('Missing Webflow products config');
  }
  const path = `/collections/${WEBFLOW_PRODUCTS_COLLECTION_ID}/items/${itemId}`;
  const item = await webflowFetch(path);
  const enrichedItem = await attachSkuPriceToProduct(item);
  try {
    console.log('[webflow] getProductById:', { id: itemId, ok: !!enrichedItem });
  } catch (e) {}
  return enrichedItem;
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

export async function getItemById(collectionId, itemId) {
  if (!WEBFLOW_SITE_ID || !WEBFLOW_TOKEN || !collectionId) {
    throw new Error('Missing Webflow config');
  }
  const path = `/collections/${collectionId}/items/${itemId}`;
  const item = await webflowFetch(path);
  try { console.log('[webflow] getItemById', { collectionId, itemId, ok: !!item }); } catch (e) {}
  return item;
}

export async function getNewsById(itemId) {
  return getItemById(WEBFLOW_NEWS_COLLECTION_ID, itemId);
}

export async function getCampusById(itemId) {
  return getItemById(WEBFLOW_CAMPUSES_COLLECTION_ID, itemId);
}