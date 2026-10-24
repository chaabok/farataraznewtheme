import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, HttpCode,
} from "@nestjs/common";
import { FormsService } from "./forms.service";
import {
  AddFieldDto,
  CreateFormDto,
  RunScriptDto,
  SaveFormDataDto,
  UpdateFormDto,
} from "./forms.dto";

/** BFF forwards /api/advancedTools/** → dfb-service; full path prefix = "advancedTools". */
@Controller("advancedTools/forms")
export class FormsController {
  constructor(private readonly forms: FormsService) {}

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.forms.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFormDto) {
    return this.forms.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateFormDto) {
    return this.forms.update(id, dto);
  }

  /* specific routes FIRST (Nest matches in declaration order) */
  /** Task 53 — execute a form script (designer «اجرا و واکشی» + runtime prefill) */
  @Post("script/execute")
  @HttpCode(200)
  runScript(@Body() dto: RunScriptDto) {
    return this.forms.runScript(dto.script);
  }

  @Post(":id/fields")
  addField(@Param("id", ParseIntPipe) id: number, @Body() dto: AddFieldDto) {
    return this.forms.addField(id, dto);
  }

  @Delete("fields/:fieldId")
  @HttpCode(200)
  removeField(@Param("fieldId", ParseIntPipe) fieldId: number) {
    return this.forms.removeField(fieldId);
  }

  @Post(":id/data")
  saveData(@Param("id", ParseIntPipe) id: number, @Body() dto: SaveFormDataDto) {
    return this.forms.saveData(id, dto);
  }

  @Get(":id/data")
  loadData(@Param("id", ParseIntPipe) id: number, @Query("externalKey") externalKey?: string) {
    return this.forms.loadData(id, externalKey);
  }

  @Delete(":id")
  @HttpCode(200)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.forms.remove(id);
  }
}
