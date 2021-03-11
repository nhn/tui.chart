/**
 * @fileoverview DOM Utils
 * @author NHN FE Development Lab <dl_javascript@nhn.com>
 */
import { toArray } from './utils';

/**
 * Find nodes matching by selector
 * @param {HTMLElement} element - target element
 * @param {string} selector - selector to find nodes
 * @returns {Array.<Node>} found nodes
 * @ignore
 */
export function findNodes(element: HTMLElement, selector: string) {
  const nodeList = toArray(element.querySelectorAll(selector));

  if (nodeList.length) {
    return nodeList;
  }

  return [];
}

/**
 * Removes target node from parent node
 * @param {Node} node - target node
 * @ignore
 */
export function removeNode(node: Node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

/**
 * Finalize html result
 * @param {Element} html root element
 * @param {boolean} needHtmlText pass true if need html text
 * @returns {string|DocumentFragment} result
 * @ignore
 */
export function finalizeHtml(html: Element, needHtmlText: boolean) {
  let result;

  if (needHtmlText) {
    result = html.innerHTML;
  } else {
    const frag = document.createDocumentFragment();
    const childNodes = toArray(html.childNodes);
    const { length } = childNodes;

    for (let i = 0; i < length; i += 1) {
      frag.appendChild(childNodes[i]);
    }
    result = frag;
  }

  return result;
}
