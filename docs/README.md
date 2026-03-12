# MCPCloud Documentation

This directory contains the MCPCloud documentation built with [Mintlify](https://mintlify.com/). The docs cover:

- **Getting Started** - Quick start, installation
- **Core Features** - Server management, group management, smart routing, OAuth
- **Configuration** - MCP settings, environment variables, Docker, database
- **API Reference** - MCP endpoints, OpenAPI, management endpoints

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview documentation locally:

```bash
npm i -g mintlify
```

Run at the root of this `docs/` directory (where `docs.json` is):

```bash
mintlify dev
```

## Publishing

Install the Mintlify GitHub App to auto-deploy changes from the repo. Changes are deployed to production automatically after pushing to the default branch. Find the install link on your Mintlify dashboard.

## Troubleshooting

- **Mintlify dev isn't running** - Run `mintlify install` to re-install dependencies.
- **Page loads as 404** - Ensure you are running in a folder with `docs.json`.
