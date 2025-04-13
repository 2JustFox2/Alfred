window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

let p = document.createElement("p");
const words = document.querySelector(".words");
words.appendChild(p);
recognition.addEventListener("result", (e) => {
  const transcript = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");
  p.textContent = transcript;

  if (e.results[0].isFinal) {
    p = document.createElement("p");
    words.appendChild(p);

    reaction(transcript);
  }
});

recognition.addEventListener("end", () => recognition.start());

recognition.start();



function reaction(text) {
  try {
    text = text
      .replaceAll(" ", "")
      .replaceAll(".", "")
      .replaceAll(",", ".")
      .replaceAll("х", "*")
      .replaceAll("встепени", "**");

    console.log(text);
    notify(`${text} = ${eval(text)}`);
  } catch (e) {
    console.log("Это не числовое выражение");
  }
}


function notify(text) {
  const options = {
    data: "10",
    silent: true,
    icon: "./img/logo.png",
  };
  let notification;

  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }
  
  Notification.requestPermission(function (permission) {
    // Если пользователь разрешил, то создаём уведомление
    if (permission === "granted") {
      notification = new Notification(text, options);
    }
  });

  notification.onclick = function () {
    window.open("https://www.google.com/");
  };
  notification.badge = "Text";
}


