const newlint = document.querySelector('.newlint');
const allProblems = document.querySelector('.label-problems');
const allProblemsError = document.querySelector('.all-problems__errors');
const allProblemsWarnings = document.querySelector('.all-problems__warnings');
const allFixProblemsErrors = document.querySelector('.fixible-problems__errors');
const allFixProblemsWarnings = document.querySelector('.fixible-problems__warnings');
const buttonBox = document.querySelector('.button-box');
const time = document.querySelector('.time');

newlint.addEventListener('click', () => {
    newlint.innerHTML = 'LOADING';
    newlint.setAttribute("disabled", "disabled");

    fetch('/new')
        .then(response => {
            const data = response.json();
            replaceData(data);
        })
        .catch(() => {
            newlint.innerHTML = 'ERROR';
        });
});

function replaceData(data) {
    time.innerHTML = 'just now';
    allProblems.innerHTML = data.info.problems;
    allProblemsError.innerHTML = data.info.errors + ' errors';
    allProblemsWarnings.innerHTML = data.info.warnings + ' warnings';
    allFixProblemsErrors.innerHTML = data.fix.errors + ' errors';
    allFixProblemsWarnings.innerHTML = data.fix.warnings + ' warnings';
    newlint.innerHTML = 'NEW LINT';
    newlint.removeAttribute("disabled");
}