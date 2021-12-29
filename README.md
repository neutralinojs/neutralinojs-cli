# neutralinojs-cli
![npm](https://img.shields.io/npm/v/@neutralinojs/neu)
![npm](https://img.shields.io/npm/dt/@neutralinojs/neu)

neu cli for Neutralinojs

```
  $ npm i -g @neutralinojs/neu
```

Synopsis

- `neu create <binaryName>`
- `neu build [--release]`
- `neu run [--mode=<mode> --arch=<arch> --disable-auto-reload]`
- `neu update`
- `neu plugins [packageName] [--remove, --add]`
- `neu version`

### Requirements

- Node.js v14 or above.
- npm, npx, or yarn package manager.

### Plugins

Neutralinojs app developers are able to write custom `neu-cli` plugins to add their own commands to the main CLI. Plugins can be developed as explained below.

#### Implementing the plugin

`neu-cli` will register plugins using `index.js` as an interface.

```js
// index.js
module.exports = {
  command: 'commandname <action1>',
  register: (command, modules) => {
    command.option('--option1 --option2')
     .action((action1, command) => {
        //your logic goes here..
     });
  }
}
```

`command` is the cli command string with actions. `register` will be called when plugin is being registered with `neu-cli`. Thus, it has the command object and [standard modules object](https://github.com/neutralinojs/neutralinojs-cli/blob/master/src/modules/index.js) as parameters. Please check [commander](https://www.npmjs.com/package/commander) for more information about commands and objects.

#### Publishing the plugin

Once you publish your `neu-cli` plugin to npm registry, anyone will be able to use it using:

```bash
 $ neu plugins --add <packageName>
```

and it can be removed using:

```bash
 $ neu plugins --remove <packageName>
```

### License

[MIT](LICENSE)

### Contributors

<a href="https://github.com/neutralinojs/neutralinojs-cli/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=neutralinojs/neutralinojs-cli" />
</a>

Made with [contributors-img](https://contrib.rocks).
