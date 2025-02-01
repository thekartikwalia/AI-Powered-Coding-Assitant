// Handles all the webpage level activities (eg: manipulating page data, etc.)
// It contains scripts that run directly on the webpages you visit
// It allows the extension to interact with and manipulate the DOM of those pages

const observer = new MutationObserver(() => {
  addAiHelpButton();
});
observer.observe(document.body, { childList: true, subtree: true });

addAiHelpButton();

function onProblemsPage() {
  return window.location.pathname.startsWith("/problems/");
}

function addAiHelpButton() {
  if (!onProblemsPage || document.getElementById("ai-help-button")) return;

  const askDoubtButton = document.getElementsByClassName(
    "coding_ask_doubt_button__FjwXJ"
  )[0];

  const aiHelpButton = document.createElement("button");
  aiHelpButton.id = "ai-help-button";
  aiHelpButton.type = "button";
  aiHelpButton.className =
    "ant-btn css-19gw05y ant-btn-default Button_gradient_light_button__ZDAR_ ai-help-button gap-1 py-2 px-3 overflow-hidden";
  aiHelpButton.style.height = "fit-content";

  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("stroke", "currentColor");
  svgElement.setAttribute("fill", "none");
  svgElement.setAttribute("stroke-width", "2");
  svgElement.setAttribute("viewBox", "0 0 24 24");
  svgElement.setAttribute("aria-hidden", "true");
  svgElement.setAttribute("height", "20");
  svgElement.setAttribute("width", "20");
  svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.setAttribute("stroke-linecap", "round");
  pathElement.setAttribute("stroke-linejoin", "round");
  pathElement.setAttribute(
    "d",
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
  );

  svgElement.appendChild(pathElement);

  const spanElement = document.createElement("span");
  spanElement.className = "coding_ask_doubt_gradient_text__FX_hZ";
  spanElement.textContent = "Ai Help";

  aiHelpButton.appendChild(svgElement);
  aiHelpButton.appendChild(spanElement);

  askDoubtButton.insertAdjacentElement("beforebegin", aiHelpButton);
}
