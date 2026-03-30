const prisma = require("@/libs/prisma");

const queueService = {
  push: async (job) => {
    const { type, payload } = job;

    await prisma.queue.create({
      data: {
        type,
        payload: JSON.stringify(payload),
      },
    });
  },

  getOnePending: async () => {
    const result = await prisma.queue.findFirst({
      where: {
        status: "pending",
      },
      orderBy: {
        id: "asc",
      },
    });

    return result;
  },

  updateStatusJob: async (id, status) => {
    const result = await prisma.queue.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return result;
  },
};

module.exports = queueService;
