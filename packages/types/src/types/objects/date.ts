import {
  Extends,
  JsonCompatible,
  SendMethod,
  TypeInformation,
} from "../../types";

/**
 * Type for defining a date
 */
export class DateTypeInformation extends TypeInformation<Date> {
  static readonly instance = new DateTypeInformation();

  constructor() {
    super();
  }

  check<T>(value: T): Extends<T, Date> {
    return (value instanceof Date) as Extends<T, Date>;
  }
  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(n?: SendMethod): SendMethod[] | boolean {
    if (n) {
      return this.sendableVia().includes(n);
    }
    return ["body"];
  }

  get identifier(): string {
    return "date";
  }

  exportToString(value: Date): string {
    return value.toISOString();
  }

  importFromString(value: string): Date {
    return new Date(value);
  }

  exportToJson(value: Date): JsonCompatible {
    return value.toISOString();
  }

  importFromJson(value: JsonCompatible): Date {
    return new Date(value as string);
  }

  toString() {
    return "DateTypeInformation{}";
  }

  json() {
    return {
      type: "date",
    };
  }
}

/**
 * Create a type information for a date
 * @returns A type information for a date
 */
export function date(): DateTypeInformation {
  return DateTypeInformation.instance;
}
