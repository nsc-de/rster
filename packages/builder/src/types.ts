import {
  AllowAnyTypeInformation,
  MapToPrimitiveType,
  NoUndefined,
  PrimitiveType,
  TypeInformation,
} from "@rster/types";
import { AllowVoidIfUndefined } from "@rster/common";
import { RsterApiMethod } from "./method";
import { RsterApiModule } from "./module";

export type AnyParameterDeclaration = ParameterDeclaration<any, any, any, any>;

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

export type RsterArgsType<D extends AnyParameterDeclaration> =
  | MapToPrimitiveType<NoUndefined<D["expectBody"], Record<string, never>>> &
      MapToPrimitiveType<NoUndefined<D["expectQuery"], Record<string, never>>> &
      MapToPrimitiveType<NoUndefined<D["expectParams"], Record<string, never>>>;

export type RsterReturnType<D extends AnyParameterDeclaration> = PrimitiveType<
  D["returns"]
>;

/**
 * A map of modules of the api or it's submodules. (Contained once in each module and submodule and once on the api itself)
 *
 * @see ModuleBuilderMap
 */
export type ModuleMap<
  T extends RsterApiModule<string, any, any> = RsterApiModule<string, any, any>
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
export type MethodMap<
  T extends RsterApiMethod<string, any> = RsterApiMethod<string, any>
> = {
  [key: string]: T;
};
