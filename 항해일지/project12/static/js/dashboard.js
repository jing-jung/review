(() => {
  const csvInput = document.getElementById("csvInput");
  const dropZone = document.getElementById("dropZone");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const fileName = document.getElementById("fileName");
  const loading = document.getElementById("loading");
  const errorBox = document.getElementById("errorBox");
  const dashboard = document.getElementById("dashboard");
  const statusText = document.getElementById("statusText");

  let selectedFile = null;

  const plotLayout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: "DM Sans, sans-serif", color: "#e8edf4" },
    margin: { l: 60, r: 30, t: 40, b: 60 },
  };

  function setFile(file) {
    if (!file || !file.name.toLowerCase().endsWith(".csv")) {
      alert("CSV 파일만 업로드할 수 있습니다.");
      return;
    }
    selectedFile = file;
    fileName.textContent = file.name;
    analyzeBtn.disabled = false;
    statusText.textContent = `${file.name} 선택됨 — 분석 시작을 눌러 주세요.`;
  }

  csvInput.addEventListener("change", (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });

  analyzeBtn.addEventListener("click", async () => {
    if (!selectedFile) return;

    loading.classList.remove("hidden");
    errorBox.classList.add("hidden");
    dashboard.classList.add("hidden");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "분석에 실패했습니다.");
      }

      renderDashboard(data);
      dashboard.classList.remove("hidden");
      statusText.textContent = `분석 완료 — ${data.model.label} 모델 적용`;
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove("hidden");
      statusText.textContent = "분석 중 오류가 발생했습니다.";
    } finally {
      loading.classList.add("hidden");
    }
  });

  function renderDashboard(data) {
    renderKpis(data);
    renderModelBanner(data.model);
    renderStatsTable(data.column_stats);
    renderHeatmap(data.correlation);
    renderImportance(data.training.feature_importance);
    renderPerformance(data);
    renderPredictions(data.training.predictions);
  }

  function renderKpis(data) {
    const p = data.profile;
    const m = data.training.metrics;
    const items = [
      { label: "원본 행", value: p.original_rows.toLocaleString() },
      { label: "샘플 행", value: p.sampled_rows },
      { label: "컬럼 수", value: p.original_cols },
      { label: "타겟", value: p.target_column },
      { label: "작업 유형", value: p.task_type },
      {
        label: "주요 지표",
        value:
          m.task === "classification"
            ? `${(m.accuracy * 100).toFixed(1)}% acc`
            : `R² ${m.r2}`,
      },
    ];

    document.getElementById("kpiGrid").innerHTML = items
      .map(
        (i) => `
      <div class="kpi-card">
        <div class="label">${i.label}</div>
        <div class="value">${i.value}</div>
      </div>`
      )
      .join("");
  }

  function renderModelBanner(model) {
    const cvHtml = Object.entries(model.cv_scores)
      .map(([k, v]) => `<span>${k}: <strong>${v}</strong></span>`)
      .join(" · ");

    document.getElementById("modelBanner").innerHTML = `
      <h4>선택 모델: ${model.label}</h4>
      <p>${model.selection_reason}</p>
      <p style="margin-top:0.5rem;font-size:0.82rem;">교차검증 점수 — ${cvHtml}</p>
    `;
  }

  function renderStatsTable(stats) {
    const tbody = document.querySelector("#statsTable tbody");
    tbody.innerHTML = stats
      .map((row) => {
        const top =
          row.top_values &&
          Object.entries(row.top_values)
            .map(([k, v]) => `${k}(${v})`)
            .join(", ");
        return `<tr>
          <td>${row.column}</td>
          <td>${row.dtype}</td>
          <td>${row.count}</td>
          <td>${row.null_pct}%</td>
          <td>${row.unique}</td>
          <td>${row.mean ?? "—"}</td>
          <td>${row.std ?? "—"}</td>
          <td>${row.min ?? "—"}</td>
          <td>${row.max ?? "—"}</td>
          <td>${top || "—"}</td>
        </tr>`;
      })
      .join("");
  }

  function renderHeatmap(corr) {
    const el = document.getElementById("heatmapChart");
    if (!corr.columns || corr.columns.length < 2) {
      el.innerHTML =
        '<p style="color:#8b9bb0;padding:2rem;">수치형 컬럼이 부족해 상관관계 히트맵을 생성할 수 없습니다.</p>';
      return;
    }

    Plotly.newPlot(
      el,
      [
        {
          z: corr.matrix,
          x: corr.columns,
          y: corr.columns,
          type: "heatmap",
          colorscale: [
            [0, "#1a365d"],
            [0.5, "#1a2330"],
            [1, "#22c997"],
          ],
          zmid: 0,
        },
      ],
      {
        ...plotLayout,
        title: "피어슨 상관계수",
        xaxis: { tickangle: -45 },
        height: 420,
      },
      { responsive: true }
    );
  }

  function renderImportance(features) {
    const el = document.getElementById("importanceChart");
    if (!features || !features.length) {
      el.innerHTML =
        '<p style="color:#8b9bb0;padding:2rem;">피처 중요도를 계산할 수 없습니다.</p>';
      return;
    }

    const reversed = [...features].reverse();
    Plotly.newPlot(
      el,
      [
        {
          type: "bar",
          orientation: "h",
          x: reversed.map((f) => f.importance),
          y: reversed.map((f) => f.feature),
          marker: {
            color: reversed.map((_, i) =>
              `rgba(61, 139, 253, ${0.35 + (i / reversed.length) * 0.65})`
            ),
          },
        },
      ],
      {
        ...plotLayout,
        title: "Feature Importance",
        xaxis: { title: "중요도" },
        height: Math.max(380, features.length * 22),
      },
      { responsive: true }
    );
  }

  function renderPerformance(data) {
    const model = data.model;
    const metrics = data.training.metrics;

    const cvLabels = Object.keys(model.cv_scores);
    const cvValues = Object.values(model.cv_scores);

    Plotly.newPlot(
      document.getElementById("cvChart"),
      [
        {
          type: "bar",
          x: cvLabels,
          y: cvValues,
          marker: {
            color: cvLabels.map((l) =>
              l === model.label ? "#22c997" : "#3d8bfd"
            ),
          },
        },
      ],
      {
        ...plotLayout,
        title: "모델별 교차검증 점수",
        yaxis: { title: "점수", range: [0, 1.05] },
        height: 320,
      },
      { responsive: true }
    );

    const cardsEl = document.getElementById("metricsCards");
    if (metrics.task === "classification") {
      cardsEl.innerHTML = [
        { label: "Accuracy", value: metrics.accuracy },
        { label: "F1 (weighted)", value: metrics.f1_weighted },
        { label: "Train", value: data.training.train_size },
        { label: "Test", value: data.training.test_size },
      ]
        .map(
          (c) => `
        <div class="metric-pill">
          <div class="label">${c.label}</div>
          <div class="value">${c.value}</div>
        </div>`
        )
        .join("");

      Plotly.newPlot(
        document.getElementById("confusionChart"),
        [
          {
            z: metrics.confusion_matrix,
            x: metrics.labels,
            y: metrics.labels,
            type: "heatmap",
            colorscale: "Blues",
            showscale: true,
          },
        ],
        {
          ...plotLayout,
          title: "Confusion Matrix",
          xaxis: { title: "예측" },
          yaxis: { title: "실제" },
          height: 320,
        },
        { responsive: true }
      );

      renderClassificationReport(metrics.classification_report);
    } else {
      cardsEl.innerHTML = [
        { label: "R²", value: metrics.r2 },
        { label: "MAE", value: metrics.mae },
        { label: "RMSE", value: metrics.rmse },
      ]
        .map(
          (c) => `
        <div class="metric-pill">
          <div class="label">${c.label}</div>
          <div class="value">${c.value}</div>
        </div>`
        )
        .join("");
      document.getElementById("confusionChart").innerHTML =
        '<p style="color:#8b9bb0;padding:1rem;">회귀 작업 — 혼동 행렬 없음</p>';
      document.getElementById("reportTable").innerHTML = "";
    }
  }

  function renderClassificationReport(report) {
    const rows = Object.entries(report).filter(
      ([k]) => !["accuracy", "macro avg", "weighted avg"].includes(k) && typeof report[k] === "object"
    );

    let html = `<table class="data-table"><thead><tr>
      <th>클래스</th><th>Precision</th><th>Recall</th><th>F1</th><th>Support</th>
    </tr></thead><tbody>`;

    rows.forEach(([cls, vals]) => {
      html += `<tr>
        <td>${cls}</td>
        <td>${(vals.precision ?? 0).toFixed(3)}</td>
        <td>${(vals.recall ?? 0).toFixed(3)}</td>
        <td>${(vals["f1-score"] ?? 0).toFixed(3)}</td>
        <td>${vals.support ?? ""}</td>
      </tr>`;
    });

    if (report["weighted avg"]) {
      const w = report["weighted avg"];
      html += `<tr style="font-weight:600">
        <td>Weighted Avg</td>
        <td>${w.precision.toFixed(3)}</td>
        <td>${w.recall.toFixed(3)}</td>
        <td>${(w["f1-score"] ?? 0).toFixed(3)}</td>
        <td>${w.support}</td>
      </tr>`;
    }

    html += "</tbody></table>";
    document.getElementById("reportTable").innerHTML = html;
  }

  function renderPredictions(preds) {
    const tbody = document.querySelector("#predTable tbody");
    const actual = preds.actual || [];
    const predicted = preds.predicted || [];

    tbody.innerHTML = actual
      .map((a, i) => {
        const p = predicted[i];
        const match = String(a) === String(p);
        return `<tr>
          <td>${i + 1}</td>
          <td>${a}</td>
          <td>${p}</td>
          <td class="${match ? "match-yes" : "match-no"}">${match ? "✓" : "✗"}</td>
        </tr>`;
      })
      .join("");
  }
})();
