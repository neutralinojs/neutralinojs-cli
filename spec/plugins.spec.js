import { runner, runnerOptions } from "./runner.js";

describe("neu plugins", () => {
    
    before(async () => {
        await runner.createProject();
    });

    after(async () => {
        await runner.removeProject();
    });

    it("shows help for plugins command", async () => {
        const output = await runner.run("plugins --help");
        expect(output).to.include("plugins");
    });

    it("lists installed plugins", async () => {
        const output = await runner.run("plugins");
        expect(output).to.not.throw;
    });

    it("adds a plugin", async () => {
        const output = await runner
            .run("plugins --add neutralinojs/neutralino-ext");
        expect(output).to.not.throw;
    });

    it("removes a plugin", async () => {
        const output = await runner
            .run("plugins --remove neutralino-ext");
        expect(output).to.not.throw;
    });

});
