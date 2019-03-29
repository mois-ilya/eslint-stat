const express = require('express');
const app = express();
const { exec } = require('child_process');
var fs = require('fs');
const { format, render, cancel, register } = require('timeago.js');

const pathView = 'C:\\inetpub\\getcaesar_eslint_view';

app.engine('ntl', function (filePath, options, callback) {
  fs.readFile(filePath, function (err, template) {
    if (err) {
      console.log('Tets');
      return callback(new Error(err));
    }

    let rendered = template.toString();
    const opt = options.options;
    console.log(opt);

    for (const key in opt) {
      rendered = rendered.replace(`#${key}#`, opt[key])
    }

    return callback(null, rendered);
  });
});


app.set('views', './views');
app.set('view engine', 'ntl');

app.get('/', function(req, res) {
  const last = getLast();
  console.log(last);

  res.render('index', {
    options: {
      allProblems: last.info.problems,
      errors: last.info.errors,
      warns: last.info.warnings,
      fixErrors: last.fix.errors,
      fixWarns: last.fix.warnings,
      time: format(last.date)
    }
  });
});

app.get('/new', function(req, res) {
    exec(`cleartool update`, () => {
      exec(`eslint . --no-color -o lastLint.st`, () => {
        res.send(parseFile());
      }
    )
  })
});

app.get('/last', function(req, res) {
  const result = getLast();
  res.send(result);
});

app.get('/all', function(req, res) {
  const result = JSON.parse(fs.readFileSync('info.json', 'utf8'));
  res.send(result);
});


app.listen(3000, function () {
    console.log('Start listening on port 3000!');
  });

function getLast() {
  const infoObject = JSON.parse(fs.readFileSync('info.json', 'utf8')).history;
  return infoObject[infoObject.length - 1];
}

function parseFile() {
  const readedFile = fs.readFileSync('lastLint.st', 'utf8');
  const result = parse(readedFile);

  const infoObject = JSON.parse(fs.readFileSync('info.json', 'utf8'));
  infoObject.history.push(result);
  fs.writeFileSync("info.json", JSON.stringify(infoObject, null, '\t'))

  return result;
}

function parse(contents) {
    const arrayLines = contents.split('\n');
    const lLines = arrayLines.length;
    const arrayLastLines = arrayLines.slice(lLines - 3, lLines - 1);

    const result = {
      date: new Date(),
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