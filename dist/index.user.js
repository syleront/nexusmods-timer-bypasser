// ==UserScript==
// @name Nexus Download Timer Bypasser
// @description Bypass nexus mod download timer page
// @namespace Syleront
// @include *://www.nexusmods.com/*
// @version 1.0.0
// @author Syleront
// @run-at document-start
// @copyright 2020, Syleront
// @license MIT
// ==/UserScript==

(function () {
  var querystring = {
    stringify(obj) {
      if (typeof obj == "object") {
        return Object.entries(obj).map((a) => {
          a[1] = encodeURIComponent(a[1]);
          return a.join("=");
        }).join("&");
      } else {
        throw new Error("parameter must be an object");
      }
    },

    parse(string) {
      const params = string.match(/[A-z%0-9\-.]+=[A-z%0-9\-.]+/g);

      if (params !== null) {
        const obj = {};

        params.forEach((e) => {
          const param = e.split("=");
          obj[param[0]] = param[1];
        });

        return obj;
      } else {
        return null;
      }
    }
  };

  var request = {
    _get(url, params, options) {
      const xhr = new XMLHttpRequest();
      if (params) url += "?" + querystring.stringify(params);

      xhr.open("GET", url, true);

      if (options) {
        Object.entries(options).forEach((option) => {
          xhr[option[0]] = option[1];
        });
      }

      xhr.send();

      return new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState != 4) return;
          if (xhr.status !== 200) {
            reject(xhr);
          } else {
            resolve(xhr.response);
          }
        };
      });
    },
    _post(type, url, params, options) {
      const xhr = new XMLHttpRequest();
      xhr.open(type, url, true);

      let { headers, formData, body } = params;

      if (headers) {
        Object.entries(headers).forEach((header) => {
          xhr.setRequestHeader(header[0], header[1]);
        });
      }

      if (formData === true) {
        const form = new FormData();

        Object.entries(body).forEach((data) => {
          form.append(data[0], data[1]);
        });

        body = form;
      }

      if (options) {
        Object.entries(options).forEach((option) => {
          xhr[option[0]] = option[1];
        });
      }

      xhr.send(body || "");

      return new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState != 4) return;
          if (xhr.status !== 200) {
            reject(xhr);
          } else {
            resolve(xhr.responseText);
          }
        };
      });
    },

    async get(url, params, options) {
      return this._get(url, params, options);
    },
    async post(url, params, options) {
      return this._post("POST", url, params, options);
    },
    async patch(url, params, options) {
      return this._post("PATCH", url, params, options);
    },
    async delete(url, params, options) {
      return this._post("DELETE", url, params, options);
    },
    async put(url, params, options) {
      return this._post("PUT", url, params, options);
    }
  };

  function DomChangesListener() {
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

  (new DomChangesListener()).on("files_tab", (node) => {
    const download_buttons = [...node.querySelectorAll("a.btn")];

    download_buttons
      .filter((button) => button.href && /file_id=[0-9]+/.test(button.href))
      .forEach((button) => {
        button.addEventListener("click", async (evt) => {
          evt.preventDefault();

          const { DisplayPopup } = unsafeWindow;
          const { href } = button;

          const is_nmm = /nmm=1/.test(href);
          const [, file_id] = href.match(/file_id=([0-9]+)/) || [];
          const game_id = document.querySelector("#mod_files").dataset.gameId;

          if (is_nmm === true) {
            const body = await request.get(href);
            const found_button = body.replace(/\n/g, "").match(/<button\s?id="slowDownloadButton.+?<\/button>/);
            const download_url = found_button && found_button[0].match(/data-download-url="(.+?)"/) || null;

            if (download_url !== null) {
              location.href = download_url[1];
            } else {
              DisplayPopup("Download Bypasser Error", "Download url not found, maybe you are not logged in?");
            }
          } else {
            const r = await request.post("https://www.nexusmods.com/Core/Libs/Common/Managers/Downloads?GenerateDownloadUrl", {
              body: { fid: file_id, game_id },
              formData: true
            });

            try {
              const data = JSON.parse(r);

              if (data.url) {
                window.location.href = data.url;
              } else {
                throw new Error();
              }
            } catch (e) {
              DisplayPopup("Download Bypasser Error", "Download url not found, maybe you are not logged in?");
            }
          }
        });
      });
  });

}());
