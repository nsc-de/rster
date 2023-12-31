import { AllowVoidIfUndefined, NoUndefined } from "@rster/util";
import { AllowAnyTypeInformation, PrimitiveType } from "@rster/types";
import { RsterApiMethod } from "./method";
import { RsterApiModule } from "./module";

export type AnyRsterApiMethod<key extends string = string> = RsterApiMethod<
  key,
  any
>;

export type AnyParameterDeclaration = ParameterDeclaration<
  AllowAnyTypeInformation,
  ParameterList,
  ParameterList,
  ParameterList
>;

export type ActionFunction<D extends AnyParameterDeclaration> = (
  args: RsterArgsType<D>
) => AllowVoidIfUndefined<RsterReturnType<D>>;

export type ParameterList = {
  [key: string]:
    | { type: AllowAnyTypeInformation; required: true }
    | { type: AllowAnyTypeInformation; required: false };
};

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
  RETURNS extends AllowAnyTypeInformation,
  EXPECT_BODY extends ParameterList,
  EXPECT_QUERY extends ParameterList,
  EXPECT_PARAMS extends ParameterList
> {
  expectBody?: EXPECT_BODY;
  expectQuery?: EXPECT_QUERY;
  expectParams?: EXPECT_PARAMS;
  returns: RETURNS;
}

export type RemoveNeverProperties<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

type ObjectType<
  T extends {
    [key: string]: { required: boolean; type: AllowAnyTypeInformation };
  }
> = t<
  RemoveNeverProperties<{
    [key in keyof T]: T[key]["required"] extends false
      ? never
      : PrimitiveType<T[key]["type"]>;
  }> &
    Partial<
      RemoveNeverProperties<{
        [key in keyof T]: T[key]["required"] extends false
          ? PrimitiveType<T[key]["type"]>
          : never;
      }>
    >
>;

export type t<T> = T;

export type RsterArgsType<D extends AnyParameterDeclaration> = t<
  ObjectType<
    NoUndefined<D["expectBody"], Record<string, never>> &
      NoUndefined<D["expectQuery"], Record<string, never>> &
      NoUndefined<D["expectParams"], Record<string, never>>
  >
>;

export type RsterReturnType<D extends AnyParameterDeclaration> =
  | PrimitiveType<D["returns"]>
  | Promise<PrimitiveType<D["returns"]>>;

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
