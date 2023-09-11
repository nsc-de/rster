import { AllowAnyTypeInformation } from "./types";

/**
 * Entry for a type in the conversion register. The Identifier is used to identify the type in the string representation of the value and then to
 * reconstruct the value from the string. It has to be unique.
 *
 * @typeParam T - Type information
 */
export interface ConversionRegisterEntry<T extends AllowAnyTypeInformation> {
  /**
   * Type information
   * @readonly
   * @typeParam T - Type information
   */
  readonly type: T;

  /**
   * Identifier for the type. Is used to identify the type in the string representation of the value and then to reconstruct the value from the string. It has to be unique.
   * @readonly
   */
  readonly identifier: string;

  /**
   * Function to convert the value to a string
   * @readonly
   */
  exportToString: (value: T["type"]) => string;

  /**
   * Function to convert the value from a string
   * @readonly
   */
  importFromString: (value: string) => T["type"];
}

/**
 * Error thrown when a type is not supported by the conversion register
 */
class ConversionRegisterUnsupportedTypeError extends Error {
  /**
   * Constructor for {@link ConversionRegisterUnsupportedTypeError}
   * @param message - Message for the error
   */
  constructor(message: string) {
    super(message);
    this.name = "ConversionRegisterUnsupportedTypeError";
  }
}

/**
 * Conversion register for converting values to and from strings
 * Used to store values in a database that does not support the type of the value
 */
export class ConversionRegister {
  /**
   * The instance of the conversion register
   * @readonly
   */
  public static readonly instance = new ConversionRegister([]);

  /**
   * Constructor for {@link ConversionRegister}
   * @param entries - Entries for the conversion register
   */
  constructor(
    /**
     * Entries for the conversion register
     * @readonly
     *
     * @see {@link ConversionRegisterEntry}
     */
    public readonly entries: ConversionRegisterEntry<AllowAnyTypeInformation>[]
  ) {}

  /**
   * Register a type in the conversion register
   *
   * @param type the type to register
   * @param identifier the identifier for the type
   * @param exportToString export to string function
   * @param importFromString import from string function
   * @returns {void}
   */
  register<T extends AllowAnyTypeInformation>(
    type: T,
    identifier: string,
    exportToString: (value: T["type"]) => string,
    importFromString: (value: string) => T["type"]
  ) {
    // Check if the identifier is already registered
    if (this.entries.some((e) => e.identifier === identifier)) {
      return;
    }
    this.entries.push({
      type,
      identifier,
      exportToString,
      importFromString,
    });
  }

  /**
   * Export a value to a string
   *
   * @param value - Value to export
   * @returns {string} - String representation of the value
   *
   * @throws {ConversionRegisterUnsupportedTypeError} - Unsupported type
   */
  exportToString(value: AllowAnyTypeInformation["type"]): string {
    const entry = this.entries.find((e) => e.type.check(value));
    if (!entry) {
      throw new ConversionRegisterUnsupportedTypeError(
        `Unsupported type: ${
          value?.constructor?.name ?? (value === null ? "Null" : typeof value)
        }`
      );
    }
    return `@${entry.identifier}:${entry.exportToString(value)}`;
  }

  /**
   * Import a value from a string
   * @param value - String representation of the value
   * @returns {AllowAnyTypeInformation["type"]} - Imported value
   * @throws {ConversionRegisterUnsupportedTypeError} - Unsupported type
   */
  importFromString(value: string): AllowAnyTypeInformation["type"] {
    if (value.startsWith("@")) {
      const [identifier, stringValue] = value.substring(1).split(":");
      const entry = this.entries.find((e) => e.identifier === identifier);
      if (!entry) {
        throw new Error(`Unsupported type for identifier: ${identifier}`);
      }
      return entry.importFromString(stringValue);
    } else if (value.startsWith("\\")) {
      // TODO: Escape characters for normal strings
      if (value.charAt(1) === "@" || value.charAt(1) === "\\") {
        return value.substring(1);
      }
    }

    return value;
  }

  /**
   * Export an object of values to an object of strings
   *
   * @param object Object of values to export
   * @param supportsValue Function to check if a value is supported and therefore should not be converted to a string
   * @returns Object of strings
   * @throws {ConversionRegisterUnsupportedTypeError} - Unsupported type
   */
  exportObjectToString(
    object: Record<string, unknown>,
    supportsValue: (it: unknown) => boolean = () => false
  ): Record<string, any> {
    return Object.fromEntries(
      Object.entries(object).map(([key, value]) => [
        key,
        supportsValue(value) ? value : this.exportToString(value),
      ])
    );
  }

  /**
   * Import an object of values from an object of strings
   * @param value Object of strings
   * @returns Object of values
   * @throws {ConversionRegisterUnsupportedTypeError} - Unsupported type
   */
  importObjectFromString(
    value: Record<string, unknown>
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        typeof value === "string" ? this.importFromString(value) : value,
      ])
    );
  }

  /**
   * Export an array of values to an array of strings
   * @param value the array of values to export
   * @param supportsValue Function to check if a value is supported and therefore should not be converted to a string
   * @returns Array of strings
   */
  exportArrayToString(
    value: unknown[],
    supportsValue: (it: unknown) => boolean = () => false
  ): unknown[] {
    return value.map((v) => (supportsValue(v) ? v : this.exportToString(v)));
  }

  /**
   * Import an array of values from an array of strings
   * @param value Array of strings
   * @returns Array of values
   * @throws {ConversionRegisterUnsupportedTypeError} - Unsupported type
   */
  importArrayFromString(value: unknown[]): unknown[] {
    return value.map((v) =>
      typeof v === "string" ? this.importFromString(v) : v
    );
  }

  /**
   * Deep-Export an object of values to an object of strings
   * @param value Object of values to export
   * @param supportsValue Function to check if a value is supported and therefore should not be converted to a string
   * @returns Object of strings
   * @throws {ConversionRegisterUnsupportedTypeError} - Unsupported type
   */
  deepExportObjectToString(
    value: Record<string, unknown>,
    supportsValue: (it: unknown) => boolean = () => false
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        Array.isArray(value)
          ? this.deepExportArrayToString(value, supportsValue)
          : typeof value === "object"
          ? value !== null
            ? this.deepExportObjectToString(
                value as Record<string, unknown>,
                supportsValue
              )
            : null
          : supportsValue(value)
          ? value
          : this.exportToString(value),
      ])
    );
  }

  /**
   * Deep-Import an object of values from an object of strings
   * @param value Object of strings
   * @returns Object of values
   * @throws {ConversionRegisterUnsupportedTypeError} - Unsupported type
   */
  deepImportObjectFromString(
    value: Record<string, unknown>
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        Array.isArray(value)
          ? this.deepImportArrayFromString(value)
          : typeof value === "object"
          ? value !== null
            ? this.deepImportObjectFromString(value as Record<string, unknown>)
            : null
          : typeof value === "string"
          ? this.importFromString(value)
          : value,
      ])
    );
  }

  /**
   * Deep-Export an array of values to an array of strings
   * @param value the array of values to export
   * @param supportsValue  Function to check if a value is supported and therefore should not be converted to a string
   * @returns Array of strings
   * @throws {ConversionRegisterUnsupportedTypeError} - Unsupported type
   */
  deepExportArrayToString(
    value: unknown[],
    supportsValue: (it: unknown) => boolean = () => false
  ): unknown[] {
    return value.map((v) =>
      Array.isArray(v)
        ? this.deepExportArrayToString(v, supportsValue)
        : typeof v === "object"
        ? v !== null
          ? this.deepExportObjectToString(
              v as Record<string, unknown>,
              supportsValue
            )
          : null
        : supportsValue(v)
        ? v
        : this.exportToString(v)
    );
  }

  /**
   * Deep-Import an array of values from an array of strings
   * @param value Array of strings to import
   * @returns Array of values
   * @throws {ConversionRegisterUnsupportedTypeError} - Unsupported type
   */
  deepImportArrayFromString(value: unknown[]): unknown[] {
    return value.map((v) =>
      Array.isArray(v)
        ? this.deepImportArrayFromString(v)
        : typeof v === "object"
        ? v !== null
          ? this.deepImportObjectFromString(v as Record<string, unknown>)
          : null
        : typeof v === "string"
        ? this.importFromString(v)
        : v
    );
  }

  /**
   * Deep-Export a value to a string
   * @param value Value to export
   * @param supportsValue Function to check if a value is supported and therefore should not be converted to a string
   * @returns String
   * @throws {ConversionRegisterUnsupportedTypeError} - Unsupported type
   */
  deepExportToString(
    value: unknown[],
    supportsValue?: (it: unknown) => boolean
  ): unknown[];
  deepExportToString(
    value: Record<string, unknown>,
    supportsValue?: (it: unknown) => boolean
  ): Record<string, unknown>;
  deepExportToString(
    value: unknown[] | Record<string, unknown>,
    supportsValue: (it: unknown) => boolean = () => false
  ): unknown[] | Record<string, unknown> {
    if (Array.isArray(value)) {
      return this.deepExportArrayToString(value, supportsValue);
    }

    if (typeof value === "object") {
      return this.deepExportObjectToString(
        value as Record<string, unknown>,
        supportsValue
      );
    }

    throw new Error("Unsupported type");
  }
}
