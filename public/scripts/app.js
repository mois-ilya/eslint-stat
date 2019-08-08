'use strict';

var newlint = document.querySelector('.newlint');
var mode = document.getElementById("mode");
var allProblems = document.querySelector('.label-problems');
var allProblemsError = document.querySelector('.all-problems__errors');
var allProblemsWarnings = document.querySelector('.all-problems__warnings');
var allFixProblemsErrors = document.querySelector('.fixible-problems__errors');
var allFixProblemsWarnings = document.querySelector('.fixible-problems__warnings');
var buttonBox = document.querySelector('.button-box');
var time = document.querySelector('.time');

newlint.addEventListener('click', function () {
    newlint.innerHTML = 'LOADING';
    newlint.setAttribute("disabled", "disabled");

    fetch('/new').then(function (response) {
        return response.json();
    }).then(function (data) {
        replaceData(data);
    }).catch(function () {
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

function initTheme() {
    var globalDarkMode = Boolean(window.matchMedia("(prefers-color-scheme: dark)").matches),
    isDarkModeUser = false;

    // When browser window loads, check User setting of dark mode
    isDarkModeUser = window.localStorage.getItem("flagMode") === "true";

    mode.checked = Boolean(isDarkModeUser ^ !globalDarkMode);
    mode.addEventListener('click', toggle);
}

function toggle() {
    if (isDarkModeUser) {
        window.localStorage.setItem("flagMode", "false");
    } else {
        window.localStorage.setItem("flagMode", "true");
    }
}

initTheme();
cssVars({});
