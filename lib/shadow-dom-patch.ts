type PatchedNode = Node & { __modusShadowPatched?: boolean };

if (typeof Node !== 'undefined') {
  const proto = Node.prototype as PatchedNode;
  if (!proto.__modusShadowPatched) {
    const originalRemoveChild = Node.prototype.removeChild;
    const originalInsertBefore = Node.prototype.insertBefore;

    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    Node.prototype.insertBefore = function <T extends Node>(newNode: T, ref: Node | null): T {
      try {
        return originalInsertBefore.call(this, newNode, ref) as T;
      } catch {
        return newNode;
      }
    };

    proto.__modusShadowPatched = true;
  }
}
