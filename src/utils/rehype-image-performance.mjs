const visit = (node, visitor) => {
  if (!node || typeof node !== 'object') return;
  visitor(node);
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => visit(child, visitor));
  }
};

export default function rehypeImagePerformance() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'img') return;

      node.properties ||= {};
      node.properties.loading ||= 'lazy';
      node.properties.decoding ||= 'async';
      node.properties.fetchpriority ||= 'low';
    });
  };
}
