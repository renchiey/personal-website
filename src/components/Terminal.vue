<template>
  <div id="terminal-container" ref="terminalRef">
    <div id="terminal-content">
      <div id="terminal-history">
        <div v-for="(line, i) in history" :key="i">
          <span v-if="line.path" class="terminal-path">{{ line.path }}</span>
          <span class="terminal-text">{{ line.text }}</span>
          <br />
        </div>
      </div>

      <div class="terminal-line">
        <span id="terminal-input" class="terminal-text">
          <span class="terminal-path">{{ path }}</span>
          <span
            v-for="(char, index) in input"
            :key="index"
            :class="['char-cell', caretPosition === index ? 'invert-char' : '']"
            @mousedown="setCaret(index)"
          >
            {{ char }}
            <span v-if="caretPosition === index" class="block-caret" />
          </span>

          <span
            v-if="caretPosition === input.length"
            class="char-cell end-caret"
          >
            <span class="block-caret" />
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";

const initialPrompt =
  "Hello! Welcome to my interactive terminal :D \n\nYou can mess around here or learn more about me by running commands in the command line!\n\nYou can start by entering 'help' into the command line\n";

const path = "Guest@RenchieSite:~ ❯";
const input = ref("");
const history = ref<{ path: string; text: string }[]>([
  { path: "", text: initialPrompt },
]);
const caretPosition = ref(0);
const caretStyle = ref("text-caret");
const commandHistory = ref<string[]>([]);
const commandHistoryPointer = ref(commandHistory.value.length);

const commands: CommandsInterface = {
  help: {
    help: "\tUsage: help\n\n\tDescription: Displays all available commands and how to use them",
    method: () => showHelp(),
  },
  clear: {
    help: "\tUsage: clear\n\n\tDescription: Clears the terminal buffer",
    method: (c) => clearTerminal(c),
  },
};

function showHelp() {
  history.value.push({
    path: "",
    text: Object.entries(commands).reduce((acc, [key, val]) => {
      acc += `${key}:\n${val.help}\n`;

      return acc;
    }, ""),
  });
}

function setCaret(index: number) {
  caretPosition.value = index;
}

function insertAtCaret(char: string) {
  input.value =
    input.value.slice(0, caretPosition.value) +
    char +
    input.value.slice(caretPosition.value);

  caretPosition.value += char.length;
}

const terminalRef = ref<HTMLElement | null>(null);

async function scrollToBottom() {
  await nextTick();
  terminalRef.value?.scrollTo({
    top: terminalRef.value.scrollHeight,
    behavior: "smooth", // optional
  });
}

function onKeydown(event: KeyboardEvent) {
  if (event.key.length === 1 || event.key === "Backspace") {
    event.preventDefault();
  }

  scrollToBottom();

  const historyLength = commandHistory.value.length;
  const ptr = commandHistoryPointer.value;

  switch (event.key) {
    case " ":
      insertAtCaret(" ");
      break;

    case "Backspace":
      if (caretPosition.value === 0) return;

      if (event.ctrlKey) {
        bulkDelete();
      } else {
        input.value =
          input.value.slice(0, caretPosition.value - 1) +
          input.value.slice(caretPosition.value);

        caretPosition.value--;
      }
      break;

    case "Enter":
      onEnter();
      scrollToBottom();
      commandHistoryPointer.value = commandHistory.value.length;
      break;
    case "ArrowUp":
      if (commandHistoryPointer.value > 0) {
        commandHistoryPointer.value -= 1;

        const cmd = commandHistory.value[commandHistoryPointer.value];
        input.value = cmd;
        caretPosition.value = cmd.length;
      }
      break;

    case "ArrowDown":
      if (commandHistoryPointer.value < commandHistory.value.length - 1) {
        commandHistoryPointer.value += 1;

        const cmd = commandHistory.value[commandHistoryPointer.value];
        input.value = cmd;
        caretPosition.value = cmd.length;
      } else {
        // Past the newest command → clear input
        commandHistoryPointer.value = commandHistory.value.length;
        input.value = "";
        caretPosition.value = 0;
      }
      break;

    case "ArrowLeft":
      if (event.ctrlKey) moveCaretByWord(false);
      else caretPosition.value = Math.max(0, caretPosition.value - 1);
      break;

    case "ArrowRight":
      if (event.ctrlKey) moveCaretByWord(true);
      else {
        caretPosition.value = Math.min(
          input.value.length,
          caretPosition.value + 1,
        );
      }
      break;
    case "c":
      if (event.ctrlKey) {
        navigator.clipboard.writeText(window.getSelection()?.toString() ?? "");
      }
    default:
      if (event.key.length === 1) {
        insertAtCaret(event.key);
      }
  }
}

function onMouseDown(event: MouseEvent) {
  caretStyle.value = "";
}

function toggleCaret() {
  if (window.getSelection()?.toString()) {
    caretStyle.value = "";
  } else {
    caretStyle.value = "text-caret";
  }
}

function moveCaretByWord(forward = false) {
  const text = input.value;
  let pos = caretPosition.value;

  if (forward) {
    while (pos < text.length && text[pos] === " ") {
      pos++;
    }

    while (pos < text.length && text[pos] !== " ") {
      pos++;
    }
  } else {
    pos--;

    while (pos > 0 && text[pos] === " ") {
      pos--;
    }

    while (pos > 0 && text[pos - 1] !== " ") {
      pos--;
    }
  }

  caretPosition.value = Math.max(0, Math.min(pos, text.length));
}

function bulkDelete() {
  const left = input.value.slice(0, caretPosition.value);
  const right = input.value.slice(caretPosition.value);

  let newLeft = left.replace(/\s+$/, "");
  newLeft = newLeft.replace(/\S+$/, "");

  caretPosition.value = newLeft.length;
  input.value = newLeft + right;
}

function onEnter() {
  const command = input.value.split(" ");

  history.value.push({
    path,
    text: input.value,
  });

  if (command.length > 0) {
    const app = command[0].trim();

    let cmd = commands[app];

    if (app !== "") {
      commandHistory.value.push(input.value);

      if (commandHistory.value.length > 50) {
        commandHistory.value = commandHistory.value.slice(1, -1);
      }

      if (cmd) {
        cmd.method(command);
      } else {
        history.value.push({
          path: "",
          text: `bash: command not found: ${input.value}\n`,
        });
      }
    }
  }

  input.value = "";
  caretPosition.value = 0;
}

function clearTerminal(cmd: string[]) {
  if (cmd.length > 1) {
    history.value.push({
      path,
      text:
        input.value +
        "\nUsage: clear\n\nDescription: Clears the terminal buffer\n",
    });
  } else {
    history.value = [];
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", toggleCaret);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("mousedown", onMouseDown);
  window.removeEventListener("mouseup", toggleCaret);
});
</script>

<style>
#terminal-container {
  position: relative;
  width: 100%;
  height: 100%;

  color: white;
  z-index: 2;
  padding: 20px;

  border-radius: 10px;

  overflow-y: scroll;
  overflow-x: hidden;
  box-sizing: border-box;
}

#terminal-container::-webkit-scrollbar {
  width: 1em;
}

#terminal-container::-webkit-scrollbar-track {
  background: transparent;
}

#terminal-container::-webkit-scrollbar-thumb {
  background-color: #37e64b;
  filter: blur(10px);
  -webkit-box-shadow:
    0 0 4px rgba(55, 230, 75, 0.8),
    0 0 12px rgba(55, 230, 75, 0.5);
}

#terminal-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(2, 250, 10, 0.45);
}

#terminal-content {
  position: relative;
  z-index: 2;
}

.terminal-text {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.terminal-path {
  color: #37e64b;
  margin-right: 10px;
  text-shadow:
    0 0 4px rgba(55, 230, 75, 0.8),
    0 0 12px rgba(55, 230, 75, 0.5);
}

.terminal-line {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
}

.char-cell {
  position: relative;
  width: 1ch;
  height: 1em;
  display: inline-block;
}

.block-caret {
  position: absolute;
  inset: 0;
  height: 1.4em;
  background: white;
  opacity: 0.85;
  mix-blend-mode: difference;
  pointer-events: none;
  animation: caret-blink 1s steps(1) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}
</style>
