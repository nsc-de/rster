import { ConversionRegister } from "../conversion";
import {
  AllowAnyTypeInformation,
  JsonCompatible,
  JsonCompatibleObject,
  PrimitiveType,
  SendMethod,
  TypeInformation,
} from "../types";

/**
 * Type for defining an object with specific properties
 *
 * @typeParam T - The object type
 */
export class ObjectTypeInformation<
  T extends {
    [key: string]: { required: boolean; type: AllowAnyTypeInformation };
  }
> extends TypeInformation<{ [key in keyof T]: T[key]["type"] }> {
  constructor(public readonly properties: T) {
    super();
  }

  check(value: any): value is { [key in keyof T]: T[key]["type"] } {
    return (
      typeof value === "object" &&
      Object.keys(this.properties).every((key) => {
        const property = this.properties[key];
        return !property.required || property.type.check(value[key]);
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

  get type(): { [key in keyof T]: PrimitiveType<T[key]["type"]> } {
    return Object.keys(this.properties).reduce((acc, key) => {
      const value = this.properties[key];
      acc[key] = value.type.type;
      return acc;
    }, {} as any);
  }

  get identifier(): string {
    return "object";
  }

  exportToString(value: { [key in keyof T]: T[key]["type"] }): string {
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

  importFromString(value: string): { [key in keyof T]: T[key]["type"] } {
    return ConversionRegister.instance.deepImportObjectFromString(
      JSON.parse(value)
    ) as { [key in keyof T]: T[key]["type"] };
  }

  exportToJson(value: { [key in keyof T]: T[key]["type"] }): JsonCompatible {
    return Object.entries(value)
      .map(([key, value]) => [key, value, this.properties[key]])
      .map(([key, value, property]) => [key, property.type.exportToJson(value)])
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, JsonCompatible>);
  }

  importFromJson(value: JsonCompatible): { [key in keyof T]: T[key]["type"] } {
    if (Array.isArray(value) || typeof value !== "object" || value === null) {
      throw new Error(`Expected object, got ${typeof value}`);
    }

    return Object.entries(this.properties)
      .map(([key, property]) => {
        if (!(value as JsonCompatibleObject)[key] && property.required) {
          throw new Error(`Missing required property: ${key}`);
        }
        return [key, property.type.importFromJson(value)];
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, T[keyof T]["type"]>) as {
      [key in keyof T]: T[key]["type"];
    };
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
