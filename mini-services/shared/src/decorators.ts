import { SetMetadata } from '@nestjs/common';

/**
 * Metadata keys used by the global guards.
 * A route decorated with these skips the corresponding security layer.
 */
export const IS_PUBLIC_JWT_KEY = 'erp:public-jwt';
export const IS_PUBLIC_API_KEY = 'erp:public-api-key';

/** Skip JWT authentication (route still requires the internal API key). */
export const PublicJwt = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_JWT_KEY, true);

/** Skip the internal API-key check (route still requires JWT by default). */
export const PublicApiKey = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_API_KEY, true);
