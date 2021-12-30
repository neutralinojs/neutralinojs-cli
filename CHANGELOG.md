# Changelog

Add all code changes (features, deprecations, and enhancements) under the `Unreleased` topic to track changes for
the next release. Once the changes are released,
rename `Unreleased` topic with the new version tag. Finally, create a new `Unreleased` topic for future changes.

## Unreleased

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
