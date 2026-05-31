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

function normalizeImageUrl(raw) {
  if (!raw) return null;
  let url = null;
  if (typeof raw === 'string') url = raw;
  else if (raw?.url) url = raw.url;
  else if (raw?.src) url = raw.src;
  else if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0];
    url = typeof first === 'string' ? first : (first?.url || first?.src || null);
  }
  if (!url) return null;
  // Fix protocol-relative URLs
  if (url.startsWith('//')) url = 'https:' + url;
  // Some webflow urls can be objects with fields - return as string if possible
  return String(url);
}

function createId(item, index, prefix) {
  return item?._id || item?.id || item?.slug || getWebflowField(item, ['slug', 'name', 'title']) || `${prefix}-${index}`;
}

function normalizeAddressLines(rawAddress) {
  if (!rawAddress) return [];
  if (Array.isArray(rawAddress)) {
    return rawAddress
      .filter(Boolean)
      .map((line) => sanitizeText(line))
      .filter(Boolean);
  }
  if (typeof rawAddress === 'string') {
    return rawAddress
      .split(/\r?\n|,/) 
      .map((line) => sanitizeText(line))
      .filter(Boolean);
  }
  // If it's an object, try common address shapes
  if (typeof rawAddress === 'object') {
    // If it's already a lines array
    if (Array.isArray(rawAddress.addressLines || rawAddress.lines)) {
      return (rawAddress.addressLines || rawAddress.lines)
        .filter(Boolean)
        .map((l) => sanitizeText(l))
        .filter(Boolean);
    }
    // Try common string properties
    const candidates = [
      rawAddress.address,
      rawAddress.streetAddress,
      rawAddress.street,
      rawAddress.line1,
      rawAddress.line2,
      rawAddress.city,
    ];
    const lines = candidates.filter(Boolean).map((c) => sanitizeText(c));
    if (lines.length) return lines;
  }
  return [];
}

function stripHtmlTags(str) {
  if (!str) return '';
  return String(str).replace(/<[^>]*>/g, '');
}

function decodeEntities(str) {
  if (!str) return '';
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function sanitizeText(raw) {
  if (raw == null) return '';
  try {
    const s = stripHtmlTags(raw);
    const cleaned = decodeEntities(s).trim();
    // Remove ID-like values (hex or long alphanumeric tokens) that sometimes appear as content
    if (/^[0-9a-fA-F_-]{8,}$/.test(cleaned)) return '';
    return cleaned;
  } catch (e) {
    return String(raw);
  }
}

export { sanitizeText, normalizeImageUrl };

export function formatDate(rawDate) {
  if (!rawDate) return '';
  // If already a Date object
  try {
    const candidate = typeof rawDate === 'string' ? rawDate.trim() : rawDate;
    // Try ISO parse
    const d = new Date(candidate);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('nl-BE', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    // Fallback: sanitize and return
    return sanitizeText(String(rawDate));
  } catch (e) {
    return sanitizeText(String(rawDate));
  }
}

export function normalizeCampus(item, index = 0) {
  const name = sanitizeText(getWebflowField(item, ['name', 'title']) || 'Campus');
  const colorKey = getWebflowField(item, ['colorKey', 'campusColorKey', 'campusKey']) || name;
  const addressLines = normalizeAddressLines(getWebflowField(item, ['addressLines', 'address', 'adress', 'location', 'streetAddress']));
  const focus = sanitizeText(getWebflowField(item, ['focus', 'description', 'summary', 'excerpt']) || '');

  return {
    id: createId(item, index, 'campus'),
    name,
    description: focus,
    focus,
    addressLines,
    color: theme.campusColors[colorKey] || theme.colors.primary,
    imageUrl: normalizeImageUrl(getWebflowImageUrl(item)),
  };
}

export function normalizeProduct(item, index = 0) {
  const rawPrice = getWebflowField(item, ['price', 'cost', 'amount', 'prijs']) || '';
  const formattedPrice = parseAndFormatPrice(rawPrice, item);
  const rawCategory = getWebflowField(item, ['category', 'categories', 'productCategory', 'type']) || [];
  const categoryIds = Array.isArray(rawCategory) ? rawCategory.filter(Boolean).map(String) : rawCategory ? [String(rawCategory)] : [];

  return {
    id: createId(item, index, 'product'),
    title: sanitizeText(getWebflowField(item, ['name', 'title']) || 'Product'),
    description: sanitizeText(getWebflowField(item, ['summary', 'description', 'excerpt', 'body']) || ''),
    category: categoryIds.join(' | '),
    categoryIds,
    price: formattedPrice,
    imageUrl: normalizeImageUrl(getWebflowImageUrl(item)),
  };
}

function parseAndFormatPrice(raw, itemFallback) {
  // raw may be empty; if so, try to find a candidate in the whole item
  let candidate = raw;
  if ((candidate == null || candidate === '') && itemFallback) {
    const found = findNumericCandidate(itemFallback, 3);
    candidate = found || '';
  }
  if (candidate == null || candidate === '') return '';
  if (typeof candidate === 'object' || Array.isArray(candidate)) {
    if (!Array.isArray(candidate) && candidate.value != null) {
      const numericValue = Number(String(candidate.value).replace(',', '.'));
      if (!isNaN(numericValue)) {
        const majorUnitValue = candidate.unit ? numericValue / 100 : numericValue;
        return new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(majorUnitValue);
      }
    }
    const nested = findNumericCandidate(candidate, 3);
    if (nested == null || nested === '') return '';
    candidate = nested;
  }
  const rawVal = candidate;
  // If already a number
  if (typeof rawVal === 'number' && !isNaN(rawVal)) {
    return new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rawVal);
  }
  // Try to extract numeric part from strings
  let s = String(rawVal);
  s = sanitizeText(s);
  // Remove currency symbols and spaces
  s = s.replace(/[^0-9.,-]/g, '');
  if (!s) return '';
  // Heuristic: if both '.' and ',' exist, assume '.' is thousand sep and ',' is decimal
  if (s.indexOf('.') !== -1 && s.indexOf(',') !== -1) {
    s = s.replace(/\./g, '');
    s = s.replace(/,/g, '.');
  } else if (s.indexOf(',') !== -1 && s.indexOf('.') === -1) {
    // comma as decimal
    s = s.replace(/,/g, '.');
  } else {
    // only dots or only digits - remove non-digit
    s = s.replace(/[^0-9.-]/g, '');
  }
  const n = parseFloat(s);
  if (isNaN(n)) return '';
  return new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function findNumericCandidate(obj, depth = 2) {
  if (!obj || depth < 0) return null;
  if (typeof obj === 'number') return obj;
  if (typeof obj === 'string') {
    // quick test for numbers inside string
    if (/[0-9]+[\.,]?[0-9]*/.test(obj)) return obj;
    return null;
  }
  if (Array.isArray(obj)) {
    for (const v of obj) {
      const f = findNumericCandidate(v, depth - 1);
      if (f) return f;
    }
    return null;
  }
  // object
  for (const k of Object.keys(obj)) {
    // skip large or irrelevant keys
    if (typeof obj[k] === 'object' && obj[k] && Object.keys(obj[k]).length > 50) continue;
    const f = findNumericCandidate(obj[k], depth - 1);
    if (f) return f;
  }
  return null;
}

export function normalizeNews(item, index = 0) {
  const rawDate = getWebflowField(item, ['dateValue', 'date', 'publishedOn', 'published_at', '_createdOn']) || '';
  return {
    id: createId(item, index, 'news'),
    title: sanitizeText(getWebflowField(item, ['name', 'title']) || 'Nieuws'),
    description: sanitizeText(getWebflowField(item, ['summary', 'description', 'excerpt']) || ''),
    summary: sanitizeText(getWebflowField(item, ['summary', 'description', 'excerpt']) || ''),
    text: sanitizeText(getWebflowField(item, ['text', 'content', 'body', 'description']) || ''),
    date: formatDate(rawDate),
    dateValue: rawDate,
    category: sanitizeText(getWebflowField(item, ['category', 'categories', 'newsCategory', 'type']) || 'Alle'),
    campus: getWebflowField(item, ['campus', 'campusName']) || '',
    campusColor: getWebflowField(item, ['campusColor']) || '',
    imageUrl: normalizeImageUrl(getWebflowImageUrl(item)),
  };
}
