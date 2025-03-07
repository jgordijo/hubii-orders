import NodeCache from 'node-cache';

export const shippingCache = new NodeCache({
  stdTTL: 864000, // 24 hours to expire
});
