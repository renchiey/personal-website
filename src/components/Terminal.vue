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
import { onMounted, onUnmounted, nextTick, ref } from "vue";
import { useTerminal } from "../lib/terminal";

const {
  path,
  input,
  history,
  caretPosition,
  setCaret,
  onKeydown,
  setOnOutput,
} = useTerminal();

const terminalRef = ref<HTMLElement | null>(null);

async function scrollToBottom() {
  await nextTick();
  terminalRef.value?.scrollTo({
    top: terminalRef.value.scrollHeight,
    behavior: "smooth",
  });
}

onMounted(() => {
  setOnOutput(scrollToBottom);
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
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
