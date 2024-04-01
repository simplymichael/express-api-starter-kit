# Express API Starter Kit
A starter kit for building REST API applications with Express.js.

[![Node version][node-version-image]][node-url]
[![License][license-image]][license-url]
[![Conventional commits][conventional-commits-image]][conventional-commits-url]
[![Tests][ci-image]][ci-url]
[![Coverage][codecov-image]][codecov-url]

## Routing 
Routes are defined in the `src/routes` directory. Each route is an object with several properties.
One of these properties is the `handler` property which specifies the request handler for this route.
The handler can be specified in one of four ways:
- A function
- An array: `[controller: Object|String, method: Function|String]`
- An object: `{ controller: Object|String, method: Function|String }`
- A string `"controller.method"`

## Dependency Injection (DI) Container 
Every route handler (both controller methods and stand-alone functions) has access 
to the DI Container's methods (`register` and `resolve`) via the `this` property. 
Also, every middleware and route handler can access these methods via the `req.app` property.


## Contributing
- <a name="report-a-bug">[Report a bug][bug]</a>
- <a name="request-a-new-feature">[Request a new feature][fr]</a>
- <a name="submit-a-pull-request">[Submit a pull request][pr]</a>
- <a name="contributing-guide">Checkout the [Contributing guide][contribute]</a>


## License
[MIT License][license-url]


## Author
[Simplymichael](https://github.com/simplymichael) ([simplymichaelorji@gmail.com](mailto:simplymichaelorji@gmail.com))


[node-url]: https://nodejs.org/
[node-version-image]: https://img.shields.io/node/v/express-api-starter-kit
[license-url]: https://github.com/simplymichael/express-api-starter-kit/blob/main/LICENSE.md
[license-image]: https://img.shields.io/github/license/simplymichael/express-api-starter-kit
[conventional-commits-url]: https://conventionalcommits.org
[conventional-commits-image]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-brightgreen.svg
[ci-url]: https://github.com/simplymichael/express-api-starter-kit/actions/workflows/run-coverage-tests.yml
[ci-image]: https://github.com/simplymichael/express-api-starter-kit/workflows/tests/badge.svg
[codecov-url]: https://codecov.io/gh/simplymichael/express-api-starter-kit
[codecov-image]: https://img.shields.io/codecov/c/github/simplymichael/express-api-starter-kit?token=N22AUXCAU3

[bug]: https://github.com/simplymichael/express-api-starter-kit/labels/bug
[contribute]: https://github.com/simplymichael/express-api-starter-kit/blob/master/CONTRIBUTING.md
[fr]: https://github.com/simplymichael/express-api-starter-kit/labels/feature%20request
[pr]: https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request
