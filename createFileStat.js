const fs = require('fs');
const path = require('path');
const jsonBeautify = require("json-beautify");

function createFileStat() {
    const lintResult = fs.readFileSync('lastLint.st', 'utf8');
    const files = lintResult
                .split('C:\\inetpub\\getcaesar_eslint_view\\GetCaesar\\gui\\js')
                .slice(1)
                .map(file => {
                    var arrayStrings = file.split('\n');
                    return {
                        fileName: path.basename(arrayStrings[0]),
                        // errors: arrayStrings.slice(1, -2).map(x => x.trim()),
                        problemsCount: arrayStrings.length - 1
                    }}
                )
                .sort((a,b) => a.problemsCount > b.problemsCount ? -1 : 1);

    const fileStat = jsonBeautify(files, null, 2, 80);
    fs.writeFileSync('fileStat.json', fileStat);
    return fileStat;
}

module.exports = createFileStat;