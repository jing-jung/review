"""데이터 분석 자동화 웹앱 — Flask 서버."""

import os
import traceback

from flask import Flask, jsonify, render_template, request

from ml_analyzer import analyze_dataframe, load_csv

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "CSV 파일을 업로드해 주세요."}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"success": False, "error": "파일이 선택되지 않았습니다."}), 400

    if not file.filename.lower().endswith(".csv"):
        return jsonify({"success": False, "error": "CSV 파일만 지원합니다."}), 400

    try:
        df = load_csv(file)
        if df.empty:
            return jsonify({"success": False, "error": "빈 데이터셋입니다."}), 400

        result = analyze_dataframe(df)
        return jsonify(result)
    except Exception as exc:
        return (
            jsonify(
                {
                    "success": False,
                    "error": str(exc),
                    "detail": traceback.format_exc(),
                }
            ),
            500,
        )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
