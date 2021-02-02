export default function DomChangesListener() {
  const events = [];

  this.emit = (name, data) => {
    if (typeof data === "object" && data.dataset && !data.dataset.nbPassed) {
      data.dataset.nbPassed = true;
      events.forEach((e) => {
        if (e.name === name) {
          e._cb(data);
        }
      });
    }
  };

  this.on = (name, _cb) => {
    events.push({ name, _cb });
  };

  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const addedNodes = Array.from(mutation.addedNodes);
      const self = this;

      addedNodes.forEach(function nodeHandler(node) {
        const { classList } = node;

        if (node.id === "mod_files") {
          const nodes = [...node.querySelectorAll(".tabbed-section.tabbed-block.files-tabs")];
          nodes.forEach(nodeHandler);
        } else if (classList && classList.contains("files-tabs")) {
          self.emit("files_tab", node);
        } else if (classList && classList.contains("widget-mod-requirements")) {
          self.emit("files_tab", node);
        }
      });
    });
  }).observe(document, {
    childList: true,
    subtree: true
  });
}
