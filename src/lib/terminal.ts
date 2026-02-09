import { computed, ref } from "vue";
import { WebsiteFileSystem } from "./filesystem";

interface TerminalLine {
  path: string;
  text: string;
}

interface Command {
  help: string;
  method: (args: string[]) => void;
}

export type CommandsMap = Record<string, Command>;

function initFilesystem() {
  const fs = new WebsiteFileSystem();

  fs.makeDirectory("about");
  fs.makeDirectory("projects");
  fs.makeDirectory("bookshelf");

  return fs;
}

export function useTerminal() {
  const initialPrompt =
    "Hello! Welcome to my interactive terminal :D \n\n" +
    "You can mess around here or learn more about me by running commands in the command line!\n\n" +
    "You can start by entering 'help' into the command line\n";

  const fs = initFilesystem();

  const input = ref("");
  const caretPosition = ref(0);

  const history = ref<TerminalLine[]>([{ path: "", text: initialPrompt }]);

  const commandHistory = ref<string[]>([]);
  const commandHistoryPointer = ref(0);
  const cwd = ref<string>(fs.currentLocation);

  const path = computed(() => `Guest@RenchieSite:${cwd.value} ❯`);

  function pushHistory(line: TerminalLine) {
    history.value.push(line);
    onOutput?.();
  }

  const commands: CommandsMap = {
    help: {
      help: "\tUsage: help\n\n\tDescription: Displays all available commands",
      method: () => {
        pushHistory({
          path: "",
          text:
            Object.entries(commands)
              .map(([key, val]) => `${key}:\n${val.help}`)
              .join("\n\n") + "\n",
        });
      },
    },

    clear: {
      help: "\tUsage: clear\n\n\tDescription: Clears the terminal screen",
      method: (args) => {
        if (args.length > 1) {
          pushHistory({
            path: path.value,
            text: "Usage: clear\n\nDescription: Clears the terminal screen\n",
          });
        } else {
          history.value = [];
        }
      },
    },
    cd: {
      help: "\tUsage: cd [PATH]\n\n\tDescription: Change directory",
      method: ([, target]) => {
        if (!target) return;
        try {
          cwd.value = fs.changeDirectory(target);
        } catch {
          pushHistory({
            path: "",
            text: `cd: no such directory: ${target}\n`,
          });
        }
      },
    },
    ls: {
      help: "\tUsage: ls [OPTIONAL PATH]\n\n\tDescription: List directory contents",
      method: ([, target]) => {
        const entries = fs.listFiles(target).join("  ");

        pushHistory({
          path: "",
          text: entries.length > 0 ? entries + "\n" : "",
        });
      },
    },
  };

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

  function normalDelete() {
    const left = input.value.slice(0, caretPosition.value - 1);
    const right = input.value.slice(caretPosition.value);

    caretPosition.value = caretPosition.value - 1;
    input.value = left + right;
  }

  function bulkDelete() {
    const left = input.value.slice(0, caretPosition.value);
    const right = input.value.slice(caretPosition.value);

    let newLeft = left.replace(/\s+$/, "").replace(/\S+$/, "");

    caretPosition.value = newLeft.length;
    input.value = newLeft + right;
  }

  function moveCaretByWord(forward: boolean) {
    const text = input.value;
    let pos = caretPosition.value;

    if (forward) {
      while (pos < text.length && text[pos] === " ") pos++;
      while (pos < text.length && text[pos] !== " ") pos++;
    } else {
      pos--;
      while (pos > 0 && text[pos] === " ") pos--;
      while (pos > 0 && text[pos - 1] !== " ") pos--;
    }

    caretPosition.value = Math.max(0, Math.min(pos, text.length));
  }

  function execute() {
    const raw = input.value.trim();
    const parts = raw.split(" ");
    const cmd = parts[0];

    pushHistory({ path: path.value, text: raw });

    if (raw.length > 0) {
      commandHistory.value.push(raw);

      commandHistoryPointer.value = commandHistory.value.length;
    }

    if (!cmd) {
      resetInput();
      return;
    }

    // Fallback to built-in commands
    const command = commands[cmd];
    if (command) {
      command.method(parts);
    } else {
      pushHistory({
        path: "",
        text: `bash: command not found: ${cmd}\n`,
      });
    }

    resetInput();
  }

  function resetInput() {
    input.value = "";
    caretPosition.value = 0;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key.length === 1 || event.key === "Backspace") {
      event.preventDefault();
    }

    switch (event.key) {
      case " ":
        insertAtCaret(" ");
        break;

      case "Backspace":
        if (caretPosition.value === 0) return;

        if (event.ctrlKey) bulkDelete();
        else normalDelete();
        break;

      case "Enter":
        execute();
        break;

      case "ArrowLeft":
        event.ctrlKey
          ? moveCaretByWord(false)
          : (caretPosition.value = Math.max(0, caretPosition.value - 1));
        break;

      case "ArrowRight":
        event.ctrlKey
          ? moveCaretByWord(true)
          : (caretPosition.value = Math.min(
              input.value.length,
              caretPosition.value + 1,
            ));
        break;

      case "ArrowUp":
        if (commandHistoryPointer.value > 0) {
          commandHistoryPointer.value--;
          input.value = commandHistory.value[commandHistoryPointer.value];
          caretPosition.value = input.value.length;
        }
        break;

      case "ArrowDown":
        if (commandHistoryPointer.value < commandHistory.value.length - 1) {
          commandHistoryPointer.value++;
          input.value = commandHistory.value[commandHistoryPointer.value];
        } else {
          commandHistoryPointer.value = commandHistory.value.length;
          input.value = "";
        }
        caretPosition.value = input.value.length;
        break;

      default:
        if (event.key.length === 1) insertAtCaret(event.key);
    }
  }

  let onOutput: (() => void) | null = null;

  function setOnOutput(fn: () => void) {
    onOutput = fn;
  }

  return {
    path,
    input,
    history,
    caretPosition,
    onKeydown,
    setCaret,
    onOutput,
    setOnOutput,
  };
}
