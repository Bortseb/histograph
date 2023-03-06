var t, n, o, r;
!(function (t) {
  t.load = function () {
    return import("./base91.js").then((t) => t.Base91.load());
  };
})(t || (t = {})),
  (function (t) {
    t.load = function () {
      return import("./expat.js").then((t) => t.Expat.load());
    };
  })(n || (n = {})),
  (function (t) {
    t.load = function () {
      return import("./graphviz.js").then((t) => t.Graphviz.load());
    };
  })(o || (o = {})),
  (function (t) {
    t.load = function () {
      return import("./zstd.js").then((t) => t.Zstd.load());
    };
  })(r || (r = {}));
export { t as Base91, n as Expat, o as Graphviz, r as Zstd };
//# sourceMappingURL=index.js.map
