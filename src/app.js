const util                   = require("node:util");
const express                = require("express");
const createError            = require("http-errors");
const cookieParser           = require("cookie-parser");
const env                    = require("../dotenv");
const { apiSuccessResponse } = require("./helpers/api-response");
const log                    = require("./helpers/log");
const { defaultLogger }      = require("./helpers/log");
const { statusCodes }        = require("./helpers/http");
//const session              = require("./middlewares/session");
const routes                 = require("./router");

const app        = express();
const appName    = env.NAME;
const apiVersion = env.API_VERSION;
const { [`api-v${apiVersion}`]: apiRoutes } = routes;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// No longer using session, just depend solely on JSON Web Tokens for
// authentication and authorization.
// That way, we won't have problem with tools that cannot persist cookies.
// In any case, "a REST API should be stateless".
// Isn't that one of the principles of REST?
// To use session, however, comment out the app.use(session()) below,
// and the line requiring the session middleware up above.
// Then read and write sessions as usual.
// app.use(session());

// CORS handler
app.use((req, res, next) => {
  const originHeader    = req.get("origin");
  const allowedOrigins  = env.ALLOWED_ORIGINS.split(/[\s+,;]+/).map(o => o.trim());
  const allowAllOrigins = allowedOrigins.includes("*");

  if(originHeader && (allowedOrigins.includes(originHeader) || allowAllOrigins)) {
    res.header("Access-Control-Allow-Origin", originHeader);
  }

  res.setHeader("Access-Control-Allow-Methods", ["GET", "POST", "PUT", "DELETE"].join(", "));
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

/** ROUTING **/
const apiVersionBasePath = `/api/v${apiVersion}`;

// Handle home page
app.get("/", (req, res) => {
  const html = `
  <html>
    <head>
      <title>${appName} API home page</title>
    </head>
    <body>
      <h1>Welcome to ${appName} API home page</h1>
      <a href="/api">See supported APIs</a>
    </body>
  </html
  `;

  res.set("Content-Type", "text/html");
  res.send(Buffer.from(html));
});

// API landing page (Display API routes as HTML or JSON)
app.get("/api", (req, res) => {
  if(req.query.view?.toLowerCase() === "json") {
    return asJSON();
  } else {
    return asHTML();
  }

  function asHTML() {
    const endpoints = [];
    const routeNames = Object.keys(apiRoutes);

    for(const routeName of routeNames) {
      endpoints.push(createRouteItem(routeName));
    }

    const html = `
    <html>
      <head>
        <title>${appName} API page</title>
        <style>
          a:link { text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>Available API Request endpoints</h1>
        <ul>${endpoints.join("")}</ul>

        <a href="/">Back to home page</a> |
        <a href="/api?view=json">JSON view</a>
      </body>
    </html
    `;

    res.set("Content-Type", "text/html");
    res.send(Buffer.from(html));

    function createRouteItem(name) {
      return `
        <li>
          <a href="${apiVersionBasePath}/${name}/routes">${name}</a>
        </li>
      `;
    }
  }

  function asJSON() {
    const routeNames = Object.keys(apiRoutes);
    const routes = {
      routes: {
        path : "/api/routes",
      },
    };

    for(const routeName of routeNames) {
      routes[routeName] = {
        path: `${apiVersionBasePath}/${routeName}`
      };
    }

    return res.status(statusCodes.ok).json(apiSuccessResponse({ routes }));
  }
});

// Fetch available routes for each individual API path (as HTML)
app.get(`${apiVersionBasePath}/:apiType/routes`, (req, res) => {
  const apiType     = req.params.apiType; // user, example, etc api
  const apiPath     = `${apiVersionBasePath}/${apiType}`;
  const definitions = require(`./router/routes/${apiPath}/route-definitions`);

  if(req.query.view?.toLowerCase() === "json") {
    return asJSON();
  } else {
    return asHTML();
  }

  function asHTML() {
    const endpoints   = [];

    for (const [key, value] of Object.entries(definitions)) {
      endpoints.push(createRouteItem(key, value));
    }

    const html = `
    <html>
      <head>
        <title>${appName}:${apiType} API page</title>
        <style>
          th, td { padding: 5px; }
          td { font-size: 17px; font-weight: 500; }
          ul, li { display: inline-block; }
          a:link { text-decoration: none; }
        </style>
      </head>
      <body style="display: flex; flex-direction: column; align-content: center;">
        <h1 style="text-align: center;">${apiType} API Request endpoints</h1>

        <ul style="margin-bottom: 10px; list-style-type: none;">
          <li><a href="/">Home</a></li> |
          <li><a href="/api">API landing page</a></li> |
          <li><a href="${apiPath}/routes?view=json">JSON view</a></li>
        </ul>

        <table border="1">
          <thead>
            <tr>
              <th>Route Name</th>
              <th>Description</th>
              <th>Endpoint</th>
              <th>Request method</th>
            </tr>
          </thead>
          <tbody>
            <td>routes</td>
            <td>Get list of available API routes</td>
            <td>${apiPath}/routes</td>
            <td>GET</td>

            ${endpoints.join("")}
          </tbody>
        </table>
      </body>
    </html
    `;

    res.set("Content-Type", "text/html");
    res.send(Buffer.from(html));

    function createRouteItem(name, data) {
      const path = `${apiPath}${data.path}` + (data.parameters.length > 0
        ? `${data.parameters.join("/")}`
        : ""
      );

      return `
        <tr>
          <td>${name}</td>
          <td>${data.description}</td>
          <td>${path}</td>
          <td>${data.method}</td>
        </tr>
      `;
    }
  }

  function asJSON() {
    const routes = {
      routes: {
        method      : "GET",
        path        : `${apiPath}/routes`,
        parameters  : [],
        description : "Get list of available API routes"
      },
    };

    for(const [key, value] of Object.entries(definitions)) {
      const { method, path, parameters, description } = value;

      routes[key] = {
        method,
        path: `${apiPath}${path}`,
        parameters,
        description
      };
    }

    return res.status(statusCodes.ok).json(apiSuccessResponse({ routes }));
  }
});

// Setup dynamic API routing table
for(const [route, handler] of Object.entries(apiRoutes)) {
  app.use(new RegExp(`${apiVersionBasePath}/${route}`, "i"), handler);
}

// catch 404 and forward to "routes catch-all" handler
app.use((req, res, next) => next(createError(404)));

// "routes catch-all" handler
// eslint-disable-next-line
app.use((err, req, res, next) => {
  const environment = req.app.get("env");
  const message = "The resource you're looking for does not exist";

  res.status = err.status || 500;

  log(defaultLogger, {
    type: "error",
    message: message,
    data: {
      error: `"${util.inspect(err)}"`,
      handler: "catch-all route handler"
    },
  });

  if(environment === "development") {
    res.send({ error: true, message, errorStack: err.stack });
  } else {
    res.send({ error: true, message });
  }
});


module.exports = app;
