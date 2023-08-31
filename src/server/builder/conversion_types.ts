import { RsterApi, RsterApiBuilderContext } from "./api";
import { RsterApiMethod, RsterApiMethodBuilderContext } from "./method";
import { RsterApiModule, RsterApiModuleBuilderContext } from "./module";
import { MethodBuilderMap, ModuleBuilderMap } from "./types";

export type RsterApiBuilderContextToRsterApi<
  T extends RsterApiBuilderContext<any, any>
> = RsterApi<
  RsterApiModuleBuilderContextMapToRsterApiModuleMap<T["modules"]>,
  RsterApiMethodBuilderContextMapToRsterApiMethodMap<T["methods"]>
>;

export type RsterApiModuleBuilderContextToRsterApiModule<
  T extends RsterApiModuleBuilderContext<any, any>
> = RsterApiModule<
  RsterApiModuleBuilderContextMapToRsterApiModuleMap<T["modules"]>,
  RsterApiMethodBuilderContextMapToRsterApiMethodMap<T["methods"]>
>;

export type RsterApiModuleBuilderContextMapToRsterApiModuleMap<
  T extends ModuleBuilderMap<RsterApiModuleBuilderContext<any, any>>
> = {
  [K in keyof T]: RsterApiModuleBuilderContextToRsterApiModule<T[K]>;
};

export type RsterApiMethodBuilderContextToRsterApiMethod<
  T extends RsterApiMethodBuilderContext<any>
> = RsterApiMethod<ReturnType<T["getDeclaration"]>>;

export type RsterApiMethodBuilderContextMapToRsterApiMethodMap<
  T extends MethodBuilderMap<RsterApiMethodBuilderContext<any>>
> = {
  [K in keyof T]: RsterApiMethodBuilderContextToRsterApiMethod<T[K]>;
};

export type RsterApiBuilder<T extends RsterApiBuilderContext<any, any>> = (
  this: T
) => void;
export type RsterApiModuleBuilder<
  T extends RsterApiModuleBuilderContext<
    any,
    any
  > = RsterApiModuleBuilderContext<any, any>
> = (this: T) => void;
export type RsterApiMethodBuilder<
  T extends RsterApiMethodBuilderContext<any> = RsterApiMethodBuilderContext<any>
> = (this: T) => void;
