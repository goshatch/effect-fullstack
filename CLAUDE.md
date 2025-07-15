# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an exploration project aimed at learning to use [Effect-TS](https://effect.website). Although the final goal is to build a simple todo applicaton, the actual primary objectives are:

- Understand core Effect concepts
- Write idiomatic Effect code
- Use the Effect libraries and ecosystem as much as possible
- Figure out a way to work with Effect on the frontend together with React
- Use Websockets in a type-safe way with Effect

The tech stack is:
- Bun runtime (not Node.js, all commands use `bun` instead of `npm` or `yarn`)
- TypesScript with Strict mode
- Effect-TS (latest version) with Bun platform

## Essential Commands

```bash
# Install dependencies
bun install

# Run the backend server (from packages/backend)
bun run index.ts
# or
bun src/index.ts

# Run tests
bun test

# Build a file
bun build <file>
```

## Architecture

### Monorepo Structure
- Uses Bun workspaces (configured in `bunfig.toml`)
- Packages live in `/packages/` directory
- Currently only has `backend` package, `web` and `common` packages planned.

### Backend Architecture
- **Entry point**: `packages/backend/src/index.ts` - defines HTTP routes using Effect Router
- **Server startup**: `packages/backend/src/listen.ts` - starts server on port 3333
- **Framework**: Uses Effect's functional programming patterns:
  - `Effect.Effect` for effects
  - `Router` from `@effect/platform/HttpRouter` for routing
  - `Layer` system for dependency injection
  - Pipe operator (`|>`) for function composition

### Key Effect Patterns

Documentation for the Effect API can be found in the ./docs directory.
Refer to `docs/llms-small.txt` for full documentation, or to `docs/llms.txt` for links to online documentation of relevant concepts.

When working with Effect code:
1. Use `Effect.gen` for generator-based syntax
2. Use `pipe` or the pipe operator (`|>`) for function composition
3. Handle errors with `Effect.catchAll` or `Effect.catchTag`
4. Use `Layer` for dependency injection
5. Return `Effect<Success, Error, Requirements>` types

## Important Bun-Specific Guidelines

1. **Always use Bun commands**: `bun install`, `bun test`, `bun run`
2. **Bun APIs**: Make use of the `@effect/platform-bun` package 
3. **No build step needed**: Bun runs TypeScript directly
4. **Testing**: Use `bun test` with `.test.ts` files

## Working Mode

**Tutorial Mode**: When working on this project, operate in tutorial mode:
- Explain concepts and changes at a high level first
- Guide through implementation details when asked
- Let the user make the actual code changes
- Provide explanations of what makes code idiomatic Effect
- Suggest improvements but don't implement them directly

## Development Notes

- The project is in early stages with minimal scaffolding
- No frontend package exists yet
- No tests, linting, or formatting configuration
- Effect requires understanding of functional programming concepts
- When adding new routes, follow the pattern in `packages/backend/src/index.ts`
