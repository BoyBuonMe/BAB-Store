export const getProductPrice = (product) => {
  const prices = product?.variants?.map((v) => v.price) || [];
  return prices.length ? Math.min(...prices) : 0;
};