from pathlib import Path

PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "dashboard_prompt.txt"

def load_dashboard_prompt():
    with open(PROMPT_PATH, "r", encoding="utf-8") as file:
        return file.read()

if __name__ == "__main__":
    print(load_dashboard_prompt())