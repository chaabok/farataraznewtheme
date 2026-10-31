import { Global, Module } from "@nestjs/common";
import { EntityLinkService } from "./entity-link.service";

@Global()
@Module({
  providers: [EntityLinkService],
  exports: [EntityLinkService],
})
export class EntityLinkModule {}
