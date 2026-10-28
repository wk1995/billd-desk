---
name: run-billd-desk-dev
description: This skill should be used when starting, restarting, or debugging the billd-desk Electron app on Windows from WorkBuddy. It covers the white screen, ESM main-process crash, ELECTRON_RUN_AS_NODE, missing node on PATH, and the dev process being killed with the agent session. Triggers include 运行、启动、白屏、窗口没了、electron 起不来.
agent_created: true
---

# Run Billd Desk Dev

## Overview

Start the local billd-desk Electron window on Windows without depending on `node` being on PATH, and without letting WorkBuddy tear the window down when the agent turn ends.

Prefer the standalone launcher. Only use `pnpm dev` when hot reload is required, and then keep that process detached from the agent session.

## Start The Window

From the repository root, run:

```bat
.workbuddy\skills\run-billd-desk-dev\scripts\run-electron.cmd
```

The script clears `ELECTRON_RUN_AS_NODE`, kills a previous `electron.exe`, and starts `electron.exe` with the repo as the app directory. It does not call `node`. Do not use `node_modules\.bin\electron.cmd`: that shim shells out to `node`, which is missing in a normal Windows terminal (`'node' 不是内部或外部命令`).

The window loads `dist/index.html` through `loadFile`. Rebuild the renderer before launching whenever `src/` changed:

```bat
.workbuddy\skills\run-billd-desk-dev\scripts\build.cmd
```

`build.cmd` points at the WorkBuddy Node binary and unsets `ELECTRON_RUN_AS_NODE` before `vite build`.

## Required Project Settings

Keep these in the repo. They are why a plain `pnpm dev` or a packaged `base: 'dist'` build fails here.

- `package.json` has `"type": "module"`. `vite-plugin-electron` then emits an ESM main bundle, and Electron crashes with `Cannot use import statement outside a module`. The main config must force CJS: `lib.formats: ['cjs']` and `lib.fileName: () => 'index.cjs'`.
- Electron `loadFile` cannot resolve an absolute `/dist/...` script URL. Non-web `base` must be `'./'`, including production. A `base` of `'dist'` produces a white screen with no crash.
- `onstart` must remove the plugin's default `exit` listener. Otherwise closing the window calls `process.exit` and kills Vite too.
- Dev proxy targets and `src/constant.ts` point at the Mac backend over Tailscale (`100.70.34.72:4300`, TURN on `:3478`). The websocket field is named wss but the URL is `ws://`.

## WorkBuddy Environment

WorkBuddy sets `ELECTRON_RUN_AS_NODE=1` on agent shells. Electron then runs as plain Node, `require('electron').app` is undefined, and startup throws `Cannot read properties of undefined (reading 'isPackaged')`. Every vite or electron command must run with that variable unset. The scripts in this skill already do that.

Do not start the window from an agent-owned background shell. The process is killed when the turn or session ends, and it leaves no `close`, `quit`, `signal`, or `uncaughtException` line. Launch with `run-electron.cmd` so the user starts it outside the agent process tree.

## When The Window Disappears

`electron-main/index.ts` appends a synchronous lifecycle log to `.workbuddy/electron-life.log`. Read the last lines before restarting.

- Last line is `main-window-created` or `heartbeat`, with no `mainWindow-close`, `before-quit`, `signal`, or `uncaughtException`: the process was killed externally. Do not treat it as an app bug. Ask the user to run `run-electron.cmd`.
- `mainWindow-close` then `window-all-closed`: the window was closed normally.
- `uncaughtException`, `render-process-gone`, or `child-process-gone`: a real crash. Read that line and fix it.
- `single-instance-lock-failed`: another instance is already running.

Heartbeat lines are every 5 seconds and include whether the window is visible.

## White Screen

A living window with a blank page means the renderer did not load. Check `dist/index.html`: script and CSS hrefs must start with `./assets/`, not `/dist/`. If they do not, run `build.cmd` and then `run-electron.cmd`. DevTools `Autofill.enable` and `language-mismatch` errors are Chromium noise; ignore them.

## Hot Reload

Use hot reload only when the user asks to keep editing while the window stays open. Run vite with `ELECTRON_RUN_AS_NODE` unset, from a terminal the user owns, not from the agent session:

```bat
.workbuddy\skills\run-billd-desk-dev\scripts\dev.cmd
```

Closing the Electron window must not stop Vite. If it does, the `onstart` exit-listener override in `vite.config.ts` was lost.
