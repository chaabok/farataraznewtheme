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
} from '@nestjs/common';
import { IconsService } from './icons.service';
import { CreateIconDto } from './dto/create-icon.dto';

@Controller('icons')
export class IconsController {
  constructor(
    @Inject(IconsService) private readonly iconsService: IconsService,
  ) {}

  @Get()
  async findAll() {
    const icons = await this.iconsService.findAll();
    return { data: icons };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const icon = await this.iconsService.findOne(id);
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
