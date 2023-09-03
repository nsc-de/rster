# Changelog for @rster/info

## v0.1.2.1

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
