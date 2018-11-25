var fs = require('fs');

// Change the content of the file as you want
// or either set fileContent to null to create an empty file
var fileContent = "Hello World!";

// The absolute path of the new file with its name
var filepath = "mynewfile.txt";

fs.writeFile(filepath, fileContent, (err) => {
    if (err) throw err;

    console.log("The file was succesfully saved!");
});