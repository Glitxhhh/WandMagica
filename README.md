<div align="center">

![logo](./assets/icon.svg)

# WandEnhancer

[![GitLab Mirror](https://img.shields.io/badge/GitLab-mirror-fc6d26?logo=gitlab)](https://gitlab.com/kitbyte/wand-enhancer)

</div>

<h4>An open-source interoperability tool designed to extend local client-side configurations and improve the UX of the Wand application.</h4>

**🚨 IMPORTANT NOTICE: THIS PROJECT HAS NO OFFICIAL YOUTUBE TUTORIALS OR GUIDES. 🚨
There are no official videos showing how to install or use this tool. Scammers are creating fake tutorials using this project's name and placing malware/password stealers in the video descriptions. The only official prebuilt executable is attached to a [GitHub Release on this repository](../../releases) — `Glitxhhh/Wand-Enhancer`, the community continuation of the original `k1tbyte/Wand-Enhancer` (currently inactive upstream). If you downloaded an `.exe` or archive from a YouTube link, a random website, or a third-party mirror, you did not get it from this project. We are not responsible for third-party downloads. The binary is unsigned (see below) — Windows or your antivirus may warn on first run; that alone is not a sign of tampering, but always get it from this repository's own Releases page, never a link someone else sends you.**

## 👾 What does it access?

The default .NET patcher modifies files in the selected local Wand installation and contains no update-checking or telemetry network code. Wand itself remains an online application, build tools restore declared dependencies, and the optional Remote Web Panel deliberately starts a LAN HTTP/WebSocket server and uses Wand API/CDN data. An explicit build-time option can include GitHub release notifications; that variant sends a GitHub API request with your IP and a User-Agent when Wand starts, but sends no Wand or account data and never downloads updates. Review the source before running the binary from either path below; unsigned patching tools can trigger generic antivirus heuristics.

## 💫 What features are improved?

✅ Local environment configuration management <br/>
✅ Automated compatibility adjustments for new client versions <br/>
✅ Advanced layout and theme customization (Client-side only) <br/>
✅ AI Features <br/>
✅ Remote web panel (Remote Connect on mobile) <br/>

## 🌐 Remote Web Panel
WandEnhancer includes a built-in **Remote Web Panel** allowing you to control app features directly from your phone.

### Quick Start:
1. Ensure both your PC and phone are on the **same Wi-Fi network**.
2. Hover over the **Connect** button in the top bar of WandEnhancer.
3. Scan the displayed **QR code** with your phone's camera.

### Troubleshooting & Remote Access:
- **Page isn't loading?** First, ensure both your PC and phone are connected to the **same local network**. Some routers and guest Wi-Fi networks enable client isolation/AP isolation, which blocks devices on the same SSID from reaching each other. If it still does not load, check Windows Firewall and allow inbound traffic on TCP port `3223` for your local network. If Windows marked your connection as **Public**, switching it to **Private** can also help.
- **Using mobile data or a different network?** If you want to use the panel over mobile data (LTE/5G) or from an entirely different network, you can use [Tailscale](https://tailscale.com/) or similar VPN tools.
- The panel uses plain HTTP on port `3223` and has no pairing code. Anyone who can reach that port can view the panel and control the active trainer, so use it only on a trusted LAN/VPN and never expose the port directly to the internet.
- The panel protocol does not include your Wand bearer token or installation-path fields.

## 👀 How to use?

### Option A: download the prebuilt release

Grab the latest `WandEnhancer.exe` from this repository's **[Releases](../../releases)** page and run it. This is the fastest path, but note:

- The binary is **unsigned**. Windows SmartScreen or your antivirus may flag it on first run — that's expected for an unsigned tool that patches another application, not necessarily a sign anything's wrong. If you'd rather not run an unsigned binary at all, use Option B below and build it yourself from source.
- Only trust `.exe` files attached directly to a Release on **this** repository. A download from anywhere else — a YouTube description, a random site, a Discord link — did not come from this project.

### Option B: build it yourself

Build your own executable from your own fork using GitHub Actions. This also lets you read every line that goes into the binary before you run it.

1. Sign in to GitHub and fork this repository.
2. Use **Sync fork** before each build so your fork contains the latest fixes.
3. Open your fork, go to the **Actions** tab, and enable workflows if GitHub asks you to.
4. Select the **Build executable** workflow.
5. Click **Run workflow** and start the run. Leave **Include GitHub release checks when Wand starts** off for a fully offline patcher, or enable it to compile in new-version notifications.
6. Wait for the workflow to finish, open the completed run, and download the artifact.
7. Extract the artifact zip and run `WandEnhancer.exe` to apply local client modifications.

### Testing a release candidate

- `master` is the stable source. Select a `feature/rc_*` branch in your fork's **Run workflow** branch selector only when the maintainer explicitly asks for candidate testing. Ensure that branch contains the upstream commit you intend to test; syncing `master` does not update a separate RC branch.
- You do **not** need to open a pull request to this repository to build your fork.
- Record the workflow's source commit SHA, not just `2.0.0.0`: the RC tag, RC branch and a local build may contain different fixes.
- For startup failures, attach `launcher.log` and, if relevant, `launcher.prev.log` from the Wand installation root. They include the build commit and applied patches. Remove personal paths or other private information before sharing.
- Include the exact Wand version and stable/beta channel, selected patches, and whether the failure happened on a fresh install, an update, or Restore. Do not attach executables, account tokens or storage dumps.

*Here how you do it:*

https://github.com/user-attachments/assets/7966cabe-0aa6-424d-8c2f-981ad91e0f91

### Found a bug, or want a feature?

Open an issue using the **[Bug report](../../issues/new?template=bug_report.yml)** or **[Feature request](../../issues/new?template=feature_request.yml)** template. For anything else — a question, an idea you want to talk through first — use **[Discussions](../../discussions)** instead.

## 🧩 Custom scripts

You can inject your own JavaScript into Wand at patch time to tweak or fix things in the client UI. This reuses the same renderer injection the Remote Web Panel uses, so it requires the **Remote Web Panel** patch to be enabled.

**How to add a script**

- In the patch dialog, add one or more `.js` files (only existing `.js` files are accepted), **or**
- Drop `.js` files into a `renderer-scripts/` folder placed next to the patcher executable.

Then patch as usual — your scripts are bundled into the client and run inside Wand's window.

**How it runs**

- Each script runs inside Wand's renderer (full DOM access, plus Node `require`).
- It is wrapped so a thrown error is logged and never crashes Wand.
- It may run **more than once** per launch (on load and again shortly after), so guard one‑time work behind a global flag.
- A small `WandEnhancer` helper is available: `WandEnhancer.log(...)`, `WandEnhancer.remoteUrl`, `WandEnhancer.apiVersion`.

**Minimal example** (`hello.js`)

```js
// Injected scripts can run multiple times — guard one-time setup.
if (!globalThis.__helloScriptInstalled) {
  globalThis.__helloScriptInstalled = true;

  WandEnhancer.log("Hello from my custom script!", WandEnhancer.remoteUrl);

  new MutationObserver(() => {
    const dialog = document.querySelector("ux-dialog:not([data-seen])");
    if (dialog) {
      dialog.setAttribute("data-seen", "1");
      WandEnhancer.log("A dialog opened.");
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
}
```

> Scripts run with the same privileges as the Wand client. Only add scripts you trust and understand.

## 🛠️ How to build from source

Building from source on Windows requires a local development environment.

### Requirements

- `Node.js` and `pnpm`
- `Visual Studio 2022` or `Build Tools for Visual Studio 2022` with `MSBuild`
- .NET Framework 4.8 desktop build tools / targeting pack

### Build steps

1. Clone this repository.
2. Install the requirements above and make sure `pnpm` and `MSBuild` are available.
3. Run `build.cmd` from Command Prompt or PowerShell.

The build script installs dependencies, lints and type-checks the panel, builds production assets, runs web tests, builds WPF, and checks desktop patch state and structural JavaScript patches. Tests use temporary fixtures, not your Wand installation.

Update notifications are excluded by default. To compile them in locally, run `build.cmd -EnableUpdateNotifications`. When compiled in, the check runs on Wand's launch (on by default, toggle in Settings), shows a native Windows notification for a newer release, and opens the release notes when clicked (the release page when only the launcher is running). It never downloads or installs an update.

---

## ❓ Q&A

- **Where do I download the executable?**
  - From this repository's own **[Releases](../../releases)** page (Option A above), or from your own fork's **Actions** artifact after running the **Build executable** workflow (Option B). Do not download `.exe` files from YouTube descriptions, random mirrors, Discord attachments, or issue comments.
- **Why does Windows Defender or SmartScreen warn about my build?**
  - It's unsigned, whether it's the Release binary or your own Actions artifact - uncommon enough that Windows may warn regardless. Review the source and verify the Release's or your own fork's workflow logs rather than taking the warning as proof of tampering.
- **Can I use a binary built by someone else?**
  - A Release published on this repository was built by this repository's own `Release` workflow, from the exact source at that tag - the run logs are public, so you can verify what went into it. A binary from anywhere else (a different fork, a YouTube link, a Discord attachment) should be treated as untrusted; this repository cannot verify or support those.
- **Does this send data anywhere?**
  - The default .NET patcher is fully offline. The optional Remote Web Panel listens on your LAN and may request trainer translations/artwork through Wand's existing API/CDN paths. If you explicitly compile in update notifications, each Wand launch checks GitHub's public releases API and exposes only the normal request metadata, including your IP and User-Agent. There is no telemetry, download, or automatic update.
- **How do I learn about a new version without an in-app update check?**
  - On GitHub choose **Watch → Custom → Releases**, then sync your fork and run **Build executable** when a release is published. You can also opt into compile-time release notifications in the manual workflow.

---
## 🖼️ Screenshots
![1](./assets/screenshots/app1.png)
<div align='center'>

![2](./assets/screenshots/app2.png)
</div>


## 📜 License
This project is licensed under the Apache-2.0 - see the [LICENSE](LICENSE.md) file for details.


## ❤️ Support

This is the community continuation fork - these links support its maintenance, not the original project's.

If you find this fork useful, you can support its development using any of the options below 🙌

[![Patreon](https://img.shields.io/badge/Patreon-donate-f96854.svg?logo=patreon)](https://patreon.bifrosthub.ru/)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-donate-ff5e5b.svg?logo=ko-fi)](https://ko-fi.com/glitxh)
[![BTC](https://img.shields.io/badge/BTC-donate-f7931a.svg?logo=bitcoin)](https://www.blockchain.com/explorer/addresses/btc/bc1qnwtms7pp8hdfqnuunvs3juwskgu7tartd532pz)
[![ETH](https://img.shields.io/badge/ETH-donate-3c3c3d.svg?logo=ethereum)](https://etherscan.io/address/0x48240481C69904C35EC41B4f4eBE41Af05D81975)
[![SOL](https://img.shields.io/badge/SOL-donate-9945ff.svg?logo=solana)](https://explorer.solana.com/address/8gLiGa61utSAyqRGy4QtoVzP6BNkL3GjQZZBpuRtY8hK)
[![USDT TRC20](https://img.shields.io/badge/USDT--TRC20-donate-26a17b.svg?logo=tether)](https://tronscan.org/#/address/TDgQTrr4i3ivJQtQpYB5M3nEw92VkAmC6D)

<details>
<summary>Crypto addresses (click to expand)</summary>

| Chain | Address |
| --- | --- |
| Bitcoin | `bc1qnwtms7pp8hdfqnuunvs3juwskgu7tartd532pz` |
| Ethereum | `0x48240481C69904C35EC41B4f4eBE41Af05D81975` |
| Solana | `8gLiGa61utSAyqRGy4QtoVzP6BNkL3GjQZZBpuRtY8hK` |
| Tron (USDT-TRC20) | `TDgQTrr4i3ivJQtQpYB5M3nEw92VkAmC6D` |

The Ethereum address above is the same wallet on Linea, Base, BNB Chain, Polygon, Optimism, Arbitrum, and Arc - just double-check your wallet is set to the network you mean to send on before confirming. The Tron address works for native TRX too, not just USDT-TRC20 - that's just what the badge is labeled for.

USDC isn't its own chain - send it as a token on whichever of the networks above you already use (Ethereum, the other EVM chains, or Solana), there's no separate USDC address.

</details>


---

> **Legal Disclaimer:**
> This project is a third-party enhancement tool intended solely for educational, research, and local interoperability purposes. It does not distribute any proprietary code or bypass server-side validations. All modifications are performed locally to customize the user's interface.

---
