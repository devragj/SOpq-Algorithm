"use strict";

function displayInputAndOutput(paramObj) {
        displayText(paramObj.parseParameter());
        let tabPair = Tableaux.SOpqSpnRRobS(paramObj.parameter);
        tabPair.draw();
}

function displayInputAndOutputSteps(paramObj) {
        displayText(paramObj.parseParameter());
        displayText("-------------");
        Tableaux.SOpqSpnRRobSDraw(paramObj.parameter);
}


function displayRandom(n, pairs) {
        let paramObj = Parameter.generateParameter(n, pairs);
        displayInputAndOutput(paramObj);
}

function displayRandomDrawAll(n, pairs) {
        let paramObj = Parameter.generateParameter(n, pairs);
        displayInputAndOutputSteps(paramObj);
}

function displayParameter(permString) {
        let paramObj = Parameter.getParameter(permString);
        displayInputAndOutput(paramObj);
}

function displayParameterDrawAll(permString) {
        let paramObj = Parameter.getParameter(permString);
        displayInputAndOutputSteps(paramObj);
}

function displayText(text) {
        let wrapper = document.createElement('div');
        wrapper.className = "comment";
        let content = document.createTextNode(text);
        wrapper.appendChild(content);
        document.body.appendChild(wrapper);
}

function clearPrevious() {
        let commentList = document.getElementsByClassName('comment');
        for (let index = commentList.length - 1; index >= 0; --index) {
                let comment = commentList[index];
                comment.parentNode.removeChild(comment);
        }

        let tableauxList = document.getElementsByClassName('tableauPairRender');

        for (let index = tableauxList.length - 1; index >= 0; --index) {
                let tableaux = tableauxList[index];
                tableaux.parentNode.removeChild(tableaux);
        }
}

function getInputForRandom() {
        let n = parseInt(document.getElementById('nbox').value);
        if (!n) {
                displayText("Please enter a size for the parameter in the textbox labeled n.");
                return false;
        }

        let pairs = parseInt(document.getElementById('pbox').value);
        if (!pairs && pairs != 0) {
                pairs = undefined;
        }

        return {n: n, pairs: pairs}
}

function runInput() {
        clearPrevious();
        let pageInput = getInputForRandom();
        if (!pageInput) {
                return;
        }

        displayRandom(pageInput.n, pageInput.pairs);
}

function runSteps() {
        clearPrevious();
        let pageInput = getInputForRandom();
        if (!pageInput) {
                return;
        }

        displayRandomDrawAll(pageInput.n, pageInput.pairs);
}

function runParameter() {
        clearPrevious();
        let parameter = document.getElementById('parameterBox').value.trim();
        displayParameter(parameter);
}

function runParameterSteps() {
        clearPrevious();
        let parameter = document.getElementById('parameterBox').value.trim();
        displayParameterDrawAll(parameter);
}

function randomKey(event) {
        event.preventDefault();
        if (event.keyCode == 13) {
                document.getElementById("runRandomButton").click();
        }
}

function parameterKey(event) {
        event.preventDefault();
        if (event.keyCode == 13) {
                document.getElementById("runParameterButton").click();
        }
}

function showHide(info) {
        let divToToggle;
        if (typeof(info) == "string") {
                divToToggle = document.getElementById(info);
        } else {
                divToToggle = info;
        }

        if (divToToggle.style.display == 'block') {
                divToToggle.style.display = 'none';
        } else {
                divToToggle.style.display = 'block';
        }

}

function toggleDiv(button) {
        let text = button.innerHTML;
        let divName = "Div";
        if (text[0] == "H") {
                let newText = text.slice(5);
                divName = newText + divName;
                button.innerHTML = newText;
        }

        else {
                divName = text + divName;
                button.innerHTML = "Hide " + text;
        }

        let div = document.getElementById(divName);
        showHide(div);
}
