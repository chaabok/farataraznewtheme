import { Module, Global } from "@nestjs/common";
import { PrismaService, createVersionedPrismaClient } from "./prisma.service";

@Global()
@Module({
  providers: [{ provide: PrismaService, useFactory: createVersionedPrismaClient }],
  exports: [PrismaService],
})
export class PrismaModule {}
