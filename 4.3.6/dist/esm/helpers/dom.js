export function findNodes(element, selector) {
    return element.querySelectorAll(selector);
}
export function removeNode(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
