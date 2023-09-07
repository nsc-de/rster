# Changelog for @rster/basic

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
