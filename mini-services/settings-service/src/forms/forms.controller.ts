import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@erp/shared';
import { FormsService } from './forms.service';
import { SaveRecordDto } from './dto/save-record.dto';

/**
 * Database-driven form system (definition + fields + lookups + records).
 * All routes require a valid user JWT **and** the internal API key
 * (injected server-side by the BFF gateway). See app.module guards.
 */
@Controller('forms')
export class FormsController {
  constructor(
    @Inject(FormsService) private readonly formsService: FormsService,
  ) {}

  @Get(':moduleKey')
  async listDefinitions(
    @Param('moduleKey') moduleKey: string,
    @Query('locale') locale?: string,
  ) {
    const data = await this.formsService.listDefinitions(
      moduleKey,
      locale ?? 'fa',
    );
    return { data };
  }

  @Get(':moduleKey/:formKey')
  async getDefinition(
    @Param('moduleKey') moduleKey: string,
    @Param('formKey') formKey: string,
    @Query('locale') locale?: string,
  ) {
    const data = await this.formsService.getDefinition(
      moduleKey,
      formKey,
      locale ?? 'fa',
    );
    return { data };
  }

  @Get(':moduleKey/:formKey/records')
  async listRecords(
    @Param('moduleKey') moduleKey: string,
    @Param('formKey') formKey: string,
    @Query('locale') locale?: string,
    @Query('filters') filters?: string,
    @Query('yesLabel') yesLabel?: string,
    @Query('noLabel') noLabel?: string,
  ) {
    const data = await this.formsService.listRecords(
      moduleKey,
      formKey,
      locale ?? 'fa',
      filters,
      yesLabel ?? 'بلی',
      noLabel ?? 'خیر',
    );
    return { data };
  }

  /** Distinct display values of one column (filter-values dropdown). */
  @Get(':moduleKey/:formKey/fields/:fieldKey/values')
  async getFieldValues(
    @Param('moduleKey') moduleKey: string,
    @Param('formKey') formKey: string,
    @Param('fieldKey') fieldKey: string,
    @Query('locale') locale?: string,
    @Query('yesLabel') yesLabel?: string,
    @Query('noLabel') noLabel?: string,
  ) {
    const data = await this.formsService.getFieldValues(
      moduleKey,
      formKey,
      fieldKey,
      locale ?? 'fa',
      yesLabel ?? 'بلی',
      noLabel ?? 'خیر',
    );
    return { data };
  }

  @Post(':moduleKey/:formKey/records')
  @HttpCode(HttpStatus.CREATED)
  async createRecord(
    @Param('moduleKey') moduleKey: string,
    @Param('formKey') formKey: string,
    @Body() dto: SaveRecordDto,
  ) {
    const data = await this.formsService.createRecord(moduleKey, formKey, dto);
    return { data };
  }

  @Put(':moduleKey/:formKey/records/:recordId')
  async updateRecord(
    @Param('moduleKey') moduleKey: string,
    @Param('formKey') formKey: string,
    @Param('recordId') recordId: string,
    @Body() dto: SaveRecordDto,
  ) {
    const data = await this.formsService.updateRecord(
      moduleKey,
      formKey,
      recordId,
      dto,
    );
    return { data };
  }

  @Delete(':moduleKey/:formKey/records/:recordId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRecord(
    @Param('moduleKey') moduleKey: string,
    @Param('formKey') formKey: string,
    @Param('recordId') recordId: string,
  ): Promise<void> {
    await this.formsService.deleteRecord(moduleKey, formKey, recordId);
  }

  @Get(':moduleKey/:formKey/lookups/:lookupKey')
  async getLookupOptions(
    @Param('moduleKey') moduleKey: string,
    @Param('formKey') formKey: string,
    @Param('lookupKey') lookupKey: string,
    @Query('locale') locale?: string,
  ) {
    const data = await this.formsService.getLookupOptions(
      moduleKey,
      formKey,
      lookupKey,
      locale ?? 'fa',
    );
    return { data };
  }
}
