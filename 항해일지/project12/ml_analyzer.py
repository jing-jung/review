"""CSV 업로드 데이터 자동 분석·모델 선택·학습 파이프라인."""

from __future__ import annotations

import re
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

try:
    from xgboost import XGBClassifier, XGBRegressor

    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

SAMPLE_SIZE = 100
TARGET_CANDIDATES = (
    "churn",
    "target",
    "label",
    "class",
    "y",
    "output",
    "outcome",
    "category",
)

MODEL_LABELS = {
    "decision_tree": "Decision Tree",
    "random_forest": "Random Forest",
    "xgboost": "XGBoost",
}


def load_csv(file_storage) -> pd.DataFrame:
    """CSV 파일을 DataFrame으로 로드."""
    for encoding in ("utf-8", "cp949", "latin-1"):
        try:
            file_storage.seek(0)
            return pd.read_csv(file_storage, encoding=encoding)
        except (UnicodeDecodeError, pd.errors.ParserError):
            continue
    file_storage.seek(0)
    return pd.read_csv(file_storage, encoding="utf-8", errors="replace")


def sample_rows(df: pd.DataFrame, n: int = SAMPLE_SIZE) -> pd.DataFrame:
    """최대 n개 행을 무작위 샘플링."""
    if len(df) <= n:
        return df.copy().reset_index(drop=True)
    return df.sample(n=n, random_state=42).reset_index(drop=True)


def _normalize_col(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", str(name).lower())


def detect_target_column(df: pd.DataFrame) -> str:
    """타겟 컬럼 자동 탐지."""
    normalized = {_normalize_col(c): c for c in df.columns}

    for candidate in TARGET_CANDIDATES:
        if candidate in normalized:
            return normalized[candidate]

    for col in df.columns:
        if _normalize_col(col) in TARGET_CANDIDATES:
            return col

    last = df.columns[-1]
    nunique = df[last].nunique(dropna=True)
    if 2 <= nunique <= 30:
        return last

    for col in reversed(df.columns.tolist()):
        nunique = df[col].nunique(dropna=True)
        if 2 <= nunique <= 20:
            return col

    return df.columns[-1]


def _clean_series(values: pd.Series) -> pd.Series:
    if values.dtype == object:
        return (
            values.astype(str)
            .str.strip()
            .str.rstrip(".")
            .replace({"nan": np.nan, "None": np.nan, "": np.nan})
        )
    return values


def _is_classification_target(series: pd.Series) -> bool:
    cleaned = _clean_series(series).dropna()
    if cleaned.empty:
        return True
    if cleaned.dtype == object or cleaned.dtype.name == "bool":
        return cleaned.nunique() <= 30
    return cleaned.nunique() <= 20


def drop_high_cardinality_ids(df: pd.DataFrame, target_col: str) -> pd.DataFrame:
    """식별자성 고유값 컬럼 제거."""
    drop_cols = []
    n = len(df)
    for col in df.columns:
        if col == target_col:
            continue
        nunique = df[col].nunique(dropna=True)
        if nunique >= max(0.9 * n, 50) and nunique > 30:
            drop_cols.append(col)
    return df.drop(columns=drop_cols, errors="ignore")


def build_feature_matrix(
    df: pd.DataFrame, target_col: str
) -> tuple[pd.DataFrame, pd.Series, list[str], list[str], bool]:
    """전처리된 X, y와 컬럼 메타 반환."""
    work = df.copy()
    work[target_col] = _clean_series(work[target_col])
    work = drop_high_cardinality_ids(work, target_col)

    y_raw = work[target_col]
    is_classification = _is_classification_target(y_raw)

    feature_df = work.drop(columns=[target_col])
    numeric_cols = feature_df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = [
        c for c in feature_df.columns if c not in numeric_cols
    ]

    X = feature_df.copy()

    if is_classification:
        le_target = LabelEncoder()
        mask = y_raw.notna()
        y = pd.Series(index=y_raw.index, dtype=int)
        y.loc[mask] = le_target.fit_transform(y_raw.loc[mask].astype(str))
        target_names = le_target.classes_.tolist()
    else:
        y = pd.to_numeric(y_raw, errors="coerce")
        target_names = []

    for col in categorical_cols:
        le = LabelEncoder()
        series = X[col].astype(str).replace("nan", np.nan)
        encoded = pd.Series(index=X.index, dtype=float)
        mask = series.notna()
        encoded.loc[mask] = le.fit_transform(series.loc[mask])
        encoded.loc[~mask] = -1
        X[col] = encoded

    X = X.apply(pd.to_numeric, errors="coerce")
    numeric_cols = X.columns.tolist()
    categorical_cols = []

    return X, y, numeric_cols, categorical_cols, is_classification, target_names


def column_statistics(df: pd.DataFrame) -> list[dict[str, Any]]:
    """컬럼별 통계 요약."""
    rows = []
    for col in df.columns:
        series = df[col]
        dtype = str(series.dtype)
        null_pct = round(series.isna().mean() * 100, 2)
        nunique = int(series.nunique(dropna=True))

        entry: dict[str, Any] = {
            "column": col,
            "dtype": dtype,
            "count": int(series.count()),
            "null_pct": null_pct,
            "unique": nunique,
        }

        if pd.api.types.is_numeric_dtype(series):
            desc = series.describe()
            entry.update(
                {
                    "mean": round(float(desc.get("mean", 0)), 4),
                    "std": round(float(desc.get("std", 0)), 4),
                    "min": round(float(desc.get("min", 0)), 4),
                    "max": round(float(desc.get("max", 0)), 4),
                    "median": round(float(series.median()), 4),
                }
            )
        else:
            top = series.value_counts().head(3)
            entry["top_values"] = {
                str(k): int(v) for k, v in top.items()
            }

        rows.append(entry)

    return rows


def correlation_heatmap_data(df: pd.DataFrame) -> dict[str, Any]:
    """수치형 컬럼 상관계수 행렬."""
    numeric = df.select_dtypes(include=[np.number])
    if numeric.shape[1] < 2:
        return {"columns": [], "matrix": []}

    corr = numeric.corr().round(4)
    return {
        "columns": corr.columns.tolist(),
        "matrix": corr.values.tolist(),
    }


def _imbalance_ratio(y: pd.Series) -> float:
    counts = pd.Series(y).value_counts()
    if len(counts) < 2:
        return 1.0
    return float(counts.max() / max(counts.min(), 1))


def _build_model(name: str, is_classification: bool):
    if is_classification:
        if name == "decision_tree":
            return DecisionTreeClassifier(
                max_depth=8, min_samples_leaf=2, random_state=42
            )
        if name == "random_forest":
            return RandomForestClassifier(
                n_estimators=120, max_depth=12, random_state=42, n_jobs=-1
            )
        if name == "xgboost" and XGBOOST_AVAILABLE:
            return XGBClassifier(
                n_estimators=120,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                eval_metric="logloss",
                verbosity=0,
            )
    else:
        if name == "decision_tree":
            return DecisionTreeRegressor(
                max_depth=8, min_samples_leaf=2, random_state=42
            )
        if name == "random_forest":
            return RandomForestRegressor(
                n_estimators=120, max_depth=12, random_state=42, n_jobs=-1
            )
        if name == "xgboost" and XGBOOST_AVAILABLE:
            return XGBRegressor(
                n_estimators=120,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                verbosity=0,
            )
    raise ValueError(f"Unknown model: {name}")


def select_best_model(
    X: pd.DataFrame,
    y: pd.Series,
    is_classification: bool,
) -> tuple[str, dict[str, float], str]:
    """교차검증으로 최적 모델 선택."""
    candidates = ["decision_tree", "random_forest"]
    if XGBOOST_AVAILABLE:
        candidates.append("xgboost")

    n_samples = len(X)
    n_features = X.shape[1]
    imbalance = _imbalance_ratio(y)
    cv_folds = min(5, max(2, n_samples // 15))

    scoring = "f1_weighted" if is_classification else "r2"
    cv_scores: dict[str, float] = {}

    valid_mask = y.notna()
    Xv = X.loc[valid_mask].fillna(X.median(numeric_only=True))
    yv = y.loc[valid_mask]

    for name in candidates:
        try:
            model = _build_model(name, is_classification)
            scores = cross_val_score(
                model, Xv, yv, cv=cv_folds, scoring=scoring, n_jobs=-1
            )
            cv_scores[name] = round(float(scores.mean()), 4)
        except Exception:
            cv_scores[name] = -999.0

    best = max(cv_scores, key=cv_scores.get)
    reasons = []

    if imbalance > 2.0:
        reasons.append(f"클래스 불균형 비율 {imbalance:.2f}")
    reasons.append(f"샘플 {n_samples}건, 피처 {n_features}개")
    reasons.append(
        f"교차검증({cv_folds}-fold) {scoring} 기준 최고 성능: "
        f"{MODEL_LABELS[best]} ({cv_scores[best]:.4f})"
    )

    if best == "decision_tree":
        reasons.append("해석 가능성과 단순 패턴에 적합")
    elif best == "random_forest":
        reasons.append("혼합형 피처·노이즈에 강건")
    else:
        reasons.append("비선형 관계·불균형 데이터에 유리")

    return best, cv_scores, " | ".join(reasons)


def _feature_importance(model, feature_names: list[str]) -> list[dict[str, Any]]:
    if hasattr(model, "feature_importances_"):
        imp = model.feature_importances_
    elif hasattr(model, "coef_"):
        coef = model.coef_
        imp = np.abs(coef).mean(axis=0) if coef.ndim > 1 else np.abs(coef)
    else:
        return []

    pairs = sorted(
        zip(feature_names, imp), key=lambda x: x[1], reverse=True
    )
    return [
        {"feature": str(f), "importance": round(float(v), 6)}
        for f, v in pairs[:20]
    ]


def train_and_predict(
    X: pd.DataFrame,
    y: pd.Series,
    is_classification: bool,
    model_name: str,
) -> dict[str, Any]:
    """학습·평가·예측."""
    valid_mask = y.notna()
    X = X.loc[valid_mask].copy()
    y = y.loc[valid_mask].copy()
    X = X.fillna(X.median(numeric_only=True))

    feature_names = X.columns.tolist()
    stratify = y if is_classification and y.nunique() > 1 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42,
        stratify=stratify,
    )

    model = _build_model(model_name, is_classification)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    result: dict[str, Any] = {
        "feature_importance": _feature_importance(model, feature_names),
        "predictions": {
            "actual": y_test.tolist()[:30],
            "predicted": y_pred.tolist()[:30],
        },
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
    }

    if is_classification:
        labels = sorted(pd.Series(y).unique().tolist())
        cm = confusion_matrix(y_test, y_pred, labels=labels)
        result["metrics"] = {
            "task": "classification",
            "accuracy": round(accuracy_score(y_test, y_pred), 4),
            "f1_weighted": round(
                f1_score(y_test, y_pred, average="weighted", zero_division=0), 4
            ),
            "confusion_matrix": cm.tolist(),
            "labels": [str(l) for l in labels],
            "classification_report": classification_report(
                y_test, y_pred, output_dict=True, zero_division=0
            ),
        }
    else:
        result["metrics"] = {
            "task": "regression",
            "r2": round(r2_score(y_test, y_pred), 4),
            "mae": round(mean_absolute_error(y_test, y_pred), 4),
            "rmse": round(
                float(np.sqrt(mean_squared_error(y_test, y_pred))), 4
            ),
        }

    return result


def analyze_dataframe(df: pd.DataFrame) -> dict[str, Any]:
    """전체 분석 파이프라인."""
    original_shape = list(df.shape)
    sampled = sample_rows(df, SAMPLE_SIZE)
    target_col = detect_target_column(sampled)

    X, y, numeric_cols, categorical_cols, is_classification, target_names = (
        build_feature_matrix(sampled, target_col)
    )

    data_profile = {
        "original_rows": original_shape[0],
        "original_cols": original_shape[1],
        "sampled_rows": len(sampled),
        "target_column": target_col,
        "task_type": "classification" if is_classification else "regression",
        "numeric_features": len(numeric_cols),
        "categorical_features": len(categorical_cols),
        "target_classes": target_names if target_names else int(y.nunique()),
    }

    model_name, cv_scores, selection_reason = select_best_model(
        X, y, is_classification
    )

    training = train_and_predict(X, y, is_classification, model_name)

    return {
        "success": True,
        "profile": data_profile,
        "model": {
            "selected": model_name,
            "label": MODEL_LABELS.get(model_name, model_name),
            "selection_reason": selection_reason,
            "cv_scores": {
                MODEL_LABELS.get(k, k): v for k, v in cv_scores.items()
            },
        },
        "column_stats": column_statistics(sampled),
        "correlation": correlation_heatmap_data(sampled),
        "training": training,
        "preview": sampled.head(10).fillna("").astype(str).to_dict(orient="records"),
        "columns": sampled.columns.tolist(),
    }
