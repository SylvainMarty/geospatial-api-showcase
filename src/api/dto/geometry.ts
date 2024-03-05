import { ApiProperty } from '@nestjs/swagger';
import { Point } from '@/shared/geometry/point';
import { Polygon } from '@/shared/geometry/polygon';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

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

@ValidatorConstraint()
export class IsPolygon implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public validate(polygon: PolygonDto, args: ValidationArguments) {
    if (!Array.isArray(polygon) || polygon.length === 0) {
      return false;
    }
    for (const point of polygon) {
      if (
        !Array.isArray(point) ||
        point.length != 2 ||
        typeof point[0] !== 'number' ||
        typeof point[1] !== 'number'
      ) {
        return false;
      }
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'A polygon must be an array of array with 2 floating numbers: [[latitude1, longitude1], [latitude2, longitude2]]';
  }
}
