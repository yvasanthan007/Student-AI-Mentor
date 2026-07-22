from __future__ import annotations

import os
import socket
import subprocess
import sys
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
BACKEND_PYTHON = BACKEND_DIR / "venv" / "Scripts" / "python.exe"

BACKEND_PORT_START = int(os.getenv("MENTORAI_BACKEND_PORT", "8001"))


def port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.2)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def find_free_port(start_port: int) -> int:
    port = start_port
    while port_in_use(port):
        port += 1
    return port


def find_node_path() -> str:
    node_path = shutil.which("node")
    if node_path:
        return node_path

    jetbrains_root = (
        Path.home()
        / "AppData"
        / "Local"
        / "JetBrains"
        / "PyCharm2026.2"
        / "acp-agents"
        / ".runtimes"
        / "node"
    )
    candidates = [*jetbrains_root.glob("**/node.exe"), Path(r"C:\Program Files\nodejs\node.exe"), Path(r"C:\Program Files (x86)\nodejs\node.exe")]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)

    result = subprocess.run(["where.exe", "node"], capture_output=True, text=True, check=False)
    for line in result.stdout.splitlines():
        candidate = line.strip()
        if candidate and Path(candidate).exists():
            return candidate

    result = subprocess.run(
        ["powershell", "-NoProfile", "-Command", "(Get-Command node).Source"],
        capture_output=True,
        text=True,
        check=False,
    )
    candidate = result.stdout.strip()
    if candidate:
        return candidate

    raise RuntimeError("Node.js was not found.")


def npm_cli_path(node_path: str) -> Path:
    node_dir = Path(node_path).parent
    candidate = node_dir / "node_modules" / "npm" / "bin" / "npm-cli.js"
    if candidate.exists():
        return candidate
    raise RuntimeError(f"npm CLI not found at {candidate}")


def run_command(command: list[str], cwd: Path, env: dict[str, str] | None = None) -> None:
    result = subprocess.run(
        command,
        cwd=cwd,
        text=True,
        capture_output=True,
        env=env,
        check=False,
    )
    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)
    if result.returncode != 0:
        raise RuntimeError(f"Command failed with exit code {result.returncode}: {' '.join(command)}")


def build_frontend() -> None:
    node_path = find_node_path()
    npm_cli = npm_cli_path(node_path)

    if not (FRONTEND_DIR / "node_modules").exists():
        run_command([node_path, str(npm_cli), "install"], cwd=FRONTEND_DIR)

    run_command([node_path, str(npm_cli), "run", "build"], cwd=FRONTEND_DIR)


def launch_backend(port: int) -> subprocess.Popen[str]:
    python_exe = BACKEND_PYTHON if BACKEND_PYTHON.exists() else Path(sys.executable)
    env = os.environ.copy()
    env["MENTORAI_BACKEND_PORT"] = str(port)
    return subprocess.Popen(
        [
            str(python_exe),
            "-m",
            "uvicorn",
            "app.main:app",
            "--reload",
            "--host",
            "127.0.0.1",
            "--port",
            str(port),
        ],
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env=env,
    )


def main() -> int:
    try:
        build_frontend()
    except Exception as exc:
        print(f"Frontend build failed: {exc}")
        return 1

    backend_port = find_free_port(BACKEND_PORT_START)
    backend = launch_backend(backend_port)

    print("MentorAI starting...")
    print(f"App: http://127.0.0.1:{backend_port}/")
    print(f"API: http://127.0.0.1:{backend_port}/api")

    assert backend.stdout is not None
    try:
        for line in backend.stdout:
            print(f"[backend] {line}", end="")
    except KeyboardInterrupt:
        print("\nShutting down MentorAI...")
    finally:
        if backend.poll() is None:
            backend.terminate()
            try:
                backend.wait(timeout=10)
            except subprocess.TimeoutExpired:
                backend.kill()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
