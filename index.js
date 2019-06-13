const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const express = require('express');
const { format } = require('timeago.js');

const app = express();

const cwd = 'C:\\inetpub\\getcaesar_eslint_view';
execSync(`npm run scss`);

app.use(express.static('public'));

app.engine('ntl', function (filePath, options, callback) {
  fs.readFile(filePath, function (err, template) {
    if (err) {
      console.log('Tets');
      return callback(new Error(err));
    }

    let rendered = template.toString();
    const opt = options.options;

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

  res.render('index', {
    options: {
      allProblems: last.info.problems,
      errors: last.info.errors,
      warns: last.info.warnings,
      fixErrors: last.fix.errors,
      fixWarns: last.fix.warnings,
      time: format(last.date),
      vconfig: last.vconfig
    }
  });
});

app.get('/check', function(req, res) {
  res.render('check');
});

app.get('/config', function(req, res) {
  const config = JSON.parse(fs.readFileSync('/public/eslintrc.json', 'utf8'));
  res.send(config);
});

app.get('/eslintrc', function(req, res) {
  res.sendFile(path.resolve('public/eslintrc.json'));
});

app.get('/time', function(req, res) {
  const history = fs.readFileSync('info.json', 'utf8');

  res.render('time', {
    options: {
      history
    }
  });
});

app.get('/new', newLint);

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
  const infoObjectH = JSON.parse(fs.readFileSync('info.json', 'utf8')).history;
  return infoObjectH[infoObjectH.length - 1];
}

function newLint(req, res) {
  exec(`cleartool update`, {cwd: cwd}, () => {
      exec(`describe.bat`, (error, r) => {
        const tag = r.split('\n')[0];
        const infoObject = JSON.parse(fs.readFileSync('info.json', 'utf8'));

        if (infoObject.vconfig !== tag) {
            fs.copyFileSync('../../.eslintrc.json', 'public/eslintrc.json');
            infoObject.vconfig = tag;
            console.log('config updated');
        }

        exec(`eslint . --no-color -o ${__dirname}/lastLint.st`, {cwd: cwd}, () => {
          console.log('lint complited');
          const readedFile = fs.readFileSync('lastLint.st', 'utf8');
          const result = parse(readedFile, tag);

          infoObject.history.push(result);
          fs.writeFileSync("info.json", JSON.stringify(infoObject, null, '\t'))

          res.send(result);
      })
    })
  })
}

function parse(contents, vconfig) {
    const arrayLines = contents.split('\n');
    const lLines = arrayLines.length;
    const arrayLastLines = arrayLines.slice(lLines - 3, lLines - 1);

    const result = {
      date: new Date(),
      info: parseFirst(arrayLastLines),
      fix: parseSecond(arrayLastLines),
      vconfig: vconfig
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