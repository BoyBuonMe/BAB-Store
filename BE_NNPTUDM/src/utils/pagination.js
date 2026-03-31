class Pagination {
  apply(service) {
    if (!service.model) {
      throw Error("Model is require for pagination");
    }
    service.pagination = async ({ pageCount, limitCount, where = {}, include = {}, orderBy = {} }) => {
      const page = pageCount || 1;
      const limit = limitCount < 500 ? limitCount : 500;
      const offset = (page - 1) * limit;
      const data = await service.model.findMany({
        skip: offset,

        take: limit,

        where: where,

        include: include,

        orderBy: orderBy,
      });

      console.log("123");
      

      const total = await service.model.count({
        where: where,
      });

      const pagination = {
        current_page: page,
        total: total,
        per_page: limit,
      };

      if (data.length) {
        pagination.from = offset + 1;
        pagination.to = offset + data.length;
        pagination.total_pages = Math.ceil(total / limit);
      }
      
      return {
        data,
        pagination,
      };
    };
  }
}

module.exports = new Pagination();
