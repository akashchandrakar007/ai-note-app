import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

global.prismaGlobal = global.prismaGlobal || prismaClientSingleton();

const prisma = global.prismaGlobal;

module.exports = prisma;

if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma;
