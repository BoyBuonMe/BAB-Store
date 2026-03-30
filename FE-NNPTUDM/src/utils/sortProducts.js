import { getProductPrice } from "./getProductPrice";

export default function sortProducts(products = [], sort) {
  const cloned = [...products];

  switch (sort) {
    case "Giá tăng":
      return cloned.sort((a, b) => getProductPrice(a) - getProductPrice(b));

    case "Giá giảm":
      return cloned.sort((a, b) => getProductPrice(b) - getProductPrice(a));

    default:
      return cloned;
  }
}
