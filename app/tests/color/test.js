var currentFile = require('system').args[4];
var curFilePath = fs.absolute(currentFile).split('/');
curFilePath.pop(); // Remove filename from path
var module_name = curFilePath.pop(); // Get module name
curFilePath.pop(); // Remove casper folder from path
var test_dir = curFilePath.join('/'); // Rebuild the path
var url = "file://" + test_dir + "/" + module_name + "/test.html";

casper.test.begin('esColor', 1, function suite(test) {
    casper.start(url)
        .then(function() {
            test.assertTitle("Color", "This is the right page !");
        });

    casper.run(function() {
        test.done();
    });
});
