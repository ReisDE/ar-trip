import { SetMetadata } from '@nestjs/common';

export const Roles = (...papeis: string[]) => SetMetadata('papeis', papeis);
