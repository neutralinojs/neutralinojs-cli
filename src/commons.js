const figlet = require('figlet');
 
module.exports.figlet = () => {
    figlet('Neutralinojs', function(err, data) {
        console.log(data)
    });
}