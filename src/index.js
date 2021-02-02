import request from "./tools/request";
import DomChangesListener from "./dom-changes-listener";

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
