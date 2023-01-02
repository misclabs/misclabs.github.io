// Misc. Notebook Library

function mnbRndrMrkdwnByCls(cls='note') {
	// Render markdown
	const noteEls = document.getElementsByClassName(cls);
	for (let i=0; i < noteEls.length; ++i) {
		noteEls[i].innerHTML =
			marked.parse(noteEls[i].innerHTML);
	}
}