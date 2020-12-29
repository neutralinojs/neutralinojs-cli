# neutralinojs-cli
![npm](https://img.shields.io/npm/v/@neutralinojs/neu)
![npm](https://img.shields.io/npm/dt/@neutralinojs/neu)

neu cli for Neutralinojs

```
  $ npm i -g @neutralinojs/neu
```

Synopsis

- `neu create myapp --template <templateName>`
- `neu build`
- `neu run`
- `neu release`
- `neu update`
- `neu plugins [packageName] [--remove, --add]`

Supported templates

Generic

- Javascript `--template js`
- Typescript `--template ts`
- Kotlin `--template kotlin`

Frameworks/Libraries

- React `--template react`
- Svelte `--template svelte`

### Plugins

Neutralinojs app developers are able to write custom `neu-cli` plugins to add their own commands to the main CLI. Plugins can be developed as per below.

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

Once you publish your `neu-cli` plugin to npm directory anyone will be able to use it using,

```bash
 $ neu plugins --add <packageName>
```

and it can be removed using,

```bash
 $ neu plugins --remove <packageName>
```


### License


[MIT](LICENSE)
