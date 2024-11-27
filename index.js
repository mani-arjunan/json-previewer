const body = document.querySelector("body");
const divider = document.getElementById("divider");
const jsonInput = document.getElementById("json-input");
const jsonOutput = document.getElementById("json-output");
const getCopyToClipBoardIcon = (index) => `
<span style="cursor: pointer;" onclick="copyToClipBoard(${index})">
  <svg width="20" height="20" viewBox="-1 -1 24 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor">
    </path>
  </svg>
</span>
`;

let isResizing = false;

body.addEventListener("mousedown", function (e) {
  if (e.target === divider) {
    isResizing = true;
  }
});

body.addEventListener("mouseup", () => {
  isResizing = false;
});

body.addEventListener("mousemove", function (e) {
  if (isResizing) {
    const totalWidth = body.clientWidth;

    jsonInput.style = `width: ${e.clientX}px`;
    jsonOutput.style = `width: ${totalWidth - e.clientX}px`;
  }
});

jsonInput.addEventListener("input", () => {
  try {
    const arr = [];
    jsonInput.value.split("\n").forEach((json, index) => {
      if (json.trim().length > 0) {
        const jsonParse = JSON.parse(json);

        const output = transformToPrettierJson(jsonParse, 1);
        arr.push(`
          <div tabindex=${index} id=${index + 1}>
            {
              <span class="depth" onclick="collapse(this)">${Object.keys(jsonParse).length}</span>
              ${getCopyToClipBoardIcon(index + 1)}
              ${output.innerHTML}
            }
          </div>
          <br/>
          <br/>
        `);
      }
    });

    jsonOutput.innerHTML = arr.join("");
  } catch (e) {
    console.log(e);
  }
});

const transformToPrettierJson = (data, depth = 0) => {
  const space = new Array(depth * 8)
    .fill(0)
    .map((_) => "&nbsp")
    .join("");
  const div = document.createElement("div");
  const keys = Object.keys(data);
  div.classList.add("content");

  keys.forEach((key, index) => {
    const values = data[key];
    const innerDiv = document.createElement("div");

    if (typeof values === "object") {
      const result = transformToPrettierJson(values, depth + 1);

      result.innerHTML =
        space +
        (!isNaN(key) ? "" : `<span class="key">"${key}": </span>`) +
        `<span class="depth" onclick="collapse(this)">${Array.isArray(values) ? values.length : Object.keys(values).length}</span>` +
        (Array.isArray(values) ? "[" : "{") +
        `<div class="content">${result.innerHTML}</div>` +
        `<span class="content">${space}</span>` +
        (Array.isArray(values) ? "]" : "}") +
        (keys.length - 1 === index ? "" : ", ");

      div.appendChild(result);
    } else {
      innerDiv.innerHTML =
        space +
        (!isNaN(key) ? "" : `<span class="key">"${key}"</span>: `) +
        `<span class="value">${isNaN(values) ? `"${values}"` : values}</span>` +
        (keys.length - 1 === index ? "" : ", ");

      div.appendChild(innerDiv);
    }
  });

  return div;
};

const collapse = (elem) => {
  const content = elem.parentNode.querySelectorAll(".content");

  content.forEach((c) => {
    c.classList.toggle("close");
  });
};

const copyToClipBoard = (index) => {
  const changeSpanStyle = (parent, display) => {
    parent
      .querySelectorAll(".depth")
      .forEach((span) => (span.style.display = display));
  };
  const div = document.getElementById(index);
  changeSpanStyle(div, "none");

  const range = document.createRange();
  range.selectNode(div);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  document.execCommand("copy");
  changeSpanStyle(div, "");
  window.getSelection().removeAllRanges();
};
