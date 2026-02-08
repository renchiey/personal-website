import { computed, ref } from "vue";

interface TerminalLine {
  path: string;
  text: string;
}

interface Command {
  help: string;
  method: (args: string[]) => void;
}

type NodeType = "dir" | "exec";

interface FSNode {
  type: NodeType;
  children?: Record<string, FSNode>;
  run?: () => string;
}

export type CommandsMap = Record<string, Command>;

export function useTerminal() {
  const initialPrompt =
    "Hello! Welcome to my interactive terminal :D \n\n" +
    "You can mess around here or learn more about me by running commands in the command line!\n\n" +
    "You can start by entering 'help' into the command line\n";

  const input = ref("");
  const caretPosition = ref(0);

  const history = ref<TerminalLine[]>([{ path: "", text: initialPrompt }]);

  const commandHistory = ref<string[]>([]);
  const commandHistoryPointer = ref(0);

  const path = computed(() => `Guest@RenchieSite:${cwdString()} ❯`);

  function pushHistory(line: TerminalLine) {
    history.value.push(line);
    onOutput?.();
  }

  const fs: FSNode = {
    type: "dir",
    children: {
      "about-me": {
        type: "dir",
        children: {
          about: {
            type: "exec",
            run: () =>
              "Hi! I'm Renchie — a software engineer who likes building cool things.\n",
          },
        },
      },

      projects: {
        type: "dir",
        children: {
          projects: {
            type: "exec",
            run: () => "Projects:\n- Journly\n- DropZoneAU\n- Personal Site\n",
          },
        },
      },

      bookshelf: {
        type: "dir",
        children: {
          bookshelf: {
            type: "exec",
            run: () =>
              "Bookshelf:\n- Designing Data-Intensive Applications\n- Clean Architecture\n",
          },
        },
      },
    },
  };

  const cwd = ref<string[]>([]);

  function resolvePath(path: string[]): FSNode | null {
    let node: FSNode = fs;

    for (const part of path) {
      if (!node.children || !node.children[part]) return null;
      node = node.children[part];
    }

    return node;
  }

  function cwdString() {
    return "/" + cwd.value.join("/");
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
      help: "\tUsage: clear\n\n\tDescription: Clears the terminal buffer",
      method: (args) => {
        if (args.length > 1) {
          pushHistory({
            path: path.value,
            text: "Usage: clear\n\nDescription: Clears the terminal buffer\n",
          });
        } else {
          history.value = [];
        }
      },
    },
    cd: {
      help: "\tUsage: cd <directory>\n\n\tDescription: Change directory",
      method: ([, target]) => {
        if (!target || target === "~") {
          cwd.value = [];
          return;
        }

        if (target === "..") {
          cwd.value.pop();
          return;
        }

        const next = [...cwd.value, target];
        const node = resolvePath(next);

        if (!node) {
          pushHistory({
            path: "",
            text: `cd: no such file or directory: ${target}\n`,
          });
          return;
        }

        if (node.type !== "dir") {
          pushHistory({
            path: "",
            text: `cd: not a directory: ${target}\n`,
          });
          return;
        }

        cwd.value = next;
      },
    },
    ls: {
      help: "\tUsage: ls [path]\n\n\tDescription: List directory contents",
      method: ([, target]) => {
        if (!target || target === ".") {
          listDir(cwd.value);
          return;
        }

        if (target === "..") {
          listDir(cwd.value.slice(0, -1));
          return;
        }

        listDir([...cwd.value, target]);
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

    // Try filesystem execution first
    const node = resolvePath([...cwd.value, cmd]);

    if (node?.type === "exec") {
      pushHistory({
        path: "",
        text: node.run?.() ?? "",
      });
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

  function listDir(path: string[]) {
    const node = resolvePath(path);

    if (!node) {
      pushHistory({
        path: "",
        text: "ls: cannot access: No such file or directory\n",
      });
      return;
    }

    if (node.type !== "dir" || !node.children) {
      pushHistory({
        path: "",
        text: "ls: not a directory\n",
      });
      return;
    }

    const entries = Object.entries(node.children)
      .map(([name, child]) => {
        if (child.type === "dir") return `${name}/`;
        if (child.type === "exec") return `${name}*`;
        return name;
      })
      .join("  ");

    pushHistory({
      path: "",
      text: entries + "\n",
    });
  }

  function resetInput() {
    input.value = "";
    caretPosition.value = 0;
  }

  function autoComplete() {
    const partialInput = input.value;
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
