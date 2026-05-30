import { theme } from '../theme';

export function getWebflowField(item, keys) {
  for (const key of keys) {
    if (item?.[key] != null) return item[key];
    if (item?.fieldData?.[key] != null) return item.fieldData[key];
  }
  return null;
}

export function getWebflowImageUrl(item) {
  const candidates = [
    getWebflowField(item, ['image']),
    getWebflowField(item, ['main-image']),
    getWebflowField(item, ['mainImage']),
    getWebflowField(item, ['cover']),
    getWebflowField(item, ['thumbnail']),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate === 'string') return candidate;
    if (candidate?.url) return candidate.url;
    if (candidate?.src) return candidate.src;
    if (Array.isArray(candidate) && candidate.length > 0) {
      const first = candidate[0];
      if (typeof first === 'string') return first;
      if (first?.url) return first.url;
      if (first?.src) return first.src;
    }
  }

  return null;
}

function createId(item, index, prefix) {
  return item?._id || item?.id || item?.slug || getWebflowField(item, ['slug', 'name', 'title']) || `${prefix}-${index}`;
}

function normalizeAddressLines(rawAddress) {
  if (!rawAddress) return [];
  if (Array.isArray(rawAddress)) {
    return rawAddress.filter(Boolean).map((line) => String(line).trim()).filter(Boolean);
  }
  if (typeof rawAddress === 'string') {
    return rawAddress
      .split(/\r?\n|,/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeCampus(item, index = 0) {
  const name = getWebflowField(item, ['name', 'title']) || 'Campus';
  const colorKey = getWebflowField(item, ['colorKey', 'campusColorKey', 'campusKey']) || name;
  const addressLines = normalizeAddressLines(getWebflowField(item, ['addressLines', 'address', 'location', 'streetAddress']));

  return {
    id: createId(item, index, 'campus'),
    name,
    description: getWebflowField(item, ['description', 'summary', 'excerpt']) || '',
    addressLines,
    color: theme.campusColors[colorKey] || theme.colors.primary,
    imageUrl: getWebflowImageUrl(item),
  };
}

export function normalizeProduct(item, index = 0) {
  return {
    id: createId(item, index, 'product'),
    title: getWebflowField(item, ['name', 'title']) || 'Product',
    description: getWebflowField(item, ['summary', 'description', 'excerpt', 'body']) || '',
    price: String(getWebflowField(item, ['price', 'cost', 'amount']) || ''),
    imageUrl: getWebflowImageUrl(item),
  };
}

export function normalizeNews(item, index = 0) {
  return {
    id: createId(item, index, 'news'),
    title: getWebflowField(item, ['name', 'title']) || 'Nieuws',
    description: getWebflowField(item, ['summary', 'description', 'excerpt']) || '',
    summary: getWebflowField(item, ['summary', 'description', 'excerpt']) || '',
    text: getWebflowField(item, ['text', 'content', 'body', 'description']) || '',
    date: getWebflowField(item, ['date', 'publishedOn', 'published_at', '_createdOn']) || '',
    campus: getWebflowField(item, ['campus', 'campusName']) || '',
    campusColor: getWebflowField(item, ['campusColor']) || '',
    imageUrl: getWebflowImageUrl(item),
  };
}
