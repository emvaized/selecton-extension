document.getElementById('text-input').oninput = function (e) {
    document.getElementById('text-input-result').innerHTML = e.target.value;
}