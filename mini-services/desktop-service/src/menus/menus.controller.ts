import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@erp/shared';
import { PublicJwt } from '@erp/shared';
import { MenusService } from './menus.service';

/**
 * Module keys are the camelCase ids shared with the frontend registry
 * (settings, accounting, payment, inventory, sales, fixedAsset,
 * procurement, order, costing, financialStatement, ...).
 */
const MODULE_KEY_PATTERN = /^[a-z][a-zA-Z0-9]{0,49}$/;

@Controller('menus')
export class MenusController {
  constructor(
    @Inject(MenusService) private readonly menusService: MenusService,
  ) {}

  /**
   * Localized menus + forms of one desktop module (module flyout menu).
   *
   * Reading requires the internal API key (injected by the gateway) but
   * works without a user JWT — same policy as GET /api/icons. `moduleKey`
   * is whitelisted against a strict pattern and `locale` falls back to the
   * supported set (fa|en|tr|ar) inside the service.
   */
  @Get(':moduleKey')
  @PublicJwt()
  async findModule(
    @Param('moduleKey') moduleKey: string,
    @Query('locale') locale?: string,
  ) {
    if (!MODULE_KEY_PATTERN.test(moduleKey)) {
      throw new BadRequestException('Invalid module key');
    }
    const payload = await this.menusService.findByModule(moduleKey, locale);
    if (payload.menus.length === 0) {
      throw new NotFoundException(
        `No menus defined for module "${moduleKey}"`,
      );
    }
    return { data: payload };
  }
}
