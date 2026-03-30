const prisma = require("@/libs/prisma");
const paginationService = require("@/utils/pagination");

const productService = {
  model: prisma.product,

  findAllProducts: async function () {
    return this.pagination({
      // pageCount: page,

      // limitCount: limit,

      include: {
        brand: true,

        category: true,

        images: true,

        variants: true,
      },
    });
  },

  findCategories: async () => {
    const categories = await prisma.category.findMany();
    return categories;
  },

  findBrands: async () => {
    const brands = await prisma.brand.findMany();
    return brands;
  },
};

paginationService.apply(productService);

module.exports = productService;
