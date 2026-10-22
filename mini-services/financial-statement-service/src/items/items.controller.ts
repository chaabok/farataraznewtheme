import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@erp/shared';
import { ItemsService } from './items.service';
import { CreateItemDto } from './create-item.dto';

/**
 * All routes require a valid user JWT **and** the internal API key
 * (injected server-side by the BFF gateway). See app.module guards.
 */
@Controller('items')
export class ItemsController {
  constructor(
    @Inject(ItemsService) private readonly itemsService: ItemsService,
  ) {}

  @Get()
  async findAll() {
    const data = await this.itemsService.findAll();
    return { data };
  }

  @Get('stats')
  async stats() {
    const data = await this.itemsService.stats();
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateItemDto) {
    const data = await this.itemsService.create(dto);
    return { data };
  }
}
