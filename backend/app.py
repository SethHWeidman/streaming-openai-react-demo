import json
from os import environ

import flask
from flask import request
import flask_cors
import openai

client = openai.OpenAI(api_key=environ.get("OPENAI_API_KEY"))
app = flask.Flask(__name__)
flask_cors.CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route("/stream")
def stream() -> flask.Response:
    user_prompt = request.args.get("prompt", "Tell me a story")
    
    def generate():
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant. "
                    "Please produce your answer in well-structured Markdown, "
                    "with headings and blank lines. "
                ),
            },
            {"role": "user", "content": user_prompt},
        ]
        
        completion = client.chat.completions.create(
            model="chatgpt-4o-latest",
            messages=messages,
            temperature=0.7,
            stream=True
        )

        for chunk in completion:
            if not chunk.choices:
                continue

            for choice in chunk.choices:
                if choice.delta and choice.delta.content:
                    raw_token = choice.delta.content
                    # We'll JSON-encode the token so any \n becomes \u000A or similar
                    # and SSE sees a single line of data
                    data_str = json.dumps({"token": raw_token})
                    yield f"data: {data_str}\n\n"

    return flask.Response(generate(), mimetype="text/event-stream")

if __name__ == "__main__":
    app.run(port=8000, debug=True)