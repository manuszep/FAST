var module_name = "color";
var currentFile = require('system').args[4];
var curFilePath = fs.absolute(currentFile).split('/');
curFilePath.pop();
curFilePath.pop();
curFilePath.pop();
curFilePath.pop();
var tmp_dir = curFilePath.join('/') + '/tmp';
var url = "file://" + tmp_dir + "/tests/" + module_name + "/test.html";

console.log(url);

casper.test.begin('esColor', 1, function suite(test) {
    casper.start(url, function() {
        test.assertTitle("Mocha Test Runner", "google homepage title is the one expected");
    });

    casper.run(function() {
        test.done();
    });
});
