"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _vue = _interopRequireDefault(require("vue"));

var _router = _interopRequireDefault(require("./router"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var http = _axios["default"].create({
  //baseURL:process.env.VUE_APP_API_URL || '/admin/api',
  baseURL: 'http://localhost:3000/admin/api' //baseURL:'https://shawyoi.cn/admin/api'

});

http.interceptors.request.use(function (config) {
  if (localStorage.token) {
    config.headers.Authorization = 'Bearer ' + (localStorage.token || '');
  }

  return config;
}), function (error) {
  return Promise.reject(error);
}; //全局错误拦截，通过在服务端增加修改stutescode并返回错误message，来弹出错误窗口

http.interceptors.response.use(function (res) {
  return res;
}, function (err) {
  if (err.response.data.message) {
    _vue["default"].prototype.$message({
      type: 'error',
      message: err.response.data.message
    });

    if (err.response.status === 401) {
      _router["default"].push('/login');
    }
  }

  return Promise.reject(err);
});
var _default = http;
exports["default"] = _default;