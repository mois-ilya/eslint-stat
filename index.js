const express = require('express');
const app = express();
const { exec } = require('child_process');
var fs = require('fs');

const pathView = 'C:\\inetpub\\getcaesar_eslint_view';

app.get('/', function(req, res) {
  res.send('hello world');
});

app.get('/calc', function(req, res) {
    exec(`cleartool update`, () => {
      exec(`eslint . --no-color -o lastLint.st`, () => {
        fs.readFile('lastLint.st', 'utf8', (err, contents) => res.send(parse(contents)));
      }
    )
  })
});

app.get('/old', function(req, res) {
  res.send(parseFile());
});

app.listen(3000, function () {
    console.log('Start listening on port 3000!');
  });

function parseFile() {
  const readedFile = fs.readFileSync('lastLint.st', 'utf8');
  const result = parse(readedFile);
  console.log(result);

  return result;
}

function parse(contents) {
    const arrayLines = contents.split('\n');
    const lLines = arrayLines.length;
    const arrayLastLines = arrayLines.slice(lLines - 3, lLines - 1);

    const result = {
      info: parseFirst(arrayLastLines),
      fix: parseSecond(arrayLastLines)
    }

    return result;
}

function parseFirst(original) {
  const str = original[0];

  const problemsIndex = str.search( /problems/i );
  const errorsIndex = str.search( /errors/i );
  const warningsIndex = str.search( /warnings/i );

  const problemsLenght = 'problems'.length + 2;
  const errorsLenght = 'errors'.length + 2;

  return {
    problems: str.slice(2, problemsIndex - 1),
    errors: str.slice(problemsIndex + problemsLenght, errorsIndex - 1),
    warnings: str.slice(errorsIndex + errorsLenght, warningsIndex - 1)
  }
}


function parseSecond(original) {
  const str = original[1];

  const errorsIndex = str.search( /errors/i );
  const warningsIndex = str.search( /warnings/i );

  const errorsLenght = 'errors'.length + 5;

  return {
    errors: str.slice(2, errorsIndex - 1),
    warnings: str.slice(errorsIndex + errorsLenght, warningsIndex - 1)
  }
}