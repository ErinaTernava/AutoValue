# Machine Learning Analysis of Used Car Data

## Project Overview

This project presents a comprehensive machine learning analysis of a used car dataset. The main objective is to explore, preprocess, and analyze vehicle data in order to classify cars into different price categories and discover hidden patterns through clustering techniques.

The project consists of four major stages:

1. **Data Preprocessing and Cleaning**
2. **Classification Models**
3. **Neural Network Models**
4. **Clustering Analysis**

The implementation is developed in **Python** using popular data science and machine learning libraries such as Pandas, NumPy, Scikit-learn, XGBoost, Matplotlib, and Seaborn.

---

## Project Objectives

The primary goals of this project are:

* Clean and prepare raw used car datasets for analysis.
* Build supervised machine learning models capable of predicting car price categories.
* Compare the performance of traditional machine learning algorithms and neural networks.
* Apply unsupervised learning algorithms to identify natural groupings of vehicles.
* Visualize and interpret the relationships between vehicle characteristics and market segments.

---

## Dataset Description

The dataset contains information about used cars from multiple manufacturers, including brands such as:

* Audi
* BMW
* Ford
* Hyundai
* Mercedes-Benz
* Skoda
* Toyota
* Vauxhall
* Volkswagen
* Additional C-Class and Focus datasets (including unclean versions)

Typical attributes include:

* Brand
* Model
* Year of production
* Mileage
* Fuel type
* Transmission type
* Engine size
* Horsepower
* Miles per gallon (MPG)
* Vehicle price

The project combines and preprocesses these datasets before applying machine learning algorithms.

---

## Project Structure

```text
project-root/
│
├── data_preprocessing.py              # Data cleaning and preprocessing script
│
├── data/
│   ├── *.csv                          # Original datasets
│   ├── cleaned/
│   │   ├── *_cleaned.csv              # Cleaned datasets
│   │   └── ...
│   └── reports/
│       ├── *_report.txt               # Data cleaning reports
│       └── ...
│
├── notebooks/
│   ├── classification.py              # Classification models
│   ├── neural_networks.py             # Neural network experiments
│   └── clustering.py                  # Clustering analysis
│
├── plots/
│   ├── *.png                          # Generated visualizations
│   └── final_results.csv              # Classification results summary
│
└── README.md
```

> **Note:** The data preprocessing script is located in the parent/root folder, while the Classification, Neural Networks, and Clustering modules are located inside the `/notebooks` folder.

---

# Data Preprocessing

## Data Cleaning Pipeline

The first phase of the project focuses on cleaning and standardizing the raw datasets before machine learning analysis.

The preprocessing script performs the following tasks:

### 1. Dataset Management

* Creates directories for cleaned datasets and reports.
* Renames inconsistent file names.
* Standardizes dataset naming conventions.

### 2. Duplicate Removal

* Removes duplicate rows from every dataset.

### 3. Column Standardization

* Converts all column names to lowercase.
* Replaces spaces and hyphens with underscores.

### 4. Data Type Conversion

* Converts price values from text format into numerical values.
* Converts numerical columns such as:

  * year
  * mileage
  * engine size
  * horsepower
  * mpg

### 5. Missing Value Handling

* Removes records with missing values in critical columns.
* For unclean datasets:

  * Missing prices are replaced with the median value.
  * Missing years are replaced with 2000.
  * Missing mileage values are replaced with 0.

### 6. Outlier Detection and Removal

* Removes invalid price values.
* Removes extreme price outliers using the 99th percentile.
* Removes negative mileage values.

### 7. Reporting

For every processed dataset, a detailed report is automatically generated containing:

* Original number of rows.
* Number of rows after cleaning.
* Number and percentage of removed records.
* Final column list.
* Descriptive statistics for numerical features.

The cleaned datasets are stored in:

```text
data/cleaned/
```

The generated reports are stored in:

```text
data/reports/
```

---

# Feature Engineering

Several additional features are created before model training:

## Car Age

The production year is transformed into a more informative variable:

* `car_age = max(year) - year`

This feature better represents vehicle depreciation over time.

## Log Transformation

Mileage values are transformed using:

* `log1p(mileage)`

This reduces skewness and improves model stability.

## One-Hot Encoding

Categorical variables are transformed into numerical format using One-Hot Encoding:

* Brand
* Model
* Fuel Type
* Transmission

## Feature Scaling

Numerical features are standardized using `StandardScaler` before training models that require normalized inputs.

---

# Classification

## Problem Formulation

The supervised learning task consists of predicting a car's price category based on its characteristics.

### Target Variable

Car prices are divided into three categories:

| Category  | Price Range       |
| --------- | ----------------- |
| Budget    | £0 - £10,000      |
| Mid-Range | £10,000 - £20,000 |
| Premium   | Above £20,000     |

The target variable `price_category` is created using price binning.

---

## Train-Test Split

The dataset is divided into:

* 80% Training Data
* 20% Testing Data

Stratified sampling is used to preserve the class distribution.

---

## Feature Selection

Feature selection is performed using **ANOVA F-score (`SelectKBest`)**.

Three feature configurations are evaluated:

* All Features
* Top 50 Features
* Top 20 Features

This allows comparison between using the complete feature space and reduced feature subsets.

---

## Classification Models

### 1. Logistic Regression

A baseline Logistic Regression model is trained and later optimized using GridSearchCV.

Hyperparameters explored include:

* Regularization parameter (`C`)
* Solver type
* Penalty type

### 2. K-Nearest Neighbors (KNN)

KNN models are evaluated using different values of:

* Number of neighbors
* Distance metrics
* Weighting methods

### 3. Random Forest

Random Forest classifiers are trained using multiple configurations of:

* Number of trees
* Maximum tree depth
* Minimum samples required for splitting

Feature importance scores are also extracted from the optimized Random Forest model.

### 4. XGBoost

Extreme Gradient Boosting (XGBoost) is used as an advanced ensemble learning technique.

The following parameters are optimized:

* Number of estimators
* Learning rate
* Maximum tree depth

---

## Hyperparameter Optimization

Model tuning is performed using **GridSearchCV** with:

* Cross-validation
* Weighted F1-score as the optimization metric
* Parallel execution (`n_jobs=-1`)

---

## Model Evaluation

Each classification model is evaluated using:

* Accuracy
* Precision
* Recall
* Weighted F1-Score
* Confusion Matrix
* Classification Report

Performance comparisons between baseline and tuned models are visualized through charts and confusion matrices.

---

# Neural Networks

## Overview

In addition to traditional machine learning models, the project evaluates the performance of feed-forward artificial neural networks using Scikit-learn's `MLPClassifier`.

The same preprocessing pipeline used for the classification task is applied before training the neural networks.

---

## Neural Network Architectures

Three different architectures are tested:

| Model  | Hidden Layers |
| ------ | ------------- |
| Small  | (32)          |
| Medium | (64, 32)      |
| Large  | (128, 64, 32) |

All models use:

* ReLU activation function.
* Standardized input features.
* Maximum iteration limits between 300 and 400 epochs.

---

## Feature Selection for Neural Networks

Additional experiments are performed using:

* Variance Threshold feature elimination.
* SelectKBest (ANOVA F-score) with the top 50 features.

This allows comparison between baseline and feature-selected neural network models.

---

## Hyperparameter Tuning

GridSearchCV is used to optimize:

* Hidden layer architecture.
* Activation function (`relu`, `tanh`).
* Regularization parameter (`alpha`).

The best neural network model is selected based on weighted F1-score.

---

## Neural Network Evaluation

The final optimized neural network is evaluated using:

* Accuracy
* Precision
* Recall
* Weighted F1-score
* Classification Report
* Confusion Matrix

A comparison plot is also generated to visualize the performance of different network architectures.

---

# Clustering Analysis

## Objective

The unsupervised learning component of the project aims to discover natural groupings among vehicles without using predefined labels.

The clustering analysis investigates whether cars can be automatically grouped according to their shared characteristics.

---

## Clustering Feature Selection

The following numerical features are selected:

* Car Age
* Mileage
* MPG
* Engine Size

Categorical variables encoded using One-Hot Encoding:

* Brand
* Fuel Type
* Transmission

The `price` attribute is excluded from clustering because it represents the target variable and is only used later for comparison purposes.

---

## Data Preparation for Clustering

The clustering pipeline includes:

* Missing value handling.
* One-Hot Encoding of categorical features.
* Outlier treatment using IQR clipping.
* Feature standardization using StandardScaler.

---

## K-Means Clustering

K-Means experiments are performed using different values of K.

Several cluster quality metrics are computed:

* Elbow Method (WCSS/Inertia)
* Silhouette Score
* Calinski-Harabasz Index
* Davies-Bouldin Index

Different initialization strategies and parameter configurations are compared before selecting the final model.

---

## DBSCAN

Density-Based Spatial Clustering (DBSCAN) is evaluated using multiple combinations of:

* `eps`
* `min_samples`

The analysis includes:

* Number of clusters discovered.
* Number of noise points.
* Percentage of outliers.
* Silhouette Score.

---

## Hierarchical Clustering

Agglomerative Hierarchical Clustering is implemented using:

* Ward Linkage
* Complete Linkage
* Average Linkage

A dendrogram is generated to visualize the hierarchical relationships between observations.

---

## PCA Visualization

Principal Component Analysis (PCA) is applied for dimensionality reduction and visualization.

The project includes:

* 2D PCA plots.
* 3D PCA plots.
* Cluster visualization for all clustering algorithms.
* Centroid profile analysis.

---

## Clustering Evaluation

The clustering algorithms are compared using:

* Silhouette Score.
* Calinski-Harabasz Score.
* Davies-Bouldin Score.

Additionally, clustering results are compared with the real price categories using:

* Adjusted Rand Index (ARI).
* Normalized Mutual Information (NMI).

Cross-tabulation heatmaps and cluster interpretation analyses are also generated.

---

# Visualizations

Throughout the project, multiple visualizations are generated, including:

* Price distribution.
* Target class distribution.
* Feature importance charts.
* Correlation heatmaps.
* Confusion matrices.
* Model comparison charts.
* Elbow method plots.
* Silhouette score plots.
* PCA 2D and 3D visualizations.
* Cluster profile charts.
* Cross-tabulation heatmaps.

All generated figures are stored inside the `plots/` directory.

---

# Technologies and Libraries

## Programming Language

* Python 3.x

## Main Libraries

* pandas
* numpy
* matplotlib
* seaborn
* scikit-learn
* xgboost
* scipy
* pathlib
* datetime
* os
* re

---

# Installation

Clone the repository:

```bash
git clone https://github.com/ErinaTernava/AutoValue.git
cd AutoValue
```

Install the required packages:

```bash
pip install -r requirements.txt
```

---

# Running the Project

## Step 1: Data Preprocessing

Run the preprocessing script from the project root:

```bash
python data_preprocessing.py
```

This will:

* Clean the datasets.
* Generate cleaned CSV files.
* Create data quality reports.

## Step 2: Classification

Run the classification notebook or script located inside `/notebooks`.

## Step 3: Neural Networks

Run the neural network notebook or script inside `/notebooks`.

## Step 4: Clustering

Run the clustering notebook or script inside `/notebooks`.

---

# Outputs

The project automatically generates:

* Cleaned datasets.
* Data cleaning reports.
* Model evaluation metrics.
* Classification reports.
* Confusion matrices.
* Clustering evaluation tables.
* Visualization plots.
* Final comparison results.

---

# Conclusion

This project demonstrates the complete machine learning workflow, beginning with raw data preprocessing and ending with advanced supervised and unsupervised learning techniques. By combining traditional classification algorithms, neural networks, and clustering methods, the project provides a comprehensive analysis of the used car market and highlights the effectiveness of different machine learning approaches for both prediction and pattern discovery.
