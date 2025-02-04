// Handles all the webpage level activities (eg: manipulating page data, etc.)
// It contains scripts that run directly on the webpages you visit
// It allows the extension to interact with and manipulate the DOM of those pages

// ============================================ Mutation observer to detect page change on SPA ============================================
let lastUrl = "";
const AI_HELP_BUTTON_ID = "ai-help-button";
const CHAT_BOX_MODAL_ID = "chatbox-modal";
const CHAT_BOX_MODAL_CLOSE_BUTTON_ID = "close-ai-chatbox-modal-button";
const CHAT_BOX_MESSAGES_CONTAINER_ID = "chat-messages-container";
const CHAT_INPUT_FIELD_ID = "chat-input-field";
const SEND_CHAT_BUTTON_ID = "send-chat-btn";

function onProblemsPage() {
  const pathParts = window.location.pathname.split("/");

  return pathParts.length >= 3 && pathParts[1] == "problems" && pathParts[2];
}

function isUrlChanged() {
  const currUrl = window.location.pathname;
  if (currUrl != lastUrl) {
    lastUrl = currUrl;
    return true;
  }

  return false;
}

function areRequiredElementsLoaded() {
  const problemTitle = document
    .getElementsByClassName("Header_resource_heading__cpRp1")[0]
    ?.textContent.trim(); // trim to remove trailing and leading whitespaces
  const problemDescription = document
    .getElementsByClassName("coding_desc__pltWY")[0]
    ?.textContent.trim(); // trim to remove trailing and leading whitespaces

  return problemTitle && problemDescription;
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList" && onProblemsPage()) {
      if (isUrlChanged() || !document.getElementById(AI_HELP_BUTTON_ID)) {
        if (areRequiredElementsLoaded()) {
          cleanUpPage();
          createElement();
        }
      }
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });

// ====================================================== Element related Functions ======================================================
function createElement() {
  const askDoubtButton = document.getElementsByClassName(
    "coding_ask_doubt_button__FjwXJ"
  )[0];

  const buttonWrapper = createButtonWrapper();
  askDoubtButton.insertAdjacentElement("beforebegin", buttonWrapper);
  buttonWrapper.appendChild(askDoubtButton);

  const aiHelpButton = createAiHelpButton();
  buttonWrapper.appendChild(aiHelpButton);

  aiHelpButton.addEventListener("click", openChatBox);
}

function createButtonWrapper() {
  const buttonWrapper = document.createElement("div");

  buttonWrapper.classList.add("button-container");
  buttonWrapper.style.display = "flex";
  buttonWrapper.style.gap = "10px";

  return buttonWrapper;
}

function createAiHelpButton() {
  const aiHelpButton = document.createElement("button");

  aiHelpButton.id = AI_HELP_BUTTON_ID;
  aiHelpButton.type = "button";
  aiHelpButton.className =
    "ant-btn css-19gw05y ant-btn-default coding_ask_doubt_button__FjwXJ Button_gradient_light_button__ZDAR_ ai-help-button gap-1 py-2 px-3 overflow-hidden";
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

  return aiHelpButton;
}

function cleanUpPage() {
  const aiHelpButton = document.getElementById(AI_HELP_BUTTON_ID);
  if (aiHelpButton) aiHelpButton.remove();

  // TODO: Have to clean chat container as well
  const chatBoxModal = document.getElementById(CHAT_BOX_MODAL_ID);
  if(chatBoxModal) chatBoxModal.remove();
}

// ============================================================== Chat Box ==============================================================
function openChatBox() {
  // const chatBoxModal = document.getElementById(CHAT_BOX_MODAL_ID);
  createChatBoxModal();

  const closeAiChatBoxModalButton = document.getElementById(CHAT_BOX_MODAL_CLOSE_BUTTON_ID);
  closeAiChatBoxModalButton.addEventListener("click", closeChatBoxModal);
}

function createChatBoxModal() {
  const chatBoxModal = document.createElement("div");

  chatBoxModal.id = CHAT_BOX_MODAL_ID;
  chatBoxModal.className = "w-100 h-100 position-fixed d-flex align-items-start justify-content-center hide-scrollbar"; 
  chatBoxModal.style = "z-index: 100; top: 0px; left: 0px; background-color: rgba(23, 43, 77, 0.8); backdrop-filter: blur(8px); overflow-y: auto;";
  
  // ChatBox Container
  const chatBoxContainer = document.createElement("section");
  chatBoxContainer.className = "dmsans overflow-hidden p-4"; 
  chatBoxContainer.style = "max-width: 72rem;";
  chatBoxModal.appendChild(chatBoxContainer);

  // ChatBox Section
  const chatBoxSection = document.createElement("div");
  chatBoxSection.className = "DoubtForum_new_post_modal_container__hJcF2 border_primary border_radius_12 d-flex flex-column";
  chatBoxContainer.appendChild(chatBoxSection);

  // ChatBox Section Content Container
  const chatBoxSectionContentContainer = document.createElement("div");
  chatBoxSectionContentContainer.className = "d-flex  justify-content-between flex-column p-4 position-relative";
  chatBoxSection.appendChild(chatBoxSectionContentContainer);

  // Cross Button (close modal button)
  const crossButton = document.createElement("div");
  crossButton.id = CHAT_BOX_MODAL_CLOSE_BUTTON_ID;
  crossButton.className = "d-flex justify-content-end position-absolute"; 
  crossButton.style = "right: 2.5rem; top: 2rem;";
  crossButton.innerHTML = `
    <button type="button" class="ant-btn css-19gw05y ant-btn-text ant-btn-icon-only undefined DoubtForum_text_color__ndqRv  d-flex align-items-center justify-content-center">
      <span class="ant-btn-icon">
        <span role="img" aria-label="close" class="anticon anticon-close">
          <svg fill-rule="evenodd" viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true">
            <path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path>
          </svg>
        </span>
      </span>
    </button>
  `
  chatBoxSectionContentContainer.appendChild(crossButton);

  // Modal Heading 
  const chatBoxModalHeading = document.createElement("div");
  chatBoxModalHeading.className = "DoubtForum_text_color__ndqRv ruibk fs-3 fw-bold";
  chatBoxModalHeading.textContent = "AI Powered Coding Assitant"
  chatBoxSectionContentContainer.appendChild(chatBoxModalHeading);
  
  // Modal Heading Separation Line
  const chatBoxModalHeadingSeparationLine = document.createElement("div");
  chatBoxModalHeadingSeparationLine.className = "DoubtForum_border_bottom__59UoH mt-1";
  chatBoxSectionContentContainer.appendChild(chatBoxModalHeadingSeparationLine);

  // ChatBox Modal Introduction paragraph 
  const chatBoxModalIntroPara =  document.createElement("div");
  chatBoxModalIntroPara.className = "mb-3";
  chatBoxModalIntroPara.innerHTML = `
    <div class="row d-none d-sm-flex">
      <div class="col-xl-3">&nbsp;</div>
      <div class="DoubtForum_gradient_text__GhOgr mt-2 col-12 col-xl-9">
        Ask questions related to your current problem to receive accurate AI-generated assistance. The chatbot understands the context and provides tailored solutions to help you efficiently.
      </div>
    </div>
  `
  chatBoxSectionContentContainer.appendChild(chatBoxModalIntroPara);

  // Chatbox Meesages Container
  const chatBoxMessagesContainer = document.createElement("div");
  chatBoxMessagesContainer.id = CHAT_BOX_MESSAGES_CONTAINER_ID;
  chatBoxMessagesContainer.class = "mt-3 p-3"; 
  chatBoxMessagesContainer.style = "height: 300px; overflow-y: auto; background-color: white; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);";
  chatBoxSectionContentContainer.appendChild(chatBoxMessagesContainer);

  // Chatbox Input Field 
  const chatBoxInputField = document.createElement("div");
  chatBoxInputField.className = "d-flex mt-3";
  chatBoxInputField.innerHTML = `
    <input type="text" id="chat-input-field" class="form-control me-2" placeholder="Type your message..." style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
    <button id="send-chat-btn" class="btn btn-primary" style="padding: 10px 15px; border-radius: 8px;">Send</button>
  `
  chatBoxSectionContentContainer.appendChild(chatBoxInputField);

  // Event Listener on Send Button
  const sendButton = chatBoxInputField.querySelector(`#${SEND_CHAT_BUTTON_ID}`);
  sendButton.addEventListener("click", sendMessageButtonHandler);

  document.body.insertAdjacentElement("beforeend", chatBoxModal);  
  return chatBoxModal;
}

function sendMessageButtonHandler() {
  const inputField = document.querySelector(`#${CHAT_INPUT_FIELD_ID}`);
  if (inputField) {
    const userInput = inputField.value;
    console.log(userInput);

    // clear the input field after sending the message
    inputField.value = '';
  }
}

function closeChatBoxModal() {
  const chatBoxModal = document.getElementById(CHAT_BOX_MODAL_ID);
  if(chatBoxModal) chatBoxModal.remove(); 
}