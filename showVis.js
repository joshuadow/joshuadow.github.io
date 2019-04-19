function showVis(id){

	var one = id.getAttribute('id');
	document.getElementById('editor').innerHTML = '';
	document.getElementById('editor').className = codeStore[one].type + " hljs"

	document.getElementById('editor').innerHTML = codeStore[one] && codeStore[one].code ? codeStore[one].code : 'This section is Empty! '
	document.getElementById('totalContainer').style.display = "block";
	document.querySelectorAll('pre code').forEach((block) => {
	  hljs.highlightBlock(block);
})};