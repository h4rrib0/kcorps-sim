# CLAUDE.md - Coding Guidelines

## Build & Test Commands
- Start development server: `npm start`
- Build production: `npm run build`
- Preview build: `npm run preview`
- Run all tests: `npm test`
- Run specific test: `npm test -- -t "test name"` or `npx vitest path/to/test.js`


## Code Style Guidelines
- **Formatting**: Use consistent indentation (2 spaces) and trailing semicolons
- **Imports**: Group imports by external libraries, then internal components, then types/utils
- **Types**: Use TypeScript types/interfaces for all components and props
- **Naming**:
  - Components: PascalCase (e.g., `HexGrid`)
  - Functions/variables: camelCase
  - Types/Interfaces: PascalCase (e.g., `Position`, `Unit`)
  - Redux actions: UPPERCASE_SNAKE_CASE (e.g., `SELECT_UNIT`)
- **Component Structure**: Functional components with explicit return types
- **Error Handling**: Use try/catch for async operations and provide user feedback
- **State Management**: Use context API with reducer pattern for complex state

## Other Guidelines
 - Do not npm start to check changes.