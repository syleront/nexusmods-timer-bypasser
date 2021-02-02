export default {
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
