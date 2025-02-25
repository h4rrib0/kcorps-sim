# CLAUDE.md - Coding Guidelines

## Build & Test Commands
- Start development server: `npm start`
- Build production: `npm run build`
- Preview build: `npm run preview`
- Run all tests: `npm test`
- Run specific test: `npm test -- -t "test name"` or `npx vitest path/to/test.js`
- Lint code: `npm run lint` (if available)

## Code Style Guidelines
- **Formatting**: 2-space indentation, trailing semicolons, max 100 chars per line
- **Imports**: Group by: 1) external libs 2) components 3) types/utils 4) styles
- **Types**: Use TypeScript for all components, props, and state
- **Naming**:
  - Components/Classes: PascalCase (e.g., `HexGrid`, `MapData`)
  - Functions/variables: camelCase (e.g., `handleTileClick`)
  - Types/Interfaces: PascalCase (e.g., `Position`, `Unit`)
  - Actions: UPPERCASE_SNAKE_CASE (e.g., `SELECT_UNIT`, `LOAD_STATE`)
- **Component Structure**: Functional components with explicit return types
- **Error Handling**: Use try/catch for async operations and provide user feedback
- **State Management**: Use context API with reducer pattern for game state
- **SVG Calculations**: Add buffer space to prevent clipping of elements

## Project Structure
- Keep map editing logic separate from game logic
- State persistence handles: auto-save, manual save, export/import, and reset
- Components implement proper parent-child relationships for state flow