import { ConversionRegister } from "../conversion";
import {
  AllowAnyTypeInformation,
  JsonCompatible,
  JsonCompatibleObject,
  PrimitiveType,
  SendMethod,
  TypeInformation,
} from "../types";

type RemoveNeverProperties<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type ObjectType<
  T extends {
    [key: string]: { required: boolean; type: AllowAnyTypeInformation };
  }
> = RemoveNeverProperties<{
  [key in keyof T]: T[key]["required"] extends true
    ? PrimitiveType<T[key]["type"]>
    : never;
}> &
  Partial<
    RemoveNeverProperties<{
      [key in keyof T]: T[key]["required"] extends false
        ? PrimitiveType<T[key]["type"]>
        : never;
    }>
  >;

/**
 * Type for defining an object with specific properties
 *
 * @typeParam T - The object type
 */
export class ObjectTypeInformation<
  T extends {
    [key: string]: { required: boolean; type: AllowAnyTypeInformation };
  }
> extends TypeInformation<ObjectType<T>> {
  constructor(public readonly properties: T) {
    super();
  }

  check(value: any): value is ObjectType<T> {
    return (
      typeof value === "object" &&
      Object.keys(this.properties).every((key) => {
        const property = this.properties[key];
        return (
          (!property.required && value[key] === undefined) || // optional property
          property.type.check(value[key])
        );
      })
    );
  }

  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(m?: SendMethod): SendMethod[] | boolean {
    if (m) {
      return this.sendableVia().includes(m);
    }
    return ["body"];
  }

  get identifier(): string {
    return "object";
  }

  exportToString(value: ObjectType<T>): string {
    return JSON.stringify(
      ConversionRegister.instance.deepExportObjectToString(
        value,
        (it) =>
          typeof it === "boolean" ||
          typeof it === "number" ||
          typeof it === "string" ||
          it === "null"
      )
    );
  }

  importFromString(value: string): ObjectType<T> {
    return ConversionRegister.instance.deepImportObjectFromString(
      JSON.parse(value)
    ) as ObjectType<T>;
  }

  exportToJson(value: ObjectType<T>): JsonCompatible {
    if (Array.isArray(value) || typeof value !== "object" || value === null) {
      throw new Error(`Expected object, got ${typeof value}`);
    }
    const value_: Record<string, unknown> = value;

    return Object.entries(this.properties)
      .map(([key, property]) => {
        if (!value_[key] && property.required) {
          throw new Error(`Missing required property: ${key}`);
        }
        return { key, value: property.type.exportToJson(value_[key]) };
      })
      .reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as JsonCompatibleObject);
  }

  importFromJson(value: JsonCompatible): ObjectType<T> {
    if (Array.isArray(value) || typeof value !== "object" || value === null) {
      throw new Error(`Expected object, got ${typeof value}`);
    }

    return Object.entries(this.properties)
      .map(([key, property]) => {
        if (!(value as JsonCompatibleObject)[key] && property.required) {
          throw new Error(`Missing required property: ${key}`);
        }
        return { key, value: property.type.importFromJson(value) };
      })
      .reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, unknown>) as ObjectType<T>;
  }

  toString() {
    return `ObjectTypeInformation{${Object.entries(this.properties)
      .map(
        ([key, value]) =>
          `${key}: {required: ${value.required}, type: ${value.type}}`
      )
      .join(", ")}}`;
  }

  json() {
    return {
      type: "object",
      properties: Object.fromEntries(
        Object.entries(this.properties).map(([key, value]) => [
          key,
          {
            required: value.required,
            type: value.type.json(),
          },
        ])
      ),
    };
  }

  /**
   * Create a type information for this object with all properties optional
   * @returns A type information for this object with all properties optional
   */
  allOptional() {
    return new ObjectTypeInformation(
      Object.fromEntries(
        Object.entries(this.properties).map(([key, value]) => [
          key,
          { required: false, type: value.type },
        ])
      ) as {
        [key in keyof T]: { required: false; type: T[key]["type"] };
      }
    );
  }

  /**
   * Create a type information for this object with all properties required
   * @returns A type information for this object with all properties required
   */
  allRequired() {
    return new ObjectTypeInformation(
      Object.fromEntries(
        Object.entries(this.properties).map(([key, value]) => [
          key,
          { required: true, type: value.type },
        ])
      ) as {
        [key in keyof T]: { required: true; type: T[key]["type"] };
      }
    );
  }

  /**
   * Get keys of this object
   * @returns Keys of this object
   */
  keys(): (keyof T)[] {
    return Object.keys(this.properties) as (keyof T)[];
  }
}

/**
 * Create a type information for an object with specific properties
 * @param properties - The properties of the object
 * @returns A type information for an object with specific properties
 */
export function object<
  T extends {
    [key: string]: { required: boolean; type: AllowAnyTypeInformation };
  }
>(properties: T): ObjectTypeInformation<T> {
  return new ObjectTypeInformation<T>(properties);
}
