import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@erp/shared';
import { PublicJwt } from '@erp/shared';
import { SetupService } from './setup.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { SetInstalledDto } from './dto/set-installed.dto';

/**
 * Installation settings endpoints — every route requires the internal
 * API key (injected by the BFF gateway) AND a valid user JWT, except
 * the health check. GETs also require JWT: installation topology is
 * sensitive configuration.
 */
@Controller('setup')
export class SetupController {
  constructor(
    @Inject(SetupService) private readonly setupService: SetupService,
  ) {}

  @Get('health')
  @PublicJwt()
  health() {
    return { status: 'ok', service: 'setup-service' };
  }

  @Get('overview')
  async overview() {
    const data = await this.setupService.overview();
    return { data };
  }

  @Put('services/:moduleKey')
  async setInstalled(
    @Param('moduleKey') moduleKey: string,
    @Body() dto: SetInstalledDto,
  ) {
    const result = await this.setupService.setInstalled(moduleKey, dto);
    return { data: result };
  }

  @Get('services/:moduleKey/records')
  async listRecords(
    @Param('moduleKey') moduleKey: string,
    @Query('database') database?: string,
  ) {
    const data = await this.setupService.listRecords(
      moduleKey,
      database === 'main' || database === 'secondary' ? database : undefined,
    );
    return { data };
  }

  @Post('services/:moduleKey/records')
  @HttpCode(HttpStatus.CREATED)
  async addRecord(
    @Param('moduleKey') moduleKey: string,
    @Body() dto: CreateRecordDto,
  ) {
    const data = await this.setupService.addRecord(moduleKey, dto);
    return { data };
  }

  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  async exchange(@Body() dto: ExchangeDto) {
    const data = await this.setupService.exchange(dto);
    return { data };
  }
}
