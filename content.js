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
const GEMINI_API_KEY = "YOUR-API-KEY";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
let problemDetails = {};
let xhrInjectedData = "";
let problemChatHistories = new Map();
const DELETE_CHAT_BUTTON_ID = "delete-chat-btn";
const EXPORT_CHAT_BUTTON_ID = "export-chat-btn";

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

addInjectScript();
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    addInjectScript();
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

  // Have to clean chat container as well
  const chatBoxModal = document.getElementById(CHAT_BOX_MODAL_ID);
  if (chatBoxModal) chatBoxModal.remove();

  // Clean problem details as well
  problemDetails = {};
}

// ============================================================== Chat Box ==============================================================
function openChatBox() {
  // Create the chat box modal
  createChatBoxModal();

  // Extract problem details
  extractProblemDetails();

  // Load chat histories from localStorage
  loadChatHistories();

  // Get conversation history for current problem
  const conversationHistory = getChatHistoryForCurrentProblem();

  const chatBoxMessagesContainer = document.getElementById(CHAT_BOX_MESSAGES_CONTAINER_ID);
  if (chatBoxMessagesContainer && conversationHistory) {
    chatBoxMessagesContainer.innerHTML = '';

    conversationHistory.forEach(message => {
      displayMessage(
        message.parts[0].text,
        message.role === "user" ? "user" : "model",
      );
    });
  }

  const closeAiChatBoxModalButton = document.getElementById(
    CHAT_BOX_MODAL_CLOSE_BUTTON_ID
  );
  closeAiChatBoxModalButton.addEventListener("click", closeChatBoxModal);

  // Attach all event listeners after the chatBox Modal is fully loaded 
  attachEventListeners();
}

function createChatBoxModal() {
  const chatBoxModal = document.createElement("div");

  chatBoxModal.id = CHAT_BOX_MODAL_ID;
  chatBoxModal.className =
    "w-100 h-100 position-fixed d-flex align-items-start justify-content-center hide-scrollbar";
  chatBoxModal.style =
    "z-index: 100; top: 0px; left: 0px; background-color: rgba(23, 43, 77, 0.8); backdrop-filter: blur(8px); overflow-y: auto;";

  // ChatBox Container
  const chatBoxContainer = document.createElement("section");
  chatBoxContainer.className = "dmsans overflow-hidden p-4";
  chatBoxContainer.style = "max-width: 50rem; height: 100%;";    // ensuring container takes full height
  chatBoxModal.appendChild(chatBoxContainer);

  // ChatBox Section
  const chatBoxSection = document.createElement("div");
  chatBoxSection.className =
    "DoubtForum_new_post_modal_container__hJcF2 border_primary border_radius_12 d-flex flex-column";
  chatBoxSection.style = "height: 100%;";
  chatBoxContainer.appendChild(chatBoxSection);

  // ChatBox Section Content Container
  const chatBoxSectionContentContainer = document.createElement("div");
  chatBoxSectionContentContainer.className =
    "d-flex  justify-content-between flex-column p-4 position-relative";
  chatBoxSectionContentContainer.style = "height: 100%;";
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
  `;
  chatBoxSectionContentContainer.appendChild(crossButton);

  // Modal Heading
  const chatBoxModalHeading = document.createElement("div");
  chatBoxModalHeading.className =
    "DoubtForum_text_color__ndqRv ruibk fs-3 fw-bold";
  chatBoxModalHeading.textContent = "AI Powered Coding Assitant";
  chatBoxSectionContentContainer.appendChild(chatBoxModalHeading);

  // Modal Heading Separation Line
  const chatBoxModalHeadingSeparationLine = document.createElement("div");
  chatBoxModalHeadingSeparationLine.className =
    "DoubtForum_border_bottom__59UoH mt-1";
  chatBoxSectionContentContainer.appendChild(chatBoxModalHeadingSeparationLine);

  // ChatBox Modal Introduction paragraph
  const chatBoxModalIntroPara = document.createElement("div");
  chatBoxModalIntroPara.className = "mb-3";
  chatBoxModalIntroPara.innerHTML = `
    <div class="row d-none d-sm-flex">
      <div class="DoubtForum_gradient_text__GhOgr mt-2 col-12 col-xl-9 text-center w-auto">
        Ask questions related to your current problem to receive accurate AI-generated assistance. The chatbot understands the context and provides tailored solutions to help you efficiently.
      </div>
    </div>
  `;
  chatBoxSectionContentContainer.appendChild(chatBoxModalIntroPara);

  // Chatbox Meesages Container
  const chatBoxMessagesContainer = document.createElement("div");
  chatBoxMessagesContainer.id = CHAT_BOX_MESSAGES_CONTAINER_ID;
  chatBoxMessagesContainer.class = "mt-3 p-3";
  chatBoxMessagesContainer.style =
    "height: 100%; overflow-y: auto; background-color: white; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);";
  chatBoxSectionContentContainer.appendChild(chatBoxMessagesContainer);

  // Chatbox Input Field
  const chatBoxInputField = document.createElement("div");
  chatBoxInputField.className = "d-flex mt-3 gap-3";
  chatBoxInputField.innerHTML = `
    <input type="text" id="chat-input-field" class="form-control" placeholder="Type your message..." style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ccc;">
    <button id="send-chat-btn"
      class="btn btn-primary py-2 px-4"
      style="
        border-radius: 8px;
        background: linear-gradient(90deg, var(--gradient_dark_button_color_1), var(--gradient_dark_button_color_2));
        border: none;
        transition: background 0.3s ease-in-out;
      "
      onmouseover="this.style.background='linear-gradient(94deg, var(--gradient_dark_button_color_2) -0.03%, var(--gradient_dark_button_color_1) 99.97%)'"
      onmouseout="this.style.background='linear-gradient(90deg, var(--gradient_dark_button_color_1), var(--gradient_dark_button_color_2))'"
    >
      Send
    </button>
  `;
  chatBoxSectionContentContainer.appendChild(chatBoxInputField);

  // Messages Container Separation Line
  const chatBoxMessagesContainerSeparationLine = document.createElement("div");
  chatBoxMessagesContainerSeparationLine.className =
    "DoubtForum_border_bottom__59UoH mt-3";
  chatBoxSectionContentContainer.appendChild(chatBoxMessagesContainerSeparationLine);

  // Chat Actions Container (exporting chats and deleting chats from history)
  const chatActionsContainer = document.createElement("div");
  chatActionsContainer.className = "d-flex mt-3 justify-content-between";
  chatActionsContainer.innerHTML = `
    <button id="delete-chat-btn" class="ant-btn css-19gw05y ant-btn-default Button_icon_text_button__pApl_ coding_footer_console_button__fZJDe px-3 px-sm-4 py-2" style="border-radius: 8px;">Delete Chat</button>
    <button id="export-chat-btn" class="ant-btn css-19gw05y ant-btn-default Button_icon_text_button__pApl_ coding_footer_console_button__fZJDe px-3 px-sm-4 py-2" style="border-radius: 8px;">Export Chat</button>
  `;
  chatBoxSectionContentContainer.appendChild(chatActionsContainer);
  
  document.body.insertAdjacentElement("beforeend", chatBoxModal);
  return chatBoxModal;
}

function attachEventListeners() {
  document.getElementById(SEND_CHAT_BUTTON_ID)?.addEventListener("click", sendMessageButtonHandler);
  document.getElementById(DELETE_CHAT_BUTTON_ID)?.addEventListener("click", deleteChatHistoryButtonHandler);
  document.getElementById(EXPORT_CHAT_BUTTON_ID)?.addEventListener("click", exportChatHistoryButtonHandler);
}

function deleteChatHistoryButtonHandler() {
  console.log("delete chat button clicked");
  const currentProblemId = problemDetails.problemId;
  problemChatHistories.delete(currentProblemId);
  saveChatHistories();
  
  const chatBoxMessagesContainer = document.getElementById(CHAT_BOX_MESSAGES_CONTAINER_ID);
  if (chatBoxMessagesContainer) chatBoxMessagesContainer.innerHTML = "";
}

function exportChatHistoryButtonHandler() {
  console.log("export chat button clicked");
  const currentProblemId = problemDetails.problemId;
  const chatHistory = problemChatHistories.get(currentProblemId) || [];

  let formattedMessages = [];

  chatHistory.forEach((message) => {
    let messageText = message.parts[0]?.text;
    messageText = messageText
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/<\/?[^>]+(>|$)/g, "");

    if (messageText) {
      if (message.role === "user") {
        formattedMessages.push(`**You:** ${messageText}`);
      } else if (message.role === "model") {
        formattedMessages.push(`**AI:** ${messageText}`);
      }
    }
  });

  const chatHistoryFormatted = formattedMessages.join('\n\n');

  // Convert Markdown to HTML using marked.parse() & render it safely using DOMPurify
  const htmlContent = DOMPurify.sanitize(marked.parse(chatHistoryFormatted));

  // Temporarily create an element to render the markdown as HTML
  const markdownContainer = document.createElement('div');
  markdownContainer.innerHTML = htmlContent;

  // Apply syntax highlighting to code blocks
  // Highlight.js will automatically highlight <code> blocks if we call it on the container
  const codeBlocks = markdownContainer.querySelectorAll('pre code');
  codeBlocks.forEach(block => {
    hljs.highlightBlock(block); // Highlight the block using highlight.js
  });

  // Now apply the necessary styling (GitHub style) to the code blocks
  markdownContainer.querySelectorAll('pre').forEach(preBlock => {
    preBlock.classList.add('hljs'); // Add GitHub style classes to the <pre> elements
  });

  // Use html2pdf to convert the HTML to a PDF
  html2pdf()
    .from(markdownContainer)
    .set({
      margin: [10, 5, 10, 5], // Set margins (top, right, bottom, left) in mm
      filename: `chat-history-of-${problemDetails?.title || "problem-statement"}.pdf`,
      html2canvas: { scale: 2 }, // Optional: improves the rendering quality of images and text
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } // Optional: sets paper format
    })
    .save(`chat-history-of-${problemDetails?.title || "problem-statement"}.pdf`);
}

const sendMessageButtonHandler = async () => {
  const inputField = document.querySelector(`#${CHAT_INPUT_FIELD_ID}`);
  if (!inputField) return;

  const userInput = inputField.value;
  if (!userInput) return;

  console.log("User Input: ", userInput);

  // Display user message in chatbox
  displayMessage(userInput, "user");

  // clear the input field after sending the message
  inputField.value = "";

  // Send message to API and get response
  const chatBotReply = await sendMessageToAPI(userInput);
  console.log("Bot reply: \n", chatBotReply);

  // Display bot response in chatbox
  displayMessage(chatBotReply, "model");
};

async function sendMessageToAPI(userMessage) {
  try {
    const conversationHistory = getChatHistoryForCurrentProblem();

    // Add user message to conversation history
    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    // Prepare the payload with the entire conversation
    const payload = {
      contents: conversationHistory,
    };

    // Send the request
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Parse the JSON response
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    // Extract AI response text from the API response
    const aiResponse =
      responseData.candidates &&
      responseData.candidates[0] &&
      responseData.candidates[0].content &&
      responseData.candidates[0].content.parts &&
      responseData.candidates[0].content.parts[0] &&
      responseData.candidates[0].content.parts[0].text
        ? responseData.candidates[0].content.parts[0].text
        : "No response from the API.";

    // Add AI response to the conversation history
    conversationHistory.push({
      role: "model",
      parts: [{ text: aiResponse }],
    });

    // Save the updated conversation history
    saveChatHistoryForCurrentProblem(conversationHistory);

    return aiResponse;
  } catch (error) {
    console.error("Error fetching AI response: ", error);
    return "An error occured while connecting to the API";
  }
}

function displayMessage(message, sender) {
  const chatBoxMessagesContainer = document.getElementById(
    CHAT_BOX_MESSAGES_CONTAINER_ID
  );
  if (!chatBoxMessagesContainer) return;

  const messageElement = document.createElement("div");
  messageElement.className = `d-flex my-2 px-2 ${
    sender === "user" ? "justify-content-end" : "justify-content-start"
  }`;

  const messageBubble = document.createElement("div");
  if(sender === "model") {
    // Sanitize & Render Markdown
    messageBubble.innerHTML = DOMPurify.sanitize(marked.parse(message));

    // Apply Syntax Highlighting to Code Blocks
    messageBubble.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  } else {
    messageBubble.textContent = message;
  }
  messageBubble.className = `p-2 rounded ${
    sender === "user"
      ? "bg-primary text-white"
      : "text-dark border border-secondary"
  }`;
  messageBubble.style = sender === "user"
  ? "max-width: 70%; background: linear-gradient(90deg,var(--gradient_dark_button_color_1),var(--gradient_dark_button_color_2));"
  : "max-width: 70%; background: linear-gradient(to left, var(--gradient_light_button_color_1) 0, var(--gradient_light_button_color_2));"; 

  messageElement.appendChild(messageBubble);
  chatBoxMessagesContainer.appendChild(messageElement);

  // Scroll to the bottom
  chatBoxMessagesContainer.scrollTop = chatBoxMessagesContainer.scrollHeight;
}

// Function to load chat histories from localStorage
function loadChatHistories() {
  const storedHistoriesJson = localStorage.getItem('problemChatHistories');
  if (storedHistoriesJson) {
    const storedHistories = JSON.parse(storedHistoriesJson);
    console.log("storedHistoriesJson: \n", storedHistories);
    problemChatHistories = new Map(storedHistories);
  }
}

// Function to save chat histories to localStorage
function saveChatHistories() {
  const serializedHistories = Array.from(problemChatHistories.entries());
  localStorage.setItem('problemChatHistories', JSON.stringify(serializedHistories));
}

// Function to get chat history for the current problem
function getChatHistoryForCurrentProblem() {
  const currentProblemId = problemDetails.problemId;
  return problemChatHistories.get(currentProblemId) || [];
}

// Function to save chat history for the current problem
function saveChatHistoryForCurrentProblem(chatHistory) {
  const currentProblemId = problemDetails.problemId;
  problemChatHistories.set(currentProblemId, chatHistory);
  saveChatHistories();
}

function closeChatBoxModal() {
  const chatBoxModal = document.getElementById(CHAT_BOX_MODAL_ID);
  if (chatBoxModal) chatBoxModal.remove();
}

// ======================================================= Extract Problem Details =======================================================
function extractProblemDetails() {
  // Extract data from intercepting API request
  let parsedData = "";
  try {
    // Parse the response string into a JavaScript object
    parsedData = JSON.parse(xhrInjectedData.response)?.data || {};
    console.log("Parsed xhrInjectedData.response successfully!");
  } catch (error) {
    alert("Some information wasn't loaded");
    console.error("Failed to parse xhrInjectedData.response: ", error);
    parsedData = {};
  }
  const xhrInjectedDetails = {
    id: parsedData?.id != null ? parsedData.id.toString() : "",
    title: parsedData?.title || "",
    description: parsedData?.body || "",
    inputFormat: parsedData?.input_format || "",
    outputFormat: parsedData?.output_format || "",
    constraints: parsedData?.constraints || "",
    note: parsedData?.note || "",
    editorialCode: parsedData?.editorial_code || [],
    hints: parsedData?.hints || {},
    samples: parsedData?.samples || [],
    timeLimit:
      parsedData?.time_limit_sec != null
        ? parsedData.time_limit_sec.toString()
        : "",
    memoryLimit:
      parsedData?.memory_limit_mb != null
        ? parsedData.memory_limit_mb.toString()
        : "",
  };
  console.log("parsedData from xhr: \n", xhrInjectedDetails);

  // Extract data from Webpage
  const webpageDetails = {
    id: extractProblemNumber(),
    title:
      document.getElementsByClassName("Header_resource_heading__cpRp1")[0]
        ?.textContent || "",
    description:
      document.getElementsByClassName("coding_desc__pltWY")[0]?.textContent ||
      "",
    inputFormat:
      document.getElementsByClassName(
        "coding_input_format__pv9fS problem_paragraph"
      )[0]?.textContent || "",
    outputFormat:
      document.getElementsByClassName(
        "coding_input_format__pv9fS problem_paragraph"
      )[1]?.textContent || "",
    constraints:
      document.getElementsByClassName(
        "coding_input_format__pv9fS problem_paragraph"
      )[2]?.textContent || "",
    note:
      document.getElementsByClassName(
        "coding_input_format__pv9fS problem_paragraph"
      )[3]?.textContent || "",
    inputOutput: extractInputOutput() || [],
    userCode: extractUserCode() || "",
  };

  // Final problem details (combined from both Webpage & intercepting API XMLHttpRequest)
  problemDetails = {
    title: xhrInjectedDetails?.title || webpageDetails?.title,
    description: xhrInjectedDetails?.description || webpageDetails?.description,
    inputFormat: xhrInjectedDetails?.inputFormat || webpageDetails?.inputFormat,
    outputFormat:
      xhrInjectedDetails?.outputFormat || webpageDetails?.outputFormat,
    constraints: xhrInjectedDetails?.constraints || webpageDetails?.constraints,
    samples: xhrInjectedDetails?.samples || webpageDetails?.inputOutput,
    note: xhrInjectedDetails?.note || webpageDetails?.note,
    hints: xhrInjectedDetails?.hints || {},
    problemId: xhrInjectedDetails?.id || webpageDetails?.id,
    editorialCode: xhrInjectedDetails?.editorialCode || [],
    userCode: webpageDetails?.userCode || "",
    timeLimit: xhrInjectedDetails?.timeLimit || "",
    memoryLimit: xhrInjectedDetails?.memoryLimit || "",
  };
  console.log("data of problem details: \n", problemDetails);
}

function extractProblemNumber() {
  const url = window.location.pathname;
  const parts = url.split("/");
  let lastPart = parts[parts.length - 1];

  let number = "";
  for (i = lastPart.length - 1; i >= 0; i--) {
    if (isNaN(lastPart[i])) break;
    number = lastPart[i] + number;
  }

  return number;
}

function extractUserCode() {
  let localStorageData = extractLocalStorage();

  const problemNo = extractProblemNumber();

  let language = localStorageData["editor-language"] || "C++14";
  if (language.startsWith('"') && language.endsWith('"')) {
    language = language.slice(1, -1); // -1 to end at the last character (but exclude it)
  }

  const expressionForKey = `_${problemNo}_${language}`;
  for (let key in localStorageData) {
    if (
      localStorageData.hasOwnProperty(key) &&
      key.includes(expressionForKey) &&
      key.endsWith(expressionForKey)
    ) {
      return localStorageData[key];
    }
  }
  return "";
}

function extractLocalStorage() {
  const localStorageData = {};

  for (i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localStorageData[key] = localStorage.getItem(key);
  }

  return localStorageData;
}

function extractInputOutput() {
  const elements = document.querySelectorAll(".coding_input_format__pv9fS");
  const inputOutputPairs = [];

  for (let i = 3; i < elements.length; i += 2) {
    if (i + 1 < elements.length) {
      const input = elements[i]?.textContent?.trim() || "";
      const output = elements[i + 1]?.textContent?.trim() || "";
      inputOutputPairs.push({ input, output });
    }
  }

  let jsonString = JSON.stringify(inputOutputPairs);
  return jsonString.replace(/\\\\n/g, "\\n");
}

// ========================================================= Injecting XHR Data =========================================================
window.addEventListener("xhrDataInjected", (event) => {
  xhrInjectedData = event.detail;
  console.log("xhr data : ", xhrInjectedData);

  // Parse the response string into a JavaScript object
  const parsedResponse = JSON.parse(xhrInjectedData.response);

  // Now you can inspect the parsed response object
  console.log(parsedResponse);
});

function addInjectScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("inject.js");

  document.documentElement.insertAdjacentElement("afterbegin", script); // document.documentElement is <html> element
  script.remove(); // immediately removes the script element from the DOM after it is injected and executed
}
