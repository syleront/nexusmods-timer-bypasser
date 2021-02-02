import querystring from "./querystring";

export default {
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
