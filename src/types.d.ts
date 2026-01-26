interface CommandsInterface {
  [key: string]: {
    help: string;
    method: (cmd: string[]) => void;
  };
}
