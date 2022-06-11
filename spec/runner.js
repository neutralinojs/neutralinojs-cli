const { execSync } = require("child_process");

function run(command){
    let output;
    try{
        output = execSync(command);
    }
    catch(err){
        return { status : err.status};
    }
    return decodeUTF8(output);
}

function decodeUTF8(decode){
    return decode?.toString('utf8');
}

module.exports = {
    run
}
