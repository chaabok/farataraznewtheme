import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import { RolesService } from "./roles.service";
import type { CreateRoleDto, UpdateRoleDto, BulkAssignmentsDto } from "./roles.dto";

@Controller("workflow-roles")
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  list() {
    return this.roles.list();
  }

  /* مسیرهای مشخص قبل از :id — جلوگیری از گیر کردن «assignments» در ParseIntPipe */
  @Get("assignments/:roleCode")
  listAssignments(@Param("roleCode") roleCode: string) {
    return this.roles.listAssignments(roleCode);
  }

  @Put("assignments")
  bulkAssignments(@Body() dto: BulkAssignmentsDto) {
    return this.roles.bulkAssignments(dto);
  }

  @Get(":id")
  getOne(@Param("id", ParseIntPipe) id: number) {
    return this.roles.getOne(BigInt(id));
  }

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.roles.create(dto);
  }

  @Put(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.roles.update(BigInt(id), dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.roles.remove(BigInt(id));
  }
}
