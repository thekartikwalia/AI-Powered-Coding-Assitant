# AI-Powered Coding Assistant 🤖

An interactive browser extension designed to enhance coding problem-solving by providing real-time assistance, hints, and debugging support. Powered by AI, it assists users in a seamless and guided learning experience.

## Features 🧠

- **Interactive Guidance**
    - Step-by-step problem-solving hints
    - Debugging assistance for user code
    - Contextual AI-generated suggestions
    - Editorial code and approach if requested by the user

- **Problem Details Extraction**
    - Automatic extraction of problem title, description, constraints, and examples
    - Retrieves problem information from both the webpage and API responses

- **Code Debugging**
    - Helps users debug and improve their code
    - Provides concise and actionable feedback for errors
    - Suggests fixes based on context

- **AI-Powered Assistance**
    - Engages with the user by providing hints, answering questions, and guiding them through the problem-solving process
    - Ensures responses are tailored to the problem's context, encouraging critical thinking


## Tech Stack 💻

- **Frontend:** HTML, CSS, JavaScript
- **Libraries Used:**
    - **Marked.js** - Converts Markdown text to HTML
    - **Highlight.js** - Syntax highlighting for code
    - **html2pdf & js2pdf** - Converts HTML to PDF for downloading the content
    - **DOMPurify** - Sanitizes user inputs and HTML to prevent XSS attacks

## Installation 🚀

1. Clone the repository:
    ```bash
    git clone https://github.com/thekartikwalia/AI-Powered-Coding-Assitant
    ```

2. Navigate to the project directory:
    ```bash
    cd AI-Powered-Coding-Assistant
    ```

3. Load the extension into Chrome:
    - Go to [Chrome Extensions Page](chrome://extensions/)
    - Enable **Developer Mode**
    - Click **Load unpacked** and select the `AI-Powered-Coding-Assistant` directory

4. The extension is now active and ready to use.
    

## Usage 🖱️

1. Open a coding platform or problem-solving site.
2. The extension will automatically extract the problem details and display hints, suggestions, and debugging assistance.
3. Interact with the AI by asking for hints or code corrections.
4. The AI will provide real-time suggestions to guide you through the problem-solving process.
5. Use the editor’s built-in debugging tools to get actionable feedback and improve your code.

## Implementation Details 🛠️

- **Problem Extraction:** Combined data from the webpage and XMLHttpRequest API response for complete problem details.
- **AI Integration:** Used the Gemini API to generate intelligent, context-aware responses based on the coding problem.
- **Contextual Understanding via Prompt Engineering:** Designed prompts to guide AI in offering relevant hints and debugging help based on problem context.
- **Local Storage Handling:** Saved user code and preferences to local storage for personalized assistance.
- **Marked.js:** Parsed and rendered markdown content for problem descriptions.
- **Highlight.js:** Implemented syntax highlighting for better code readability.
- **html2pdf & js2pdf:** Enabled PDF generation for problem details and user progress.
- **DOMPurify:** Ensured the safety of user-generated content by sanitizing it.

## Recent Updates 🆕

- **AI Model Integration:** Integrated AI to offer dynamic suggestions based on the problem.
- **Local Storage Code Handling:** Now extracts user code from local storage for debugging assistance.
- **Problem Details:** Extracted problem data like title, description, constraints, and examples more efficiently.

## Future Scope 🔮

- **Enhanced Features**
    - Implement custom editor settings for different programming languages.
    - Add more dynamic AI-driven suggestions and enhancements to the conversation flow.
    - Introduce an AI-based system to explain coding solutions in simpler terms for beginners.

- **User Management**
    - Create a dashboard for saving the conversation history, code snippets, and received hints.
    - Allow users to track their progress and revisit previous problems with saved solutions.


## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/Enhancement`)
3. Commit your changes (`git commit -m 'Add some enhancement'`)
4. Push to the branch (`git push origin feature/Enhancement`)
5. Open a Pull Request

## License 📝

This project is open source and available under the [MIT License](LICENSE).

## Contact 📧

Kartik Walia - [GitHub](https://github.com/thekartikwalia)

Project Link: [https://github.com/thekartikwalia/AI-Powered-Coding-Assitant](https://github.com/thekartikwalia/AI-Powered-Coding-Assitant)