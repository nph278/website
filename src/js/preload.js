const preloaded = [];

function isOriginSameAsLocation(url) {
  var pageLocation = window.location;
  var URL_HOST_PATTERN = /(\w+:)?(?:\/\/)([\w.-]+)?(?::(\d+))?\/?/;
  var urlMatch = URL_HOST_PATTERN.exec(url) || [];
  var urlparts = {
    protocol: urlMatch[1] || "",
    host: urlMatch[2] || "",
    port: urlMatch[3] || "",
  };
  function defaultPort(protocol) {
    return { "http:": 80, "https:": 443 }[protocol];
  }
  function portOf(location) {
    return (
      location.port || defaultPort(location.protocol || pageLocation.protocol)
    );
  }
  return !!(
    urlparts.protocol &&
    urlparts.protocol == pageLocation.protocol &&
    urlparts.host &&
    urlparts.host == pageLocation.host &&
    urlparts.host &&
    portOf(urlparts) == portOf(pageLocation)
  );
}

const preload = async () => {
  document.querySelectorAll("a").forEach(async (element, i) => {
    const href = element.href;
    if (isOriginSameAsLocation(href) || href.includes("://localhost:")) {
      element.addEventListener("mouseover", async () => {
        if (!preloaded.includes(i)) {
          preloaded.push(i);
          const html = await (await fetch(href)).text();
          element.addEventListener("click", (e) => {
            e.preventDefault();
            document.documentElement.innerHTML = html;
            preload();
            window.location.href = href;
          });
          console.log("Preloading!");
        }
      });
    }
  });
  return true;
};

export default preload;
