import ts, { CallExpression } from "typescript";
import {
  AnyBooleanTypeInformation,
  AnyNumberTypeInformation,
  AnyStringTypeInformation,
  AnyTypeInformation,
  ArrayTypeInformation,
  BooleanTypeInformation,
  NullTypeInformation,
  NumberRangeTypeInformation,
  NumberTypeInformation,
  ObjectTypeInformation,
  Or,
  StringTypeInformation,
  TypeInformation,
  UndefinedTypeInformation,
} from "../types";
import {
  Declaration,
  collectDeclarations,
  requiresAuthentication,
} from "./index";
import { Context, Method } from "../index";
import path from "path";
import fs from "fs";
// import { fileURLToPath } from "url";
import { glob } from "glob";

// // fallback for __dirname and __filename
// if (!__dirname) {
//   // @ts-ignore
//   __dirname = path.dirname(fileURLToPath(import.meta.url));
// }
// if (!__filename) {
//   // @ts-ignore
//   __filename = path.basename(fileURLToPath(import.meta.url));
// }

const tsconfig = ts.readConfigFile(
  path.join(__dirname, "../../../tsconfig.generator.json"),
  ts.sys.readFile
);

interface ApiInformation {
  submodules: ModuleInformation[];
  functions: FunctionInformation[];
  name: string;
}

interface ModuleInformation {
  name: string;
  functions: FunctionInformation[];
  submodules: ModuleInformation[];
}

interface FunctionInformation {
  name: string;
  call: string;
  method: Method;
  parameters: ParameterInformation<any>[];
  returnType: TypeInformation<any>;
  requireAuthentication: boolean;
}

interface ParameterInformation<T> {
  name: string;
  type: TypeInformation<T>;
  optional: boolean;
  where: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare interface Array {
  zip<T>(other: T[]): [this, T][];
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Array.prototype.zip = function <T>(other: T[]) {
  return this.map((e, i) => [e, other[i]]);
};

declare module "../types" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TypeInformation<T> {
    toTypeScript(): ts.TypeNode;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ArrayTypeInformation<T> {
    toTypeScript(): ts.TypeNode;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ObjectTypeInformation<T> {
    toTypeScript(): ts.TypeNode;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Or<T0, T1> {
    toTypeScript(): ts.TypeNode;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface StringTypeInformation<T> {
    toTypeScript(): ts.TypeNode;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface NumberTypeInformation<T> {
    toTypeScript(): ts.TypeNode;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface NumberRangeTypeInformation<MIN, MAX> {
    toTypeScript(): ts.TypeNode;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface BooleanTypeInformation<T> {
    toTypeScript(): ts.TypeNode;
  }

  interface NullTypeInformation {
    toTypeScript(): ts.TypeNode;
  }

  interface UndefinedTypeInformation {
    toTypeScript(): ts.TypeNode;
  }

  interface AnyStringTypeInformation {
    toTypeScript(): ts.TypeNode;
  }

  interface AnyNumberTypeInformation {
    toTypeScript(): ts.TypeNode;
  }

  interface AnyBooleanTypeInformation {
    toTypeScript(): ts.TypeNode;
  }

  interface AnyTypeInformation {
    toTypeScript(): ts.TypeNode;
  }
}

ArrayTypeInformation.prototype.toTypeScript = function () {
  return ts.factory.createArrayTypeNode(this.values[0].toTypeScript());
};

ObjectTypeInformation.prototype.toTypeScript = function () {
  return ts.factory.createTypeLiteralNode(
    Object.entries(this.properties).map(([key, value]) => {
      const isOptional = !value.required;
      return ts.factory.createPropertySignature(
        undefined,
        key,
        isOptional
          ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
          : undefined,
        value.type.toTypeScript()
      );
    })
  );
};

Or.prototype.toTypeScript = function () {
  return ts.factory.createUnionTypeNode(
    [this.value0, this.value1].map((v) => v.toTypeScript())
  );
};

StringTypeInformation.prototype.toTypeScript = function () {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
};

NumberTypeInformation.prototype.toTypeScript = function () {
  const number: number = this.value;
  return ts.factory.createLiteralTypeNode(
    ts.factory.createNumericLiteral(number.toString())
  );
};

NumberRangeTypeInformation.prototype.toTypeScript = function () {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
};

BooleanTypeInformation.prototype.toTypeScript = function () {
  const bool: boolean = this.value;
  if (bool) {
    return ts.factory.createLiteralTypeNode(ts.factory.createTrue());
  }
  return ts.factory.createLiteralTypeNode(ts.factory.createFalse());
};

NullTypeInformation.prototype.toTypeScript = function () {
  return ts.factory.createLiteralTypeNode(ts.factory.createNull());
};

UndefinedTypeInformation.prototype.toTypeScript = function () {
  return ts.factory.createLiteralTypeNode(ts.factory.createNull()); // TODO undefined
};

AnyStringTypeInformation.prototype.toTypeScript = function () {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
};

AnyNumberTypeInformation.prototype.toTypeScript = function () {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
};

AnyBooleanTypeInformation.prototype.toTypeScript = function () {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
};

AnyTypeInformation.prototype.toTypeScript = function () {
  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
};

function generateUnauthenticatedFunction(
  functionInformation: FunctionInformation
) {
  const parametersType = new ObjectTypeInformation(
    Object.fromEntries(
      functionInformation.parameters.map((p) => [
        p.name,
        { type: p.type, required: !p.optional },
      ])
    )
  ).toTypeScript();
  const parametersIsEmptyOrAllOptional =
    functionInformation.parameters.length === 0 ||
    functionInformation.parameters.every((p) => p.optional);

  // Create Promise<ReturnType>
  const returnType = ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier("Promise"),
    [functionInformation.returnType.toTypeScript()]
  );

  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        "parameters",
        parametersIsEmptyOrAllOptional
          ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
          : undefined,
        parametersType
      ),
    ],
    returnType,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createBlock(
      [
        // call method this.basic.execute()
        // cast to any
        ts.factory.createReturnStatement(
          ts.factory.createParenthesizedExpression(
            ts.factory.createAsExpression(
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createPropertyAccessExpression(
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createThis(),
                      "baseApi"
                    ),
                    "basic"
                  ),
                  "execute"
                ),
                undefined,
                [
                  ts.factory.createStringLiteral(functionInformation.call),
                  ts.factory.createStringLiteral(
                    functionInformation.method.toUpperCase()
                  ),
                  ts.factory.createStringLiteral(""), // TODO
                  ts.factory.createIdentifier("parameters"),
                ]
              ),
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
            )
          )
        ),
      ],
      true
    )
  );
}

function generateAuthenticatedFunction(
  functionInformation: FunctionInformation
) {
  const parametersType = new ObjectTypeInformation(
    Object.fromEntries(
      functionInformation.parameters.map((p) => [
        p.name,
        { type: p.type, required: !p.optional },
      ])
    )
  ).toTypeScript();
  const parametersIsEmptyOrAllOptional =
    functionInformation.parameters.length === 0 ||
    functionInformation.parameters.every((p) => p.optional);

  // Create Promise<ReturnType>
  const returnType = ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier("Promise"),
    [functionInformation.returnType.toTypeScript()]
  );

  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        "parameters",
        parametersIsEmptyOrAllOptional
          ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
          : undefined,
        parametersType
      ),
    ],
    returnType,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createBlock(
      [
        // call method this.basic.execute()
        // cast to any
        ts.factory.createReturnStatement(
          ts.factory.createParenthesizedExpression(
            ts.factory.createAsExpression(
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createPropertyAccessExpression(
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createThis(),
                      "baseApi"
                    ),
                    "authenticated"
                  ),
                  "execute"
                ),
                undefined,
                [
                  ts.factory.createStringLiteral(functionInformation.call),
                  ts.factory.createStringLiteral(
                    functionInformation.method.toUpperCase()
                  ),
                  ts.factory.createStringLiteral(""), // TODO
                  ts.factory.createIdentifier("parameters"),
                ]
              ),
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
            )
          )
        ),
      ],
      true
    )
  );
}

export function generateFunction(
  functionInformation: FunctionInformation,
  options: FunctionGenerationOptions
) {
  options = options || {};
  const authApiAvailable = options.authenticationApiAvailable || false;

  if (functionInformation.requireAuthentication) {
    if (!authApiAvailable) {
      throw new Error(
        `Function ${functionInformation.name} requires authentication, but no authentication API is available`
      );
    }

    return generateAuthenticatedFunction(functionInformation);
  }
  return generateUnauthenticatedFunction(functionInformation);
}

export interface FunctionGenerationOptions {
  authenticationApiAvailable?: boolean;
}

export function generateModule(
  moduleInformation: ModuleInformation,
  options: ModuleGenerationOptions
): CallExpression {
  options = options || {};

  const authApiAvailable = options.authenticationApiAvailable || false;
  const apiName = options.apiName || "api";

  const functions = moduleInformation.functions.map((f) => ({
    f: generateFunction(f, { authenticationApiAvailable: authApiAvailable }),
    info: f,
  }));
  const submodules = moduleInformation.submodules.map((m) => ({
    m: generateModule(m, { authenticationApiAvailable: authApiAvailable }),
    info: m,
  }));

  return ts.factory.createCallExpression(
    ts.factory.createParenthesizedExpression(
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            "baseApi",
            undefined,
            ts.factory.createTypeReferenceNode(apiName, undefined)
          ),
        ],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createBlock(
          [
            ts.factory.createReturnStatement(
              ts.factory.createObjectLiteralExpression([
                ...functions.map(({ f, info }) =>
                  ts.factory.createPropertyAssignment(info.name, f)
                ),
                ...submodules.map(({ m, info }) =>
                  ts.factory.createPropertyAssignment(info.name, m)
                ),
              ])
            ),
          ],
          true
        )
      )
    ),
    undefined,
    [
      ts.factory.createPropertyAccessExpression(
        ts.factory.createThis(),
        "baseApi"
      ),
    ]
  );
}

export interface ModuleGenerationOptions {
  authenticationApiAvailable?: boolean;
  apiName?: string;
}

export function generateApi(
  apiInformation: ApiInformation,
  options?: ApiGenerationOptions
) {
  options = options || {};
  const authApiAvailable = options.authenticationApiAvailable || false;
  const apiName = apiInformation.name || "Api";

  const modules = apiInformation.submodules.map((m) => ({
    m: generateModule(m, {
      authenticationApiAvailable: authApiAvailable,
      apiName,
    }),
    info: m,
  }));
  const functions = apiInformation.functions.map((f) => ({
    f: generateFunction(f, { authenticationApiAvailable: authApiAvailable }),
    info: f,
  }));

  return ts.factory.createClassDeclaration(
    [],
    apiName,
    [],
    [
      ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        ts.factory.createExpressionWithTypeArguments(
          ts.factory.createIdentifier(
            authApiAvailable
              ? "AuthenticatedGenericApiClient"
              : "GenericApiClient"
          ),
          undefined
        ),
      ]),
    ],
    [
      ts.factory.createPropertyDeclaration(
        undefined,
        "baseApi",
        undefined,
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier(apiName),
          undefined
        ),
        ts.factory.createThis()
      ),
      ...modules.map(({ m, info }) =>
        ts.factory.createPropertyDeclaration(
          undefined,
          info.name,
          undefined,
          undefined,
          m
        )
      ),
      ...functions.map(({ f, info }) =>
        ts.factory.createPropertyDeclaration(
          undefined,
          info.name,
          undefined,
          undefined,
          f
        )
      ),
    ]
  );
}

interface ApiGenerationOptions {
  authenticationApiAvailable?: boolean;
}

export function declarationsToApiInformation(
  name: string,
  declarations: { declaration: Declaration; ctx: Context }[]
): ApiInformation {
  const apiInformation: ApiInformation = {
    name: "Api",
    submodules: [],
    functions: [],
  };

  function recursiveInsert(
    { declaration, ctx }: { declaration: Declaration; ctx: Context },
    parts: string[],
    element: ApiInformation | ModuleInformation
  ): void {
    if (parts.length === 0) {
      console.warn("Declaration name should not be empty");
      return;
    }

    const name = parts.splice(0, 1)[0];
    if (parts.length === 0) {
      let method = ctx.getMethod();
      const call = ctx.getPath();

      if (method === "any") {
        method = "get";
      }

      // generate function
      element.functions.push({
        name: name,
        parameters: [
          ...Object.entries(declaration.expectParams ?? {}).map(
            ([name, { type, optional }]) => ({
              name: name,
              type: type,
              optional: optional,
              where: "param",
            })
          ),

          ...Object.entries(declaration.expectQuery ?? {}).map(
            ([name, { type, optional }]) => ({
              name: name,
              type: type,
              optional: optional,
              where: "query",
            })
          ),

          ...Object.entries(declaration.expectBody ?? {}).map(
            ([name, { type, optional }]) => ({
              name: name,
              type: type,
              optional: optional,
              where: "body",
            })
          ),
        ],
        returnType: declaration.returnBody,
        method,
        call,
        requireAuthentication: requiresAuthentication(ctx),
      });

      return;
    }

    // generate module
    let module = element.submodules.find((m) => m.name === name);

    if (!module) {
      module = {
        name: name,
        submodules: [],
        functions: [],
      };
      element.submodules.push(module);
    }

    recursiveInsert({ declaration, ctx }, parts, module);
  }

  declarations.forEach((d) =>
    recursiveInsert(d, d.declaration.name.split("."), apiInformation)
  );

  return apiInformation;
}

export function createFile(classDeclaration: ts.ClassDeclaration) {
  return ts.factory.createSourceFile(
    [
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier("GenericApiClient")
            ),
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier("AuthenticatedGenericApiClient")
            ),
          ])
        ),
        ts.factory.createStringLiteral("./api-base")
      ),
      classDeclaration,
      ts.factory.createExportDeclaration(
        undefined,
        false,
        ts.factory.createNamedExports([
          ts.factory.createExportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(classDeclaration.name!.text)
          ),
        ])
      ),
      ts.factory.createExportDefault(
        ts.factory.createIdentifier(classDeclaration.name!.text)
      ),
    ],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );
}

export async function generateDeclarations({
  name,
  ctx,
  filename = "index.ts",
  outDir = "./generated",
  useAuth = false,
}: {
  name: string;
  ctx: Context;
  filename?: string;
  outDir?: string;
  useAuth?: boolean;
}) {
  const declarations = collectDeclarations(ctx);
  const apiInformation = declarationsToApiInformation(name, declarations);
  const file = createFile(
    generateApi(apiInformation, { authenticationApiAvailable: useAuth })
  );

  // get files tsconfig.generator.json references

  fs.writeFileSync(
    path.join(__dirname, "../../../src/cli", filename),
    ts.createPrinter().printFile(file),
    "utf-8"
  );

  const basePath = path.resolve(path.join(__dirname, "../../../"));
  const files = await glob(tsconfig.config.include, {
    ignore: tsconfig.config.exclude,
    realpath: true,
    absolute: true,
    cwd: basePath,
  });

  console.log(`Generating api into ${path.resolve(outDir)}...`);
  console.log(`Found ${files.length} files to compile`);

  const program = ts.createProgram(files, {
    ...tsconfig.config.compilerOptions,
    outDir: path.resolve(outDir),
  });

  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  });

  //fs.unlinkSync(path.join(__dirname, "../../../src/cli", filename));
  if (emitResult.emitSkipped || allDiagnostics.length > 0) {
    console.log(
      "\nWARNING generating api, errors occurred while compiling typescript"
    );
    console.log("Generated file:\n\n\n");
    console.log(ts.createPrinter().printFile(file));
    console.log("\n");
  }
  if (emitResult.emitSkipped) {
    throw new Error(
      "Failed to generate api, errors occurred compiling typescript"
    );
  }
  console.log("Successfully generated api!");

  // generate package.json
  const packageJson = {
    name: "generated-api",
    version: "1.0.0",
    description: "Generated api",
    main: "cli/" + path.basename(filename, ".ts") + ".js",
    types: "cli/" + path.basename(filename, ".ts") + ".d.ts",
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
    },
    dependencies: {
      "cross-fetch": "^3.1.6",
    },
  };

  fs.writeFileSync(
    path.join(outDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
    "utf-8"
  );

  return emitResult.emitSkipped;
}
