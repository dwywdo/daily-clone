# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Daily Clone Obsidian plugin - a community plugin that helps users mass create daily notes between specified date ranges. The plugin integrates with Templater to apply templates and creates a series of daily note files with configurable content structure.

**Key Features:**
- Mass creation of daily notes with date range selection
- Integration with Templater plugin for template application
- Date validation and user feedback
- Mobile-compatible design

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Development build with file watching and inline sourcemaps
- `npm run build` - Production build (minified, no sourcemaps, TypeScript type checking)
- `npm run version` - Bump version in manifest.json and update versions.json
- `eslint main.ts` - Lint the main TypeScript file (requires global eslint installation)

## Architecture

**Entry Point**: `main.ts` compiles to `main.js` using esbuild bundler

**Core Components:**
- `DailyClonePlugin` - Main plugin class extending Obsidian's Plugin base class
- `InputModal` - Modal dialog for date range input with HTML5 date pickers
- `DailyCloneSettingTab` - Settings interface (currently basic implementation)
- `createDailyNotesBetweenDates()` - Core function that generates daily note files and integrates with Templater
- `SampleModal` - Legacy modal (should be cleaned up)

**Plugin Integration:**
- Templater plugin integration via `app.plugins.plugins["templater-obsidian"]`
- Accesses Templater settings for folder templates configuration
- Uses Obsidian's vault API for file creation and existence checking

## Current Implementation Issues

The code contains several issues that should be addressed:
- Line 1: Unused import `setEngine` from crypto
- Line 100: References `SampleModal` instead of `InputModal` in clone-daily-notes command
- Lines 104-142: Sample plugin code that should be removed (unused commands, intervals, DOM events)
- Lines 158-172: Unused `SampleModal` class
- Lines 38-46: Debug console.log statements accessing Templater settings
- Settings implementation is placeholder and needs proper configuration

## Build System

- **Bundler**: esbuild (config in `esbuild.config.mjs`)
- **Target**: ES2018, CommonJS format for Obsidian compatibility
- **External Dependencies**: Obsidian API, Electron, and CodeMirror modules marked as external
- **Development**: Watch mode with inline sourcemaps
- **Production**: Minified output with tree shaking

## File Structure

```
daily-clone/
├── main.ts           # Main plugin logic (needs refactoring)
├── manifest.json     # Plugin metadata
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── esbuild.config.mjs # Build configuration
├── styles.css        # Plugin styles
├── versions.json     # Version compatibility mapping
└── version-bump.mjs  # Version management script
```

## Development Guidelines

**Code Organization:**
- All logic currently in single `main.ts` file - consider splitting into modules for better maintainability
- Remove unused sample plugin code before adding new features
- Follow TypeScript strict mode conventions

**Plugin API Usage:**
- Uses `this.addRibbonIcon()` for UI integration
- Uses `this.addCommand()` for command palette integration
- Uses `app.vault.create()` and `app.vault.adapter.exists()` for file operations
- Integrates with external plugins via `app.plugins.plugins` registry

**Testing:**
- Manual testing: Copy `main.js`, `manifest.json`, `styles.css` to `.obsidian/plugins/daily-clone/`
- Reload Obsidian and enable plugin in Community plugins settings
- Test date range functionality and Templater integration

## Key Implementation Details

**Date Handling:**
- Uses HTML5 date inputs for cross-platform compatibility
- Validates date ranges (start ≤ end)
- Generates ISO date strings in YYYY-MM-DD format
- Iterates through date range day by day

**File Creation:**
- Creates files in vault root with `YYYY-MM-DD.md` naming convention
- Checks for existing files before creation to avoid overwriting
- Adds basic heading with date as initial content
- Provides user feedback via Notice API

**Templater Integration:**
- Accesses Templater plugin settings for folder template configuration
- Currently logs debug information about Templater settings
- Integration is experimental and needs proper error handling