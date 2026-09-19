(function () {
  "use strict";

  var authKey = "timememo-sky-portal-auth-v1";
  var isAuthorized = false;

  try {
    isAuthorized = window.sessionStorage.getItem(authKey) === "granted";
  } catch (error) {
    isAuthorized = false;
  }

  if (isAuthorized) {
    return;
  }

  document.documentElement.style.visibility = "hidden";

  var basePath = "/sky-portal/";
  var currentPath = window.location.pathname;
  var relativePath = currentPath.indexOf(basePath) === 0
    ? currentPath.slice(basePath.length)
    : "";
  var next = relativePath + window.location.search + window.location.hash;

  window.location.replace(
    basePath + "access.html?next=" + encodeURIComponent(next)
  );
})();
