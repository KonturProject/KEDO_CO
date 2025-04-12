function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var dragged = document.getElementById(data);
    var target = ev.target.closest('li');
    if (target) {
        target.parentNode.insertBefore(dragged, target.nextSibling);
    }
    updateOrder();
}

function updateOrder() {
    var order = Array.from(document.querySelectorAll('#block-list li')).map(li => li.id);
    document.getElementById('block-order').value = order.join(',');
}

document.querySelector('form').addEventListener('submit', updateOrder);