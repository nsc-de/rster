# Changelog for @rster/basic

## 0.1.9

### Patch Changes

- 3970c8d: Include LICENSE
- Updated dependencies [3970c8d]
  - @rster/common@0.1.6
  - @rster/types@0.1.10
  - @rster/util@0.1.3

## 0.1.7

### Patch Changes

- 0080b38: Update README
- Updated dependencies [0080b38]
  - @rster/common@0.1.4
  - @rster/types@0.1.9
  - @rster/util@0.1.2

## 0.1.6

### Patch Changes

- Update util dependency
- Updated dependencies [98fa3d0]
- Updated dependencies [3926989]
- Updated dependencies
  - @rster/types@0.1.8
  - @rster/util@0.1.1
  - @rster/common@0.1.3

## v0.1.5

- Make `@rster/basic` compatible with `@rster/common@0.1.2`

## v0.1.4

- Introduce shortcuts for actions inside of `Context#describe()`, `Context#any()`, `Context#post()`, `Context#put()`, `Context#patch()`, `Context#delete()`, `Context#options()`, `Context#head()`, `Context#get()`
- Add parameter support to ContextConditionPath

## v0.1.3

- Introduce Context#getRoutingPath()
- Fix bug in Context#contextStack(): Do not use sub-request's routing path --> routing completely broken

## v0.1.2

- Write caught errors to debug instead of console (rster:caught-error)
- Action now only activates when path is matched (so an action for /api will not activate for /api/other)
- Fix: If next() is not called in middleware, execute will resolve when the middleware is done (just await returned promise)

## v0.1.1

- Grant correct license
- Update dependencies

## v0.1.0

- Initial release
