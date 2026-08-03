# Fantasy Name Forge for Owlbear Rodeo

A compact Owlbear Rodeo action extension for generating fantasy character names from customizable, browser-local lists. The official Owlbear Rodeo SDK is bundled into the published app so the action completes OBR's iframe-ready handshake.

## Features

- Generates complete names or combines prefixes, stems, and suffixes.
- Optionally adds epithets and titles.
- Saves edited lists and recent names in `localStorage`.
- Imports and exports list collections as JSON.
- Runs as a dependency-free static site.

## Install in Owlbear Rodeo

Add this extension manifest URL in Owlbear Rodeo:

`https://exasperis.github.io/OBR-Name-Generator/manifest.json`

## Local development

Install dependencies, build the published `docs/` directory, and run the tests with:

```sh
pnpm install
pnpm build
pnpm test
```

## Hosting

The project is designed for GitHub Pages. Publish the `/docs` directory from the `main` branch. Manifest asset and popover paths use fully qualified URLs because Owlbear Rodeo does not resolve bare relative paths against a project Pages directory.
