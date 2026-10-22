import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@erp/shared';
import { BusinessStructureService } from './business-structure.service';
import { RootSettingsDto, SaveNodeDto } from './dto/save-node.dto';

/**
 * Multi-company backbone (ساختار کسب و کار). All routes require a valid
 * user JWT **and** the internal API key (injected server-side by the BFF
 * gateway). See app.module guards.
 *
 *   GET    /api/business-structure                 → flat node list
 *   GET    /api/business-structure/settings        → root-only options
 *   POST   /api/business-structure                 → create (code server-side)
 *   PUT    /api/business-structure/root-settings   → root-only options (atomic)
 *   PUT    /api/business-structure/:id             → update editable fields
 *   DELETE /api/business-structure/:id             → delete (protections apply)
 */
@Controller('business-structure')
export class BusinessStructureController {
  constructor(
    @Inject(BusinessStructureService)
    private readonly service: BusinessStructureService,
  ) {}

  @Get()
  async list() {
    const data = await this.service.list();
    return { data };
  }

  @Get('settings')
  async getSettings() {
    const data = await this.service.getSettings();
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: SaveNodeDto) {
    const data = await this.service.create(dto);
    return { data };
  }

  /** Declared before `:id` routes so the literal segment wins. */
  @Put('root-settings')
  async updateRootSettings(@Body() dto: RootSettingsDto) {
    const data = await this.service.updateRootSettings(dto);
    return { data };
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveNodeDto,
  ) {
    const data = await this.service.update(id, dto);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
