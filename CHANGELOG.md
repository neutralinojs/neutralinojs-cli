# Changelog

Add all code changes (features, deprecations, and enhancements) under the `Unreleased` topic to track changes for
the next release. Once the changes are released,
rename `Unreleased` topic with the new version tag. Finally, create a new `Unreleased` topic for future changes.

## Unreleased

### General
- Improve log messages and styles

### Core: Runner
- Display Neutralinojs process's STDIN and STDERR streams directly on the console.
- Remove `--verbose` option from the `run` command.

## v9.1.2

### Core: Runner
- Fix client library path issue with hot-reload workaround on Windows.

## v9.1.1

### Bugfixes
- Fix browser mode exit issue with `neu run`.

## v9.1.0

### Core: Runner
- Add a workaround to use hot module reloading from the app developer's existing frontend library/framework.

## v9.0.0

### Core: Creator
- Allow downloading any community template via `neu create myapp --template <template>`. `<template>` accepts valid GitHub repo identifiers. The default value is `neutralinojs/neutralinojs-minimal`.

### Core: Runner
- Add `--verbose` option to identify framework initialization crashes. It will show STDERR and STDOUT of the framework once the process was terminated.
- Support sending any internal CLI argument to the Neutralinojs process via `neu run -- <additional_args>`.
- Remove `--mode=<mode>` option from `run` since the same work can be done with `neu run -- --mode=<mode>`.

### Bugfixes and improvements
- Fix the infinite retry issue with the `neu run` command.
- Show an error message for download failures.

## v8.1.0

### Core: File watcher
- Exclude auto-reload files via `cli.autoReloadExclude`.
- Watch only the `cli.resourcesDir` to avoid many unwanted reloads.

### Core: Bundler
- Add new `--copy-storage` flag to automatically copy storage data to the app bundle.

## v8.0.1

### Core: Bundler
- Make `cli.extensionsDir` optional for bundling process.

### Bugfixes
- Fix an issue in websocket error log.

## v8.0.0

### Core: Bundler
- Copy extensions to the app bundle.
- Rename `res.neu` to `resources.neu`.

### Core: Runner
- Use websocket connection to auto reload app.

## v7.1.0

### Core: Downloader
- Use server/client versions from config

### `neu version`
- Removed global Neutralino version details
