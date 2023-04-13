// Welcome to the main Nebula script
// This script handles all the tasks neccesary for a proxy.
// What this doesn't include is the actual proxies, just the neccesary tasks in order for the proxies to be able to preform, such as registering the service worker required by Interception proxies.

// Documentation Writers/Contributors:
// GreenWorld#0001 (Discord) / GreenyDev (Github)
// If you would like to contribute, feel free to open a pull request.
// These docs are not finished

// Navigation controls for smaller devices
// Executed in the inline HTML
function openNav() {
  document.getElementById("sidenav").style.width = "260px";
}
function closeNav() {
  document.getElementById("sidenav").style.width = "0px";
}

function setLoaderText() {
  document.getElementById('connectorText').textContent = "connecting to service"
  const loader = document.getElementById("lpoader");

  const loadConstructer = loader.style;
  loadConstructer.display = "flex";
  loadConstructer.justifyContent = "center";
  // Changing the text over multiple periods of time creates character, and aliveness (is that even a word?)
  setTimeout(() => {
    document.getElementById("connectorText").style.fontSize = "12px";
    document.getElementById("connectorText").textContent = "Due to high server load, this may take a while.";
  }, 3200);
  setTimeout(() => {
    document.getElementById("connectorText").style.fontSize = "14px";
    document.getElementById("connectorText").textContent = "Hmmm.. Something isn't right..";
  }, 17000);
}

window.addEventListener("load", () => {
  // Register the service workers for Osana and Ultraviolet proxy protocols
  // This is a better method than registering onsubmit because this allows the ability to use proxied links on the main page.

  const dbPromise = Ultraviolet.openDB("keyval-store", 1, {
    upgrade(db) {
      db.createObjectStore("keyval");
    }
  });
  self.storage = {
    async get(key) {
      return (await dbPromise).get("keyval", key);
    },

    async set(key, val) {
      console.log("please wait");
      return (await dbPromise).put("keyval", val, key);
    },

    async del(key) {
      return (await dbPromise).delete("keyval", key);
    }
  };

  navigator.serviceWorker.register("./sw.js", {
    scope: "/service/"
  });

  // Get's the current day using the Date function built in.
  // A dependency for displaying time - displayTime(void)
  function getDayName(dateStr, locale) {
    var date = new Date(dateStr);
    return date.toLocaleDateString(locale, { weekday: "long" });
  }

  // The main function to show the time on the main page
  // needs to be initialized by a call (only one)
  // Dependent on getDayName function
  function displayTime() {
    var date = new Date();
    var h = date.getHours(); // 0 - 23
    var m = date.getMinutes(); // 0 - 59
    var s = date.getSeconds(); // 0 - 59
    var session = "AM";
    h = h == 12 ? 24 : h;

    if (h == 0) {
      h = 12;
    } else if (h >= 12) {
      h = h - 12;
      session = "PM";
    }
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    // Repeat itself every second
    setTimeout(displayTime, 1000);
    // Get today's date
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + "/" + dd + "/" + yyyy;
    var time =
      h + "<span style='opacity:100%;' class='clockColon'>:</span>" + m;
    try {
      document.getElementById("digitalClock").innerHTML = getDayName(today, "us-US") + ", " + time + " " + session + ".";
    } catch {

    }
    

    return time;
  }
  // initialize the time function

  displayTime();

  // Link evaluation
  // This functions' purpose is to check a string of text (the argument)
  // it recognizes whether a string is a URL or not, and it returns a true or false value
  function isUrl(val = "") {
    if (
      /^http(s?):\/\//.test(val) ||
      (val.includes(".") && val.substr(0, 1) !== " ")
    )
      return true;
    return false;
  }

  const proxy = localStorage.getItem("proxy") || "uv";
  const inpbox = document.querySelector("form");
  // Display the "loading" indicators on the main page, looks much better than a static/still screen.

  const hasLoadedElement = document.createElement("div");
  hasLoadedElement.id = "hasLoaded";
  hasLoadedElement.style.display = "none";
  document.body.appendChild(hasLoadedElement);



  inpbox.addEventListener("submit", (event) => {
    // Prevents the default event tasks
    event.preventDefault();
    console.log("Connecting to service -> loading");
    setLoaderText();
  });

  // Form submission
  const form = document.querySelector("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    // Check if the service worker (commonly called SW) is registered
    if (typeof navigator.serviceWorker === "undefined")
      alert("An error occured registering your service worker. Please contact support - discord.gg/unblocker");
    //
    if (proxy === "uv" || proxy === "osana") {
      // Re-register the service worker incase it failed to onload
      navigator.serviceWorker
        .register("./sw.js", {
          scope: "/service/"
        })
        .then(() => {
          const value = event.target.firstElementChild.value;
          let url = value.trim();
          if (!isUrl(url)) url = "https://www.google.com/search?q=" + url;
          if (!(url.startsWith("https://") || url.startsWith("http://")))
            url = "http://" + url;
          // encode the URL for UltraViolet
          let redirectTo =
            proxy === "uv"
              ? __uv$config.prefix + __uv$config.encodeUrl(url)
              : __osana$config.prefix + __osana$config.codec.encode(url);
          const option = localStorage.getItem("nogg");
          if (option === "on") {
            stealthEngine(redirectTo);
          } else {
            setTimeout(() => {
              // If StealthMode is off, this is the enabled option.
              const _popout = window.open("/blob", "_self");
              const blob = _popout.document;
              // Write all of the neccesary page elements, and the Options including the cloak (if enabled)
              // The blob writing is just the background elements, like the "Nebula is loading your content, please wait" screen. It does not carry proxied content, or even the iframe.
              blob.write(`
           <script> 
           function handleTabLeave(activeInfo) {
  var link = document.querySelector("link[rel~='icon']");
  if (localStorage.getItem('ADVcloak') == "on") {
  if (document.title == "Nebula") {
    document.title = "Google"
    if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
}
link.href = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo7AE3IF34XPGyseQjkXIOsWXpkZiLlMjSAwySjcJSPAwlv3hnGKi1&usqp=CAU';
    document.title = "Google"
  } else if (document.title == "Google") {
    document.title = "Nebula"
    if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
    }
    } else {
      return false;
    }
}
}
document.addEventListener("visibilitychange", handleTabLeave)
</script> 
          
           <style>@import "https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap"; body{background:#191724;color:#fff}div{margin-top:30px;font-size:100px;text-align:center;font-family:"Roboto";font-weight:700}.loader .b1{left:42%}.loader .b2{left:50%;animation-delay:100ms}.loader .b3{left:58%;animation-delay:200ms;color:#eb6f92}.loader .b1,.loader .b2,.loader .b3{width:10px;height:30px;position:absolute;top:50%;transform:rotate(0);animation-name:spinify;animation-duration:1600ms;animation-iteration-count:infinite;color:#eb6f92;background-color:#eb6f92}@keyframes spinify{0%{transform:translate(0px,0px)}33%{transform:translate(0px,24px);border-radius:100%;width:10px;height:10px}66%{transform:translate(0px,-16px)}88%{transform:translate(0px,4px)}100%{transform:translate(0px,0px)}}</style> 
           <div class="loader">
  <div>Nebula is loading your content!</div>
  <div style='font-size:35px;'>Please wait</div>
  <div class="b1"></div> 
  <div class="b2"></div>
  <div class="b3"></div>
</div> 
`);
              // inside of the blob, create and append the Iframe element which WILL carry the proxied content.
              const iframe = blob.createElement("iframe");
              const style = iframe.style;
              const img = blob.createElement("link");
              const link = location.href;
              // We attach ARC because it supports us, keeping our arc link there would be greatly appreciated :)
              const arcSrc = blob.createElement("script");
              arcSrc.setAttribute(
                "src",
                "https://arc.io/widget.min.js#BgaWcYfi"
              );
              // Arc requires the Async attribute
              // Async means not running parallel to other tasks, so it loads seperately to everything else (in a sense)
              // Aysnchronous and Synchronous are somewhat difficult topics, so we recommend you
              arcSrc.setAttribute("async", "");
              blob.head.appendChild(arcSrc);
              img.rel = "icon";
              img.href =
                "https://static.nebulacdn.xyz/content/images/nebula_logo_619x619.png";
              blob.title = getRandomName();
              // slice the link like some nice fruit :)
              // Removing the '/' from 'whateverthislinkis.gay/'
              //                                              ^
              var currentLink = link.slice(0, link.length - 1);
              // To attribute the iframe to a source, we need to + the current link (post-slice) to the requested website, which is passed through the functions argument
              iframe.src = currentLink + redirectTo;

              // Style the Iframe to fill the entire screen and remove the bessels.
              style.position = "fixed";
              style.top = style.bottom = style.left = style.right = 0;
              style.border = style.outline = "none";
              style.width = style.height = "100%";
              // finally, append the iframe to the blob's (window) body
              blob.body.appendChild(iframe);
            }, 1000);
          }
        });
    }
  });


  let tryAbFavi = localStorage.getItem("ABfaviconURL");
  let ABFavicon = "";
  if (tryAbFavi === null) {
    console.warn("ABfaviconURL is null, Defaulting");
    ABFavicon = "";
  } else if (tryAbFavi == "") {
    console.warn("ABfaviconURL is empty, Defaulting");
    ABFavicon = "";
  } else {
    ABFavicon = tryAbFavi;
  }

  let tryAbTitle = localStorage.getItem("ABtitle");
  let ABTitle = "";
  if (tryAbTitle === null) {
    console.warn("ABtitle is null, Defaulting");
    ABTitle = "";
  } else if (tryAbTitle == "") {
    console.warn("ABtitle is empty, Defaulting");
    ABTitle = "";
  } else {
    ABTitle = tryAbTitle;
  }

  // Stealth engine, a dependency for everything above.
  function stealthEngine(encodedURL) {
    // Remember that the EncodedURL argument must be pre-encoded, or encoded before the function is called.
    // This function does not encode the argument at all!

    // Initialize the variable
    let inFrame;
    // make sure there isn't a window open already
    try {
      inFrame = window !== top;
    } catch (e) {
      inFrame = true;
    }
    setTimeout(() => {
      // Basically, a checklist to make sure that an error won't occur.
      // In this if statement, we're checking if an iframe is already being opened, if popups are disabled, and if the user agent IS NOT firefox (firefox sucks, sorry Moz)
      if (!inFrame && !navigator.userAgent.includes("Firefox")) {
        const popup = open("about:blank", "_blank");
        if (!popup || popup.closed) {
          alert("StealthEngine was unable to open a popup. (do you have popups disabled?)");
        } else {
          const doc = popup.document;
          const iframe = doc.createElement("iframe");
          const style = iframe.style;
          popup.onload = () => {
            document.getElementById("lpoader").style.display = "none"
            document.getElementById('connectorText').textContent = "connecting to service"
            setTimeout(() => {
              document.getElementById('connectorText').textContent = "connecting to service"
            }, 17500);
          };
          var isClosed = setInterval(function () {
            if (popup.closed) {
              clearInterval(isClosed);
              document.getElementById("lpoader").style.display = "none"
              document.getElementById('connectorText').textContent = "connecting to service"
            }
          }, 1000);
          // Favicon attachment
          const img = doc.createElement("link");
          const arcSrc = doc.createElement("script");
          // We attach ARC because it supports us, keeping our arc link there would be greatly appreciated :)
          arcSrc.setAttribute("src", "https://arc.io/widget.min.js#BgaWcYfi");
          arcSrc.setAttribute("async", "");
          doc.head.appendChild(arcSrc);
          const link = location.href;
          img.rel = "icon";
          img.href = ABFavicon || "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png";
          if (localStorage.nogg == "on") {
            doc.title = ABTitle || getRandomName();
          } else {
            doc.title = ABTitle || "Nebula";
          }


          var currentLink = link.slice(0, link.length - 1);

          iframe.src = currentLink + encodedURL;

          style.position = "fixed";
          style.top = style.bottom = style.left = style.right = 0;
          style.border = style.outline = "none";
          style.width = style.height = "100%";

          doc.body.appendChild(iframe);
          doc.head.appendChild(img);
        }
      }
    }, 1500);
  }
});

// Set the option
var option = localStorage.getItem("nogg");
if (localStorage.getItem("theme") == null) {
  localStorage.setItem("theme", "dark");
}

window.onload = function () {
  changeCSS("--background-primary", localStorage.getItem("--background-primary"));
  changeCSS("--navbar-color", localStorage.getItem("--navbar-color"));
  changeCSS("--navbar-height", localStorage.getItem("--navbar-height"));
  changeCSS("--navbar-text-color", localStorage.getItem("--navbar-text-color"));
  changeCSS("--input-text-color", localStorage.getItem("--input-text-color"));
  changeCSS("--input-placeholder-color", localStorage.getItem("--input-placeholder-color"));
  changeCSS("--input-background-color", localStorage.getItem("--input-background-color"));
  changeCSS("--input-border-color", localStorage.getItem("--input-border-color"));
  changeCSS("--input-border-size", localStorage.getItem("--input-border-size"));
  changeCSS("--navbar-link-color", localStorage.getItem("--navbar-link-color"));
  changeCSS("--navbar-font", localStorage.getItem("--navbar-font"));
  changeCSS("--navbar-logo-filter", localStorage.getItem("--navbar-logo-filter"));
  changeCSS("--text-color-primary", localStorage.getItem("--text-color-primary"));
};

function changeCSS(variable, value, saveBool) {
  document.documentElement.style.setProperty(variable, value);

  if (saveBool === true) {
    saveCSS(variable, value);
  }
}

function saveCSS(variable, value) {
  localStorage.setItem(variable, value);
}

// Extra logging for support
function log() {
  setTimeout(
    console.log.bind(
      console, "%cWelcome To Nebula", "background: #3F51B5;color:#FFF;padding:5px;border-radius: 5px;line-height: 26px; font-size:30px;"
    )
  );
  setTimeout(
    console.log.bind(
      console, "%c If you are seeing this, Nebula's main script has succesfully loaded!", "background: green;color:#FFF;padding:5px;border-radius: 5px;line-height: 26px; font-size:12px;"
    )
  );
  setTimeout(
    console.log.bind(
      console, "%cIf you encounter an error, contact our support team on discord. Copy and paste the information below and send it in the ticket", "background: red;color:#FFF;padding:5px;border-radius: 5px;line-height: 26px; font-size:12px;"
    )
  );
  let online = navigator.onLine;
  let userAgent = navigator.userAgent;
  let browserName;
  let diagnosticDomain = window.location.href;
  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "firefox";
  } else if (userAgent.match(/safari/i)) {
    browserName = "safari";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "opera";
  } else if (userAgent.match(/edg/i)) {
    browserName = "edge";
  } else {
    browserName = "No browser detection";
  }
  console.log.bind(
    console,
    `%cInformation: \n URL: ${diagnosticDomain} \n BrowserName: ${browserName} \n IsOnline: ${online} \n UA: ${userAgent}, `,
    "background: gray;color:#FFF;padding:3px;border-radius: 0px; font-size:12px;"
  );
}
log();
function switchTheme() {
  var selecter = document.getElementById("themeSwitcher");
  var selectedOption = selecter.value;
  if (selectedOption == "dark") {
    changeCSS("--background-primary", "#191724", true);
    changeCSS("--navbar-color", "#26233a", true);
    changeCSS("--navbar-height", "60px", true);
    changeCSS("--navbar-text-color", "#7967dd", true);
    changeCSS("--input-text-color", "#e0def4", true);
    changeCSS("--input-placeholder-color", "#6e6a86", true);
    changeCSS("--input-background-color", "#1f1d2e", true);
    changeCSS("--input-placeholder-color", "white", true);
    changeCSS("--input-border-color", "#eb6f92", true);
    changeCSS("--input-border-size", "1.3px", true);
    changeCSS("--navbar-link-color", "#e0def4", true);
    changeCSS("--navbar-font", '"Roboto"', true);
    changeCSS("--navbar-logo-filter", "invert(0%)", true);
    changeCSS("--text-color-primary", "#e0def4", true);
    localStorage.setItem("theme", "dark");
  }
  if (selectedOption == "light") {
    changeCSS("--background-primary", "#d8d8d8", true);
    changeCSS("--navbar-color", "#a2a2a2", true);
    changeCSS("--navbar-height", "4em", true);
    changeCSS("--navbar-text-color", "#000000", true);
    changeCSS("--input-text-color", "#e0def4", true);
    changeCSS("--input-placeholder-color", "white", true);
    changeCSS("--input-background-color", "black", true);
    changeCSS("--input-border-color", "#eb6f92", true);
    changeCSS("--input-border-size", "1.3px", true);
    changeCSS("--navbar-link-color", "#000000", true);
    changeCSS("--navbar-font", '"Roboto"', true);
    changeCSS("--navbar-logo-filter", "invert(30%)", true);
    changeCSS("--text-color-primary", "#303030", true);
    localStorage.setItem("theme", "light");
  }
  if (selectedOption == 'custom') {
    changeCSS('--background-primary', localStorage.getItem("--background-primary"), true)
    changeCSS('--navbar-color', localStorage.getItem("--navbar-color"), true)
    changeCSS('--navbar-height', localStorage.getItem("--navbar-height"), true)
    changeCSS('--navbar-text-color', localStorage.getItem("--navbar-text-color"), true)
    changeCSS('--input-text-color', localStorage.getItem("--input-text-color"), true)
    changeCSS('--input-placeholder-color', localStorage.getItem("--input-placeholder-color"), true)
    changeCSS('--input-background-color', localStorage.getItem("--input-background-color"), true)
    changeCSS('--input-border-color', localStorage.getItem("--input-border-color"), true)
    changeCSS('--input-border-size', localStorage.getItem("--input-border-size"), true)
    changeCSS('--navbar-link-color', localStorage.getItem("--navbar-link-color"), true)
    changeCSS('--navbar-font', localStorage.getItem("--navbar-font"), true)
    changeCSS('--navbar-logo-filter', localStorage.getItem("--navbar-logo-filter"), true)
    changeCSS('--text-color-primary', localStorage.getItem("--text-color-primary"), true)
    localStorage.setItem('theme', 'custom')
  }
}

// Adjectives and surnames for a more advanced stealth engine.
// Used together to generate random names for the tab name
let adjectives;
let surnames;

async function surnameAdjectivesData() {
  await fetch("/resources/adjectives_surnames.json")
    .then((response) => response.json())
    .then((data) => {
      adjectives = data.adjectives;
      surnames = data.surnames;
    })
}
surnameAdjectivesData();



// Random number generator
// Dependency of getRandomName function
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// Random name generator
function getRandomName() {
  const random1 = getRandomNumber(0, adjectives.length);
  const random2 = getRandomNumber(0, surnames.length);
  const adjective = adjectives[random1];
  const surname = surnames[random2];
  // Connect the adjective and surname together to create a random name
  const randomName = adjective + "-" + surname;
  return randomName;
}

// Check if the Browser variable is undefined
// This is unused as of now but it could be used for better cloaking in the future, specifically with activeTab
if (typeof browser === "undefined") {
  var browser = chrome;
}
browser = chrome;

// Clickoff cloaking
// This is used to cloak the tab when it is not active
function handleTabLeave() {
  var link = document.querySelector("link[rel~='icon']");
  if (localStorage.getItem("ADVcloak") == "on") {
    if (document.title == "Nebula") {
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = "https://www.google.com/favicon.ico";
      document.title = "Google";
    } else if (document.title == "Google") {
      document.title = "Nebula";
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = "https://camo.githubusercontent.com/b565ae2e136e0ac6023e7099288a62382de7c2b8cdce86a8b90449b86649434c/68747470733a2f2f6e6562756c6170726f78792e6e6562756c612e62696f2f696d616765732f6c6f676f2e706e67";
    } else {
      return false;
    }
  }
}
// Create and Add the event listener
document.addEventListener("visibilitychange", handleTabLeave);

const stealthStored = localStorage.getItem('nogg')
function link(_link) {
  if (stealthStored == "on") {
    let inFrame
    try { inFrame = window !== top } catch (e) { inFrame = true }
    setTimeout(() => {
      if (!inFrame && !navigator.userAgent.includes("Firefox")) {
        const popup = open("about:blank", "_blank")
        if (!popup || popup.closed) { alert("Popups are disabled!") } else {
          const doc = popup.document
          const iframe = doc.createElement("iframe")
          const style = iframe.style
          const img = doc.createElement("link")
          img.rel = "icon"
          img.href = "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png"
          doc.title = getRandomName()
          var currentLink = _link.slice(0, _link.length - 1)
          iframe.src = location.origin + "/service/go/" + __uv$config.encodeUrl(currentLink)
          style.position = "fixed"
          style.top = style.bottom = style.left = style.right = 0
          style.border = style.outline = "none"
          style.width = style.height = "100%"
          doc.body.appendChild(iframe)
        }
      }
    }, 200)
  } else { location.href = "service/go/" + __uv$config.encodeUrl("https://radon.games/") }
}