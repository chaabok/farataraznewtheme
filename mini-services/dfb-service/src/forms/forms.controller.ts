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

  /* specific literal routes FIRST (Nest matches in declaration order — a
     static path must never be shadowed by the ":id" parameter route) */

  /** Task 59 — connected-database schema tree (software → tables/views → fields) */
  @Get("schema/tree")
  schemaTree() {
    return this.forms.schemaTree();
  }

  /** Task 53 — execute a form script (designer «اجرا و واکشی» + runtime prefill) */
  @Post("script/execute")
  @HttpCode(200)
  runScript(@Body() dto: RunScriptDto) {
    return this.forms.runScript(dto.script);
  }

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

  /* Task 64 — MainDataGrid «فهرست کلّی»: حذف رکورد انتخاب‌شده */
  @Delete(":id/data/:dataId")
  @HttpCode(200)
  removeData(
    @Param("id", ParseIntPipe) id: number,
    @Param("dataId", ParseIntPipe) dataId: number,
  ) {
    return this.forms.removeData(id, dataId);
  }

  @Delete(":id")
  @HttpCode(200)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.forms.remove(id);
  }
}
