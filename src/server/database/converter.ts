import { DatabaseLevel0Value, DatabaseLevel1Value } from "./adapter";

export class ConversionSupportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversionSupportError";
  }
}

export function convertUndefined(value?: undefined) {
  return "$$undefined";
}

export function convertNull(value: null) {
  return "$$null";
}

export function convertDate(value: Date) {
  if (isNaN(value.getTime())) {
    throw new Error("Invalid date");
  }

  return `$$date:${value.toISOString()}`;
}

export function convertObject(value: object) {
  throw new ConversionSupportError("Objects are not supported");
}

export function convertArray(value: any[]) {
  throw new ConversionSupportError("Arrays are not supported");
}

export function convertBigInt(value: bigint) {
  return `$$bigint:${value.toString()}`;
}

export function convertSymbol(value: symbol) {
  return `$$symbol:${value.toString()}`;
}

export function restoreStringLevel1(value: string): DatabaseLevel1Value {
  if (value === "$$undefined") {
    return undefined;
  }

  if (value === "$$null") {
    return null;
  }

  if (value.startsWith("$$date:")) {
    const date = new Date(value.slice(7));
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date;
  }
  return value;
}

export function convertValueLevel1ToLevel0(
  value: DatabaseLevel1Value
): DatabaseLevel0Value {
  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
      return value;

    case "object":
      if (value instanceof Date) {
        return convertDate(value);
      } else if (value === null) {
        return convertNull(value);
      } else if (Array.isArray(value)) {
        throw new ConversionSupportError("Arrays are not supported");
      } else {
        throw new ConversionSupportError("Objects are not supported");
      }

    case "undefined":
      return convertUndefined(value);
    case "bigint":
      return convertBigInt(value);
    case "symbol":
      return convertSymbol(value);
    case "function":
      throw new ConversionSupportError("Functions are not supported");
    default:
      throw new Error("Unsupported type");
  }
}

export function convertLevel0ToLevelValue(
  value: DatabaseLevel0Value
): DatabaseLevel1Value {
  if (typeof value === "string") {
    return restoreStringLevel1(value);
  }
  return value;
}

export function convertLevel1ToLevel0(
  value: Record<string, DatabaseLevel1Value>
): Record<string, DatabaseLevel0Value> {
  const result: Record<string, DatabaseLevel0Value> = {};
  for (const key in value) {
    result[key] = convertValueLevel1ToLevel0(value[key]);
  }
  return result;
}

export function convertLevel0ToLevel1(
  value: Record<string, DatabaseLevel0Value>
): Record<string, DatabaseLevel1Value> {
  const result: Record<string, DatabaseLevel1Value> = {};
  for (const key in value) {
    result[key] = convertLevel0ToLevelValue(value[key]);
  }
  return result;
}
