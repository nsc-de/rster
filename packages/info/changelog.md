# Changelog for @rster/info

## 0.1.7

### Patch Changes

- Update util dependency
- Updated dependencies [98fa3d0]
- Updated dependencies
  - @rster/types@0.1.8
  - @rster/common@0.1.3
  - @rster/basic@0.1.6

## 0.1.6

### Patch Changes

- some small type-related patches
- Updated dependencies
  - @rster/types@0.1.6

## v0.1.5

- Move declaration `optional` to `required` to make it consistent with `@rster/types`'s `object` type

## v0.1.4

- Fix bug in `#useInfo`: Logic error with paths & bugged `Context#contextStack()` function of `@rster/basic` used in `#useInfo` (which is now fixed with `@rster/basic@v0.1.3`)

## v0.1.3

- Fix build logic error: missing .d.ts files
- Remove tests from package

## v0.1.2

- Introduced methods to get and set the declaration on a context:
  - `#declaration()`, `#hasDeclaration()`, `#collectDeclarations()`

```typescript
#declaration(): Declaration; // returns the declaration
#declaration(decl: Declaration): Context; // sets the declaration
#declaration(context: Context): Declaration | undefined; // gets declaration for a context
#declaration(context: Context, decl: Declaration): Context; // sets declaration for a context
#declaration(    // gets or sets declaration for a context
  context?: Context | Declaration,
  decl?: Declaration
): Context | Declaration | undefined | string[];

#hasDeclaration(): boolean; // returns true if the context has a declaration
#hasDeclaration(context: Context): boolean; // returns true if the context has a declaration
#hasDeclaration(context?: Context): boolean; // returns true if the context has a declaration

#collectDeclarations( // returns an array of declarations and declarations for child contexts
  ctx: Context
): { declaration: Declaration; ctx: Context }[];
```

## v0.1.1

- Include index file (so you can import from the package without specifying the file)

## v0.1.0

- Initial release
