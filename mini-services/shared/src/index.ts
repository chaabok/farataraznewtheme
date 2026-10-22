/**
 * @erp/shared — single source of truth for the NestJS runtime world.
 *
 * Re-exporting the needed @nestjs/common + class-validator bindings from
 * here guarantees ONE copy of these packages across the gateway core and
 * all microservices. This is critical: exceptions thrown by service code
 * must be `instanceof` the same HttpException class the Nest core checks,
 * and decorator-registered validation metadata must live in the same
 * storage the ValidationPipe reads.
 *
 * Service rule of thumb: never `import ... from '@nestjs/common'` or
 * `'class-validator'` directly — always go through '@erp/shared'.
 *
 * (Explicit re-export list instead of `export *` to avoid any ambiguity
 * between the two upstream packages.)
 */

// ---- @nestjs/core (DI tokens only) ----
export { APP_GUARD } from '@nestjs/core';

// ---- @nestjs/common ----
export {
  // module & DI
  Module,
  Global,
  Injectable,
  Inject,
  Optional,
  SetMetadata,
  // controllers & routing
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Head,
  Options,
  All,
  HttpCode,
  HttpStatus,
  Redirect,
  Header,
  createParamDecorator,
  applyDecorators,
  // params
  Body,
  Param,
  Query,
  Headers,
  Session,
  Ip,
  Req,
  Res,
  Next,
  // pipes & exceptions & misc
  ValidationPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  RequestTimeoutException,
  InternalServerErrorException,
  NotAcceptableException,
  GoneException,
  HttpException,
  Logger,
  VersioningType,
} from '@nestjs/common';

// type-only re-exports (interfaces with no runtime binding)
export type {
  CanActivate,
  ExecutionContext,
  OnModuleInit,
  OnModuleDestroy,
  OnApplicationBootstrap,
  ArgumentMetadata,
  PipeTransform,
  Type,
} from '@nestjs/common';

// ---- class-validator (subset used by DTOs) ----
export {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsIn,
  IsEmail,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
  MinLength,
  MaxLength,
  ArrayNotEmpty,
  registerDecorator,
} from 'class-validator';

// ---- shared ERP kit ----
export { PublicApiKey, PublicJwt, IS_PUBLIC_API_KEY, IS_PUBLIC_JWT_KEY } from './decorators';
export { signAccessToken, verifyAccessToken } from './jwt';
export type { AccessTokenPayload, TokenSubject } from './jwt';
export { JwtAuthGuard, hasMetadata } from './jwt-auth.guard';
export { ApiKeyGuard } from './api-key.guard';
export { createRateLimiter } from './rate-limit';
export type { RateLimitRule, RateLimiterOptions } from './rate-limit';
export { bootstrapSecureService } from './bootstrap';
export type { SecureServiceOptions } from './bootstrap';
