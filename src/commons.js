const figlet = require('figlet');
 
module.exports.figlet = (callback) => {
    figlet('Neutralinojs', function(err, data) {
        console.log(data);
        if(callback)
            callback();
    });
}