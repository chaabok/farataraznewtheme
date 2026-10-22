import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@erp/shared';
import { PublicJwt } from '@erp/shared';
import { IconsService } from './icons.service';
import { CreateIconDto } from './dto/create-icon.dto';

@Controller('icons')
export class IconsController {
  constructor(
    @Inject(IconsService) private readonly iconsService: IconsService,
  ) {}

  /**
   * Reading the icon list requires the internal API key (injected by the
   * gateway) but works without a user JWT (the login screen renders before
   * authentication). Mutations require a full JWT + API key.
   *
   * `locale` is whitelisted in the service (fa|en|tr|ar, default fa) and
   * resolves display names with a graceful fallback chain.
   */
  @Get()
  @PublicJwt()
  async findAll(@Query('locale') locale?: string) {
    const icons = await this.iconsService.findAll(locale);
    return { data: icons };
  }

  @Get(':id')
  @PublicJwt()
  async findOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ) {
    const icon = await this.iconsService.findOne(id, locale);
    if (!icon) {
      throw new NotFoundException(`Icon with id "${id}" not found`);
    }
    return { data: icon };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateIconDto) {
    const icon = await this.iconsService.create(dto);
    return { data: icon };
  }
}
