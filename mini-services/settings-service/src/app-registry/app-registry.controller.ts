import { Controller, Get } from "@nestjs/common";
import { AppRegistryService } from "./app-registry.service";

/** Guarded by the global InternalAuthGuard — only the signed BFF reaches this. */
@Controller("app-registry")
export class AppRegistryController {
  constructor(private readonly registry: AppRegistryService) {}

  @Get()
  list() {
    return this.registry.list();
  }
}
