import { ApiProperty } from '@nestjs/swagger';
import { Point } from '@/shared/geometry/point';
import { Polygon } from '@/shared/geometry/polygon';

export class LocationDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  public static createFromPoint(point: Point) {
    const dto = new LocationDto();
    dto.latitude = point.latitude;
    dto.longitude = point.longitude;
    return dto;
  }
}

export type PointDto = number[];

export type PolygonDto = number[][];

export function convertDtoToPoint(point: PointDto): Point {
  return new Point(point[0], point[1]);
}

export function convertDtoToPolygon(polygon: PolygonDto): Polygon {
  return new Polygon(polygon.map((point) => convertDtoToPoint(point)));
}
