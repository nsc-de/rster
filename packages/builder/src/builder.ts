import { Method, Values } from "@rster/common";
import { RsterApiBuilderContext } from "./api";
import { RsterApiModuleBuilderContext } from "./module";
import {
  ActionFunction,
  MethodBuilderMap,
  ModuleBuilderMap,
  ParameterDeclaration,
} from "./types";
import { RsterApiMethodBuilderContext } from "./method";
import {
  RsterApiBuilder,
  RsterApiMethodBuilder,
  RsterApiModuleBuilder,
} from "./conversion_types";

export function buildRsterApi(builder: RsterApiBuilder<any>) {
  const context = new RsterApiBuilderContext({});
  builder.call(context);
  return context.generate();
}

export function api<
  MODULES extends ModuleBuilderMap<RsterApiModuleBuilderContext<any, any>>,
  METHODS extends MethodBuilderMap<RsterApiMethodBuilderContext<any>>
>(
  {
    version,
    name,
    description,
    modules,
    methods,
  }: {
    version?: string;
    name?: string;
    description?: string[];
    modules?: Values<MODULES>;
    methods?: Values<METHODS>;
  },
  builder?: RsterApiBuilder<RsterApiBuilderContext<MODULES, METHODS>>
) {
  const context = new RsterApiBuilderContext({
    version,
    name,
    description,
    modules,
    methods,
  }) as RsterApiBuilderContext<MODULES, METHODS>;

  if (builder) builder.call(context);
  return context;
}

export function module<
  MODULES extends ModuleBuilderMap<any>,
  METHODS extends MethodBuilderMap<any>
>(
  {
    name,
    description,
    httpPath,
    httpMethod,
    modules,
    methods,
  }: {
    name: string;
    description?: string[];
    httpPath?: string;
    httpMethod?: Method;
    modules?: Values<MODULES>;
    methods?: Values<METHODS>;
  },
  builder?: RsterApiModuleBuilder
) {
  const context = new RsterApiModuleBuilderContext<MODULES, METHODS>({
    name,
    description,
    httpPath,
    httpMethod,
    modules,
    methods,
  });

  if (builder) builder.call(context);
  return context;
}

export function method<
  DECLARATION extends ParameterDeclaration<any, any, any, any>
>(
  {
    name,
    description,
    httpPath,
    httpMethod,
    declaration,
    action,
  }: {
    name: string;
    description?: string[];
    httpPath?: string;
    httpMethod?: Method;
    declaration: DECLARATION;
    action?: ActionFunction<DECLARATION>;
  },
  builder?: RsterApiMethodBuilder<RsterApiMethodBuilderContext<DECLARATION>>
): RsterApiMethodBuilderContext<DECLARATION> {
  const context = new RsterApiMethodBuilderContext<DECLARATION>({
    name,
    description,
    httpPath,
    httpMethod,
    declaration,
    action,
  });

  if (builder) builder.call(context);
  return context;
}
