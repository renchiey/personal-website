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

      <div>
        <span class="terminal-path">{{ path }}</span>
        <span id="terminal-input" class="terminal-text terminal-line">
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

const path = "Guest@terminal:~ ❯";
const input = ref("");
const history = ref<{ path: string; text: string }[]>([
  { path: "", text: initialPrompt },
]);
const caretPosition = ref(0);
const caretStyle = ref("text-caret");

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
  console.log(event.target);
  caretStyle.value = "";
}

function toggleCaret() {
  console.log(window.getSelection()?.toString());
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
  history.value.push({
    path,
    text: input.value,
  });
  input.value = "";
  caretPosition.value = 0;
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
::selection {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
}

@font-face {
  font-family: "JetbrainsMono";
  src: url("/fonts/JetBrainsMono-Regular.woff2") format("woff2");
  font-display: swap;
}

#terminal-container {
  width: 100%;
  height: 95vh;
  margin-top: 10px;
  position: relative;
  max-width: 900px;
  max-height: 1200px;
  border-radius: 10px;
  font-family: "JetbrainsMono", monospace;
  border-radius: 10px;
  border: 2px solid rgba(0, 0, 0, 0.5);
  opacity: 70%;
  background: linear-gradient(
    343deg,
    rgba(186, 186, 186, 1) -20%,
    rgba(230, 230, 230, 1) 10%
  );
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(10px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* ===== Chrome, Edge, Safari ===== */
#terminal-container::-webkit-scrollbar {
  width: 8px;
}

#terminal-container::-webkit-scrollbar-track {
  background: transparent;
}

#terminal-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.35);
  border-radius: 8px;
}

#terminal-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.55);
}

/* ===== Firefox ===== */
#terminal-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.35) transparent;
}

#terminal-content {
  z-index: 2;
  padding: 20px;
}

.terminal-text {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.terminal-path {
  color: blue;
  margin-right: 10px;
}

.terminal-line {
  white-space: pre-wrap;
  display: inline-flex;
  flex-wrap: wrap;
  font-family: "JetbrainsMono", monospace;
}

.char-cell {
  position: relative;
  width: 1ch;
  height: 1em;
  display: inline-block;
}

.invert-char {
  color: white;
}

.block-caret {
  position: absolute;
  inset: 0;
  height: 1.3em;
  background: black;
  z-index: -1;
  opacity: 0.8;
  pointer-events: none;
}

.end-caret {
  animation: caret-blink 1s steps(1) infinite;
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}
</style>
