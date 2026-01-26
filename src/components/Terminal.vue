<template>
  <div id="terminal-container" ref="terminalRef">
    <div id="terminal-bg" class="glassmorphism"></div>

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

          <!-- caret at end -->
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
  "Hello! Welcome to my interactive personal website :D \n\nYou can start by entering 'help' into the command line\n";

const path = "Guest@RenchieSite:~ ❯";
const input = ref("");
const history = ref<{ path: string; text: string }[]>([
  { path: "", text: initialPrompt },
]);
const caretPosition = ref(0);
const caretStyle = ref("text-caret");

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
      break;

    case "ArrowUp":
      break;
    case "ArrowDown":
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

  console.log(command);

  history.value.push({
    path,
    text: input.value,
  });

  if (command.length > 0) {
    const app = command[0].trim();

    let cmd = commands[app];

    if (cmd) {
      cmd.method(command);
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

<style scoped>
/* ===== Text selection ===== */
::selection {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
}

/* ===== Font ===== */
@font-face {
  font-family: "JetbrainsMono";
  src: url("/fonts/JetBrainsMono-Regular.woff2") format("woff2");
  font-display: swap;
}

/* ===== Terminal container ===== */
#terminal-container {
  position: relative;
  width: 100%;
  height: 95vh;
  margin-top: 10px;
  max-width: 900px;
  max-height: 1200px;

  font-family: "JetbrainsMono", monospace;
  color: white;

  border-radius: 10px;
  border: 2px solid rgba(0, 0, 0, 0.5);

  opacity: 70%;

  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;

  /* Glass + CRT base */
  background: radial-gradient(
    ellipse at center,
    rgba(30, 30, 30, 0.3) 0%,
    rgba(10, 10, 10, 0.45) 50%,
    rgba(0, 0, 0, 0.5) 100%
  );

  backdrop-filter: blur(10px);

  /* CRT softness */
  filter: blur(0.2px) contrast(1.05) saturate(1.2);
}

/* ===== CRT overlays ===== */
#terminal-container::before,
#terminal-container::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

/* Scanlines */
#terminal-container::before {
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.18) 0px,
    rgba(0, 0, 0, 0.18) 1px,
    rgba(0, 0, 0, 0) 3px,
    rgba(0, 0, 0, 0) 4px
  );
  mix-blend-mode: multiply;
}

/* Noise + phosphor mask */
#terminal-container::after {
  background-image:
    repeating-linear-gradient(
      90deg,
      rgba(255, 0, 0, 0.035),
      rgba(255, 0, 0, 0.035) 1px,
      rgba(0, 255, 0, 0.02) 2px,
      rgba(0, 0, 255, 0.035) 3px
    ),
    url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>\
<filter id='n'>\
<feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/>\
</filter>\
<rect width='100%' height='100%' filter='url(%23n)' opacity='0.04'/>\
</svg>");
  animation: crt-flicker 0.15s infinite;
}

/* ===== Flicker animation ===== */
@keyframes crt-flicker {
  0% {
    opacity: 0.92;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.94;
  }
}

/* ===== Scrollbar ===== */
#terminal-container::-webkit-scrollbar {
  width: 8px;
}

#terminal-container::-webkit-scrollbar-track {
  background: transparent;
}

#terminal-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 8px;
}

#terminal-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.45);
}

#terminal-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

/* ===== Content ===== */
#terminal-content {
  position: relative;
  z-index: 2;
  padding: 20px;
}

/* ===== Text rendering ===== */

.terminal-text {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: anywhere;
  text-shadow:
    0 0 2px rgba(0, 255, 0, 0.6),
    0 0 8px rgba(0, 255, 0, 0.4),
    0 0 16px rgba(0, 255, 0, 0.25);
}

.terminal-path {
  color: #37e64b;
  margin-right: 10px;
  text-shadow:
    0 0 4px rgba(55, 230, 75, 0.8),
    0 0 12px rgba(55, 230, 75, 0.5);
}

/* ===== Line & character cells ===== */
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

/* ===== Block caret ===== */
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
