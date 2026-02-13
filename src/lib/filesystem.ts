/*
 * This is a basic file system emulation implementation for my interactive terminal
 */

export type FileSystemErrorType = "NoPermission" | "DirectoryDoesNotExist";

export class FileSystemError extends Error {
  errorType: FileSystemErrorType;

  constructor(message: string, errorType: FileSystemErrorType) {
    super(message);
    this.name = "FileSystemError";
    this.errorType = errorType;
  }
}

const DirectoryDoesNotExistError = new FileSystemError(
  "",
  "DirectoryDoesNotExist",
);

const NoPermissionError = new FileSystemError(
  "You do not have permission for this",
  "NoPermission",
);

type FileType = "directory" | "executable";

interface FSNode {
  type: FileType;
  fileLabel: string;
  parent?: string;
  children: string[];
}

export class WebsiteFileSystem {
  index: Record<string, FSNode> = {};
  currentLocation: string = "~";

  constructor() {
    const root: FSNode = {
      type: "directory",
      fileLabel: "~",
      children: [],
    };

    this.index["~"] = root;
  }

  get workingDirectory(): string {
    return this.currentLocation;
  }

  private resolvePath(
    input: string,
    from: string = this.currentLocation,
  ): string {
    const raw = input.trim();
    if (!raw) throw DirectoryDoesNotExistError;
    if (raw.startsWith("/")) throw NoPermissionError;

    let segments = raw.split("/");
    let cwd = from;

    if (raw.startsWith("~")) {
      cwd = "~";
      segments = segments.slice(1);
    }

    for (const part of segments) {
      if (!(cwd in this.index)) throw DirectoryDoesNotExistError;

      const node = this.index[cwd];

      if (part === "" || part === ".") {
        continue;
      }

      if (part === "..") {
        if (!node.parent) throw NoPermissionError;
        cwd = node.parent;
        continue;
      }

      if (node.children.includes(`${part}/`)) {
        if (cwd === "~") cwd += "/";
        cwd += `${part}/`;
      } else {
        throw DirectoryDoesNotExistError;
      }
    }

    return cwd;
  }

  changeDirectory(input: string): string {
    this.currentLocation = this.resolvePath(input);
    return this.currentLocation;
  }

  listFiles(path?: string): string[] {
    const targetPath = path ? this.resolvePath(path) : this.currentLocation;

    return this.index[targetPath].children;
  }

  makeDirectory(path: string) {
    path = path.trim();
    if (!path) throw DirectoryDoesNotExistError;

    const parts = path.split("/").filter(Boolean);

    let currentPath = "~";
    let currentNode = this.index[currentPath];

    for (const part of parts) {
      const nextPath = `${currentPath}/${part}`;

      // directory already exists → walk into it
      if (this.index[nextPath]) {
        currentNode = this.index[nextPath];
        currentPath = nextPath;
        continue;
      }

      const node: FSNode = {
        type: "directory",
        fileLabel: part,
        parent: currentPath,
        children: [],
      };

      // register new directory
      this.index[`${nextPath}/`] = node;

      // link parent → child
      currentNode.children.push(`${part}/`);

      // move forward
      currentNode = node;
      currentPath = nextPath;
    }
  }
}
