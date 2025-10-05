# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Daily Clone Obsidian plugin - a community plugin that helps users mass create daily notes between specified date ranges. The plugin allows users to create multiple daily notes with customizable templates, filename formats, and folder locations.

**Key Features:**
- Mass creation of daily notes with date range selection
- Template file integration for consistent note structure
- Configurable filename formats using moment.js
- Flexible folder placement with intelligent suggestions
- Mobile-compatible design

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Development build with file watching and inline sourcemaps
- `npm run build` - Production build (minified, no sourcemaps, TypeScript type checking)
- `npm run version` - Bump version in manifest.json and update versions.json
- `eslint src/` - Lint all TypeScript files (requires global eslint installation)

## Modular Architecture

**Entry Point**: `src/main.ts` compiles to `main.js` using esbuild bundler

### File Structure
```
src/
├── main.ts                 # Main plugin class (40 lines)
├── types.ts               # TypeScript interfaces and type definitions
├── settings/
│   ├── index.ts          # Settings defaults and exports
│   └── settingsTab.ts    # Settings UI implementation
├── ui/                   
│   ├── modals.ts         # InputModal for date range selection
│   └── suggests.ts       # FolderSuggest and FileSuggest components
└── core/
    └── dailyNotes.ts     # Daily note creation logic
```

### Module Responsibilities

**`src/main.ts`** (Plugin Lifecycle)
- Plugin initialization and cleanup
- Command and ribbon icon registration
- Settings management coordination

**`src/types.ts`** (Type Definitions)
- `DailyClonePluginSettings` interface
- `DailyClonePlugin` interface for type safety
- Shared type definitions across modules

**`src/settings/`** (Settings Management) 
- Default settings configuration
- Settings UI with folder/file suggestions
- Moment.js format validation and preview

**`src/ui/`** (User Interface Components)
- `InputModal`: Date range selection with HTML5 date pickers
- `FolderSuggest`: Intelligent folder path completion
- `FileSuggest`: Template file search and selection

**`src/core/`** (Business Logic)
- `createDailyNotesBetweenDates()`: Main daily note creation function
- Template content processing
- File existence checking and creation
- Error handling and user feedback

## Build System

- **Bundler**: esbuild (config in `esbuild.config.mjs`)
- **Entry Point**: `src/main.ts` (updated from root `main.ts`)
- **Target**: ES2018, CommonJS format for Obsidian compatibility
- **External Dependencies**: Obsidian API, Electron, and CodeMirror modules marked as external
- **Development**: Watch mode with inline sourcemaps
- **Production**: Minified output with tree shaking

## Development Guidelines

### Code Organization
- **Separation of Concerns**: Each module has a single, well-defined responsibility
- **Type Safety**: All modules use proper TypeScript interfaces
- **Clean Dependencies**: No circular imports, clear module boundaries
- **Maintainability**: Small, focused files (average 50-100 lines)

### Plugin API Usage
- **Commands**: Registered in `main.ts`, implemented in UI modules
- **Settings**: Managed through dedicated settings module
- **File Operations**: Centralized in core module with proper error handling
- **UI Components**: Reusable suggestion components for consistent UX

### Adding New Features
1. **Types**: Add interfaces to `src/types.ts`
2. **Settings**: Extend settings interface and UI if needed
3. **Core Logic**: Implement business logic in `src/core/`
4. **UI Components**: Create reusable components in `src/ui/`
5. **Integration**: Wire up in `src/main.ts`

## Key Implementation Details

### Daily Note Creation Process
1. **Input Validation**: Date range validation with user feedback
2. **Folder Management**: Automatic folder creation if specified path doesn't exist
3. **Template Processing**: Optional template file content application
4. **Filename Generation**: Moment.js-based filename formatting
5. **Conflict Resolution**: Skip existing files, report creation/skip counts

### Suggestion Components
- **FolderSuggest**: Lists all vault folders with fuzzy search
- **FileSuggest**: Searches all files by name and path
- **Event Handling**: Proper onChange event triggering for settings persistence
- **UX**: Clean, consistent dropdown display with full paths

### Settings Architecture
- **Type Safety**: Strongly typed settings interface
- **Persistence**: Automatic save/load with proper defaults
- **UI Integration**: Real-time validation and preview
- **Extensibility**: Easy to add new settings without breaking existing functionality

## Testing

### Manual Testing Process
1. Build the plugin: `npm run build`
2. Copy artifacts to `.obsidian/plugins/daily-clone/`: `main.js`, `manifest.json`, `styles.css`
3. Reload Obsidian and enable plugin
4. Test core functionality:
   - Date range selection via ribbon icon or command palette
   - Settings persistence across reloads
   - Template file integration
   - Folder suggestion and creation

### Development Testing
- Use `npm run dev` for hot reloading during development
- Check browser console for any TypeScript or runtime errors
- Verify all suggestion components work correctly
- Test edge cases: invalid dates, missing templates, folder creation