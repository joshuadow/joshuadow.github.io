function PopUp(hideOrshow) {
    if (hideOrshow == 'hide'){ document.getElementById('ac-wrapper').style.display = "none";}
    else {document.getElementById('ac-wrapper').removeAttribute('style');}
}