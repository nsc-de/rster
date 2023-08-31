import {
  MapToPrimitiveType,
  NoUndefined,
  PrimitiveType,
  TypeInformation,
} from "../basic/types";
import { AllowVoidIfUndefined } from "../util";
import { RsterApiMethod, RsterApiMethodBuilderContext } from "./method";
import { RsterApiModule, RsterApiModuleBuilderContext } from "./module";

export type ActionFunction<D extends ParameterDeclaration<any, any, any, any>> =
  (
    args: MapToPrimitiveType<NoUndefined<D["expectBody"], object>> &
      MapToPrimitiveType<NoUndefined<D["expectQuery"], object>> &
      MapToPrimitiveType<NoUndefined<D["expectParams"], object>>
  ) => AllowVoidIfUndefined<
    PrimitiveType<D["returns"]> | Promise<PrimitiveType<D["returns"]>>
  >;

/**
 * Declaration for method parameters.
 *
 * @typeparam RETURNS - The type of the return value.
 * @typeparam EXPECT_BODY - The type of the expected body.
 * @typeparam EXPECT_QUERY - The type of the expected query.
 * @typeparam EXPECT_PARAMS - The type of the expected parameters.
 *
 * @param expectBody - The expected body.
 * @param expectQuery - The expected query.
 * @param expectParams - The expected parameters.
 * @param returns - The return type.
 */
export interface ParameterDeclaration<
  RETURNS extends TypeInformation<unknown>,
  EXPECT_BODY extends {
    [key: string]: { type: TypeInformation<unknown>; optional: boolean };
  },
  EXPECT_QUERY extends {
    [key: string]: { type: TypeInformation<unknown>; optional: boolean };
  },
  EXPECT_PARAMS extends {
    [key: string]: { type: TypeInformation<unknown>; optional: boolean };
  }
> {
  expectBody?: EXPECT_BODY;
  expectQuery?: EXPECT_QUERY;
  expectParams?: EXPECT_PARAMS;
  returns: RETURNS;
}

/**
 * A map of modules of the api or it's submodules. (Contained once in each module and submodule and once on the api itself)
 *
 * @see ModuleBuilderMap
 */
export type ModuleMap<
  T extends RsterApiModule<any, any> = RsterApiModule<any, any>
> = {
  [key: string]: T;
};

/**
 * A map of methods of the api or it's submodules. (Contained once in each module and submodule and once on the api itself)
 *
 * @typeparam T - The type of the method.
 *
 * @see MethodBuilderMap
 */
export type MethodMap<T extends RsterApiMethod<any> = RsterApiMethod<any>> = {
  [key: string]: T;
};

/**
 * A map of modules of the api or it's submodules. (Contained once in each module and submodule and once on the api itself)
 * This is the implementation for the builders
 *
 * @typeparam T - The type of the module builder context.
 *
 * @see ModuleMap
 */
export type ModuleBuilderMap<T extends RsterApiModuleBuilderContext<any, any>> =
  {
    [key: string]: T;
  };

/**
 * A map of methods of the api or it's submodules. (Contained once in each module and submodule and once on the api itself)
 * This is the implementation for the builders
 *
 * @typeparam T - The type of the method builder context.
 *
 * @see MethodMap
 */
export type MethodBuilderMap<T extends RsterApiMethodBuilderContext<any>> = {
  [key: string]: T;
};
