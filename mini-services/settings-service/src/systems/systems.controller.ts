import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { SystemsService } from "./systems.service";

/**
 * GET /systems       — all software, ordered by SortOrder
 * GET /systems/:code — one software by its unique Code
 * Guarded by the global InternalAuthGuard — only the signed BFF reaches this
 * (browser path: /api/settings/systems).
 */
@Controller("systems")
export class SystemsController {
  constructor(private readonly systems: SystemsService) {}

  @Get()
  list() {
    return this.systems.list();
  }

  @Get(":code")
  async byCode(@Param("code") code: string) {
    const item = await this.systems.byCode(code);
    if (!item) {
      throw new NotFoundException({
        statusCode: 404,
        message: `system "${code}" not found`,
        messageKey: "common.error",
      });
    }
    return { item };
  }
}
