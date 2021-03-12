export function findNodes(element: HTMLElement, selector: string) {
  return element.querySelectorAll(selector) as NodeListOf<HTMLElement>;
}

export function removeNode(node: Node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
