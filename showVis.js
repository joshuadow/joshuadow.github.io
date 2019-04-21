function showVis(id){

	var one = id.getAttribute('id');
	document.getElementById('editor').innerHTML = '';
	document.getElementById('pdfContainer').style.display = "none";
	document.getElementById('editor').className = codeStore[one].type + " hljs"

	document.getElementById('editor').innerHTML = codeStore[one] && codeStore[one].code ? codeStore[one].code : 'This section is Empty! '
	document.getElementById('totalContainer').style.display = "block";
	document.querySelectorAll('pre code').forEach((block) => {
	  hljs.highlightBlock(block);
})};

function showPDF(id){
	var one = id.getAttribute('id');
	document.getElementById('editor').innerHTML = '';
	document.getElementById('pdfEmbed').src = '';
	document.getElementById('totalContainer').style.display = "none";
	switch(one){
		case "pdf1":
			document.getElementById('pdfEmbed').src = "imgs/418Assigment1(1).pdf";
			break;
		case "pdf2":
			document.getElementById('pdfEmbed').src = "imgs/418Assignment2(1).pdf";
			break;
		case "pdf3":
			document.getElementById('pdfEmbed').src = "imgs/418Assignment3(1).pdf";
			break;
		case "pdf4":
			document.getElementById('pdfEmbed').src = "imgs/PMAT_315_Assignment_1.pdf";
			break;
		case "pdf5":
			document.getElementById('pdfEmbed').src = "imgs/PMAT_315_Assignment_2.pdf";
			break;
		case "pdf6":
			document.getElementById('pdfEmbed').src = "imgs/CPSC_413_Assignment_3.pdf";
			break;
		case "pdf7":
			document.getElementById('pdfEmbed').src = "imgs/CPSC_413_Assignment_4__Copy_.pdf";
			break;
		case "pdf8":
			document.getElementById('pdfEmbed').src = "imgs/CPSC_530_Project_Proposal__Copy.pdf";
			break;
		case "pdf9":
			document.getElementById('pdfEmbed').src = "imgs/CPSC 313 Fall 2016 Final Cheat Sheet.pdf";
			break;
		case "pdf10":
			document.getElementById('pdfEmbed').src = "imgs/CPSC_530_Final_Paper.pdf";
			break;
	}
	document.getElementById('pdfContainer').style.display = "block";
};