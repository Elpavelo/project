# Step 1: Import Libraries
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import SelectFromModel
from sklearn.inspection import permutation_importance
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from imblearn.over_sampling import SMOTE

# Step 2: Load Data from CSV
df = pd.read_csv("employee_performance.csv")

# Step 3: Exploratory Data Analysis (EDA)
print("Dataset shape:", df.shape)
print("\nData Overview:")
print(df.head())
print("\nData Types:")
print(df.dtypes)
print("\nStatistical Summary:")
print(df.describe())
print("\nMissing Values:")
print(df.isnull().sum())

# Check for correlations
plt.figure(figsize=(10, 8))
corr = df.select_dtypes(include=[np.number]).corr()
sns.heatmap(corr, annot=True, cmap='coolwarm')
plt.title('Feature Correlation Matrix')
plt.tight_layout()
plt.savefig('correlation_matrix.png')

# Check class distribution
print("\nClass Distribution:")
performance_counts = df["performance"].value_counts()
print(performance_counts)
plt.figure(figsize=(8, 6))
performance_counts.plot(kind='bar')
plt.title('Class Distribution')
plt.xlabel('Performance Category')
plt.ylabel('Count')
plt.tight_layout()
plt.savefig('class_distribution.png')

# Step 4: Feature Engineering
# Create new features based on domain knowledge
df['productivity_ratio'] = df['projects_completed'] / df['hours_worked']
df['feedback_avg'] = (df['peer_feedback'] + df['manager_feedback']) / 2
df['feedback_diff'] = abs(df['peer_feedback'] - df['manager_feedback'])

# Encode the target variable
label_encoder = LabelEncoder()
df["performance"] = label_encoder.fit_transform(df["performance"])

# Separate features and target
X = df.drop(columns=["employee_id", "performance"])
y = df["performance"]

# Split the data with stratification to maintain class distribution
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Step 5: Handle Class Imbalance with SMOTE
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

print("\nClass distribution after SMOTE:")
print(pd.Series(y_train_resampled).value_counts())

# Step 6: Feature Selection
# Train a model for feature selection
selector_model = RandomForestClassifier(n_estimators=100, random_state=42)
selector_model.fit(X_train_resampled, y_train_resampled)

# Plot feature importances
feature_importances = pd.DataFrame(
    selector_model.feature_importances_,
    index=X_train.columns,
    columns=['importance']
).sort_values('importance', ascending=False)

plt.figure(figsize=(10, 6))
feature_importances.plot(kind='bar')
plt.title('Feature Importances')
plt.tight_layout()
plt.savefig('feature_importances.png')
print("\nFeature Importances:")
print(feature_importances)

# Select important features
selector = SelectFromModel(selector_model, threshold='median')
X_train_selected = selector.fit_transform(X_train_resampled, y_train_resampled)
X_test_selected = selector.transform(X_test)

selected_features = X_train.columns[selector.get_support()]
print("\nSelected Features:", selected_features.tolist())

# Step 7: Model Selection and Hyperparameter Tuning
models = {
    "RandomForest": RandomForestClassifier(random_state=42),
    "GradientBoosting": GradientBoostingClassifier(random_state=42)
}

# Define a function for model evaluation
def evaluate_model(model, X_train, y_train, X_test, y_test, model_name):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    
    print(f"\n{model_name} Results:")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Classification Report:\n {report}")
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title(f'Confusion Matrix - {model_name}')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.tight_layout()
    plt.savefig(f'confusion_matrix_{model_name}.png')
    
    return accuracy, model

# Evaluate each model
results = {}
for name, model in models.items():
    accuracy, trained_model = evaluate_model(model, X_train_selected, y_train_resampled, 
                                            X_test_selected, y_test, name)
    results[name] = (accuracy, trained_model)

# Find the best model
best_model_name = max(results, key=lambda k: results[k][0])
best_accuracy, best_model = results[best_model_name]
print(f"\nBest Model: {best_model_name} with accuracy: {best_accuracy:.4f}")

# Step 8: Hyperparameter Tuning with Cross-Validation
print("\nPerforming Hyperparameter Tuning...")

if best_model_name == "RandomForest":
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [None, 10, 20, 30],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }
    base_model = RandomForestClassifier(random_state=42)
else:  # GradientBoosting
    param_grid = {
        'n_estimators': [100, 200, 300],
        'learning_rate': [0.01, 0.1, 0.2],
        'max_depth': [3, 5, 7],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    }
    base_model = GradientBoostingClassifier(random_state=42)

# Use StratifiedKFold for CV to maintain class distribution
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
grid_search = GridSearchCV(base_model, param_grid, cv=cv, scoring='accuracy', n_jobs=-1, verbose=1)
grid_search.fit(X_train_selected, y_train_resampled)

print(f"Best Parameters: {grid_search.best_params_}")
print(f"Best CV Accuracy: {grid_search.best_score_:.4f}")

# Evaluate the best model
best_tuned_model = grid_search.best_estimator_
y_pred = best_tuned_model.predict(X_test_selected)
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred)

print(f"\nTuned {best_model_name} Results:")
print(f"Accuracy: {accuracy:.4f}")
print(f"Classification Report:\n {report}")

# Calculate feature importance for the tuned model
if hasattr(best_tuned_model, 'feature_importances_'):
    importances = best_tuned_model.feature_importances_
else:
    # Use permutation importance as an alternative
    perm_importance = permutation_importance(best_tuned_model, X_test_selected, y_test, n_repeats=10, random_state=42)
    importances = perm_importance.importances_mean

# Map importances back to selected feature names
selected_features_list = selected_features.tolist()
importance_df = pd.DataFrame({
    'Feature': selected_features_list,
    'Importance': importances[:len(selected_features_list)]
}).sort_values('Importance', ascending=False)

print("\nFeature Importances (Tuned Model):")
print(importance_df)

plt.figure(figsize=(10, 6))
sns.barplot(x='Importance', y='Feature', data=importance_df)
plt.title(f'Feature Importances - Tuned {best_model_name}')
plt.tight_layout()
plt.savefig('tuned_feature_importances.png')

# Step 9: Save the Final Model
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('feature_selector', selector),
    ('model', best_tuned_model)
])

# Fit the pipeline on the entire dataset
X_full = df.drop(columns=["employee_id", "performance"])
y_full = df["performance"]
pipeline.fit(X_full, y_full)

# Save all components
joblib.dump(pipeline, "employee_performance_pipeline.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")

print("\nModel training and evaluation complete. Final pipeline saved.")