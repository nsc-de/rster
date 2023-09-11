import { ConversionRegister } from "./conversion";
import { boolean } from "./types/boolean";
import { number } from "./types/number";
import { StringTypeInformation, string } from "./types/string";

describe("ConversionRegister", () => {
  describe("instance", () => {
    it("test instance contains instance of ConversionRegister", () => {
      expect(ConversionRegister.instance).toBeInstanceOf(ConversionRegister);
    });
  });

  describe("constructor", () => {
    it("test constructor", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister).toBeInstanceOf(ConversionRegister);
    });
  });

  describe("register", () => {
    it("register should register a new conversion", () => {
      const conversionRegister = new ConversionRegister([]);
      const type = new StringTypeInformation("hello");

      conversionRegister.register(
        type,
        "hello",
        (value) => JSON.stringify(value),
        (value) => JSON.parse(value)
      );

      expect(conversionRegister.entries).toHaveLength(1);
      expect(conversionRegister.entries[0].type).toEqual(type);
      expect(conversionRegister.entries[0].identifier).toEqual("hello");
      expect(conversionRegister.entries[0].exportToString("hello")).toEqual(
        '"hello"'
      );
      expect(conversionRegister.entries[0].importFromString('"hello"')).toEqual(
        "hello"
      );
    });
  });

  describe("exportToString", () => {
    it("exportToString should export a value to string using the given conversion", () => {
      const typeInfo = new StringTypeInformation("hello");
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "hello",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.exportToString("hello")).toEqual(
        '@hello:"hello"'
      );
    });

    it("exportToString with multiple conversations", () => {
      const typeInfo = string("hello");
      const typeInfo2 = string("world");
      const typeInfo3 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "hello",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "world",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo3,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.exportToString("hello")).toEqual(
        '@hello:"hello"'
      );
      expect(conversionRegister.exportToString("world")).toEqual(
        '@world:"world"'
      );
      expect(conversionRegister.exportToString(42)).toEqual("@number:42");
    });

    it("exportToString should throw an error if no conversion is found", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(() => conversionRegister.exportToString("hello")).toThrow(
        "Unsupported type: String"
      );

      expect(() => conversionRegister.exportToString(42)).toThrow(
        "Unsupported type: Number"
      );

      expect(() => conversionRegister.exportToString(null)).toThrow(
        "Unsupported type: Null"
      );

      expect(() => conversionRegister.exportToString(undefined)).toThrow(
        "Unsupported type: undefined"
      );
    });
  });

  describe("importFromString", () => {
    it("importFromString should import a value from string using the given conversion", () => {
      const typeInfo = new StringTypeInformation("hello");
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "hello",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.importFromString('@hello:"hello"')).toEqual(
        "hello"
      );
    });

    it("importFromString with multiple conversations", () => {
      const typeInfo = string("hello");
      const typeInfo2 = string("world");
      const typeInfo3 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "hello",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "world",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo3,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.importFromString('@hello:"hello"')).toEqual(
        "hello"
      );
      expect(conversionRegister.importFromString('@world:"world"')).toEqual(
        "world"
      );
      expect(conversionRegister.importFromString("@number:42")).toEqual(42);
    });

    it("importFromString should throw an error if no conversion is found", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(() =>
        conversionRegister.importFromString('@hello:"hello"')
      ).toThrow("Unsupported type for identifier: hello");

      expect(() =>
        conversionRegister.importFromString('@world:"world"')
      ).toThrow("Unsupported type for identifier: world");

      expect(() => conversionRegister.importFromString("@number:42")).toThrow(
        "Unsupported type for identifier: number"
      );
    });

    it("should passthrough if no @identifier is declared", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister.importFromString("hello")).toEqual("hello");
      expect(conversionRegister.importFromString("world")).toEqual("world");
      expect(conversionRegister.importFromString("42")).toEqual("42");
    });

    it("test escaped @identifier", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister.importFromString('\\@hello:"hello"')).toEqual(
        '@hello:"hello"'
      );
    });

    it("test escaped \\ character at begining", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister.importFromString("\\\\@hello")).toEqual(
        "\\@hello"
      );
    });
  });

  describe("exportObjectToString", () => {
    it("exportObjectToString should export an object's contents to string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.exportObjectToString({
          name: "John",
          age: 42,
        })
      ).toEqual({
        name: '@string:"John"',
        age: "@number:42",
      });
    });

    it("Don't export if value is compatible with conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.exportObjectToString(
          {
            name: "John",
            age: 42,
          },
          (it) => typeof it === "string"
        )
      ).toEqual({
        name: "John",
        age: "@number:42",
      });
    });
  });

  describe("importObjectFromString", () => {
    it("importObjectFromString should import an object's contents from string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.importObjectFromString({
          name: '@string:"John"',
          age: "@number:42",
          age2: 42,
        })
      ).toEqual({
        name: "John",
        age: 42,
        age2: 42,
      });
    });
  });

  describe("exportArrayToString", () => {
    it("exportArrayToString should export an array's contents to string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.exportArrayToString(["John", 42])).toEqual([
        '@string:"John"',
        "@number:42",
      ]);
    });

    it("Don't export if value is compatible with conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.exportArrayToString(
          ["John", 42],
          (it) => typeof it === "string"
        )
      ).toEqual(["John", "@number:42"]);
    });
  });

  describe("importArrayFromString", () => {
    it("importArrayFromString should import an array's contents from string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.importArrayFromString([
          '@string:"John"',
          "@number:42",
          42,
        ])
      ).toEqual(["John", 42, 42]);
    });
  });

  describe("deepExportObjectToString", () => {
    it("deepExportObjectToString should export an object's contents to string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportObjectToString({
          name: "John",
          age: 42,
        })
      ).toEqual({
        name: '@string:"John"',
        age: "@number:42",
      });
    });

    it("Don't export if value is compatible with conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportObjectToString(
          {
            name: "John",
            age: 42,
          },
          (it) => typeof it === "string"
        )
      ).toEqual({
        name: "John",
        age: "@number:42",
      });
    });

    it("test with nested objects", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportObjectToString({
          name: "John",
          age: 42,
          address: {
            street: "street",
            number: 42,
          },
        })
      ).toEqual({
        name: '@string:"John"',
        age: "@number:42",
        address: {
          street: '@string:"street"',
          number: "@number:42",
        },
      });
    });

    it("test with nested arrays", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportObjectToString({
          name: "John",
          age: 42,
          address: ["street", 42],
        })
      ).toEqual({
        name: '@string:"John"',
        age: "@number:42",
        address: ['@string:"street"', "@number:42"],
      });
    });

    it("test with null values (they should be ignored)", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportObjectToString({
          name: "John",
          age: 42,
          address: null,
        })
      ).toEqual({
        name: '@string:"John"',
        age: "@number:42",
        address: null,
      });
    });
  });

  describe("deepImportObjectFromString", () => {
    it("deepImportObjectFromString should import an object's contents from string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportObjectFromString({
          name: '@string:"John"',
          age: "@number:42",
          age2: 42,
        })
      ).toEqual({
        name: "John",
        age: 42,
        age2: 42,
      });
    });

    it("test with nested objects", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportObjectFromString({
          name: '@string:"John"',
          age: "@number:42",
          address: {
            street: '@string:"street"',
            number: "@number:42",
          },
        })
      ).toEqual({
        name: "John",
        age: 42,
        address: {
          street: "street",
          number: 42,
        },
      });
    });

    it("test with nested arrays", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportObjectFromString({
          name: '@string:"John"',
          age: "@number:42",
          address: ['@string:"street"', "@number:42"],
        })
      ).toEqual({
        name: "John",
        age: 42,
        address: ["street", 42],
      });
    });

    it("test with null values (they should be ignored)", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportObjectFromString({
          name: '@string:"John"',
          age: "@number:42",
          address: null,
        })
      ).toEqual({
        name: "John",
        age: 42,
        address: null,
      });
    });
  });

  describe("deepExportArrayToString", () => {
    it("deepExportArrayToString should export an array's contents to string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.deepExportArrayToString(["John", 42])).toEqual([
        '@string:"John"',
        "@number:42",
      ]);
    });

    it("Don't export if value is compatible with conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportArrayToString(
          ["John", 42],
          (it) => typeof it === "string"
        )
      ).toEqual(["John", "@number:42"]);
    });

    it("test with nested objects", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportArrayToString([
          "John",
          42,
          {
            street: "street",
            number: 42,
          },
        ])
      ).toEqual([
        '@string:"John"',
        "@number:42",
        {
          street: '@string:"street"',
          number: "@number:42",
        },
      ]);
    });

    it("test with nested arrays", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportArrayToString(["John", 42, ["street", 42]])
      ).toEqual([
        '@string:"John"',
        "@number:42",
        ['@string:"street"', "@number:42"],
      ]);
    });

    it("test with null values (they should be ignored)", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportArrayToString(["John", 42, null])
      ).toEqual(['@string:"John"', "@number:42", null]);
    });
  });

  describe("deepImportArrayFromString", () => {
    it("deepImportArrayFromString should import an array's contents from string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportArrayFromString([
          '@string:"John"',
          "@number:42",
          42,
        ])
      ).toEqual(["John", 42, 42]);
    });

    it("test with nested objects", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportArrayFromString([
          '@string:"John"',
          "@number:42",
          {
            street: '@string:"street"',
            number: "@number:42",
          },
        ])
      ).toEqual(["John", 42, { street: "street", number: 42 }]);
    });

    it("test with nested arrays", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportArrayFromString([
          '@string:"John"',
          "@number:42",
          ['@string:"street"', "@number:42"],
        ])
      ).toEqual(["John", 42, ["street", 42]]);
    });

    it("test with null values (they should be ignored)", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportArrayFromString([
          '@string:"John"',
          "@number:42",
          null,
        ])
      ).toEqual(["John", 42, null]);
    });
  });

  describe("deepExportToString", () => {
    it("Test with object", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
      ]);

      expect(
        conversionRegister.deepExportToString({
          name: "John",
          age: 42,
          address: {
            street: "street",
            number: 42,
          },
        })
      ).toEqual({
        name: "@string:John",
        age: "@number:42",
        address: {
          street: "@string:street",
          number: "@number:42",
        },
      });
    });

    it("Test with array", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
      ]);

      expect(
        conversionRegister.deepExportToString(["John", 42, ["street", 42]])
      ).toEqual([
        "@string:John",
        "@number:42",
        ["@string:street", "@number:42"],
      ]);
    });

    it("Test with unsupported type", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const typeInfo3 = boolean();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
      ]);

      // @ts-ignore
      expect(() => conversionRegister.deepExportToString(true)).toThrow(
        "Unsupported type"
      );
    });
  });
});
