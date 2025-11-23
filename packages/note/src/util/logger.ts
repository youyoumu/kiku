export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface LoggerOptions {
  level?: LogLevel; // minimum active level
  onUpdate?: (text: string) => void; // optional callback
}

export class Logger {
  private static levels: LogLevel[] = [
    "trace",
    "debug",
    "info",
    "warn",
    "error",
    "fatal",
  ];

  private logs: string[] = [];
  private minLevelIndex: number;
  private onUpdate?: (text: string) => void;

  constructor(options: LoggerOptions = {}) {
    this.minLevelIndex = options.level
      ? Logger.levels.indexOf(options.level)
      : 0; // default = trace
    this.onUpdate = options.onUpdate;
  }

  attachToGlobalErrors() {
    // 1 Catch runtime errors (syntax, thrown errors, etc.)
    window.addEventListener("error", (event) => {
      this.error("GlobalError:", event.message, {
        file: event.filename,
        line: event.lineno,
        col: event.colno,
        error: event.error?.stack ?? String(event.error),
      });
    });

    // 2 Catch unhandled Promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.error("UnhandledRejection:", {
        reason:
          event.reason instanceof Error ? event.reason.stack : event.reason,
      });
    });

    // 3 Optional: Catch console.error calls
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      this.error("ConsoleError:", ...args);
      originalConsoleError.apply(console, args);
    };
  }

  private format(level: LogLevel, args: unknown[]): string {
    const time = new Date().toISOString().split("T")[1].replace("Z", "");
    const msg = args
      .map((a) =>
        typeof a === "object" ? JSON.stringify(a, null, 2) : String(a),
      )
      .join(" ");

    return `[${time}] [${level.toUpperCase()}] ${msg}`;
  }

  push(level: LogLevel, args: unknown[]) {
    if (Logger.levels.indexOf(level) < this.minLevelIndex) return;

    const line = this.format(level, args);
    this.logs.push(line);

    if (this.onUpdate) {
      this.onUpdate(this.logs.join("\n"));
    }
  }

  trace(...args: unknown[]) {
    this.push("trace", args);
  }
  debug(...args: unknown[]) {
    this.push("debug", args);
  }
  info(...args: unknown[]) {
    this.push("info", args);
  }
  warn(...args: unknown[]) {
    this.push("warn", args);
  }
  error(...args: unknown[]) {
    this.push("error", args);
  }
  fatal(...args: unknown[]) {
    this.push("fatal", args);
  }

  get(): string {
    return this.logs.join("\n");
  }

  clear() {
    this.logs = [];
    if (this.onUpdate) this.onUpdate("");
  }
}
