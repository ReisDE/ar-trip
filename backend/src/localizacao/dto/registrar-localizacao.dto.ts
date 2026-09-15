import { IsLatitude, IsLongitude, IsUUID } from 'class-validator';

export class RegistrarLocalizacaoDto {
  @IsUUID()
  viagemId: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
