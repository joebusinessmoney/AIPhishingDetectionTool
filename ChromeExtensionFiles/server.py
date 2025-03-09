from flask import Flask, request, jsonify
import joblib
import re

app = Flask(__name__)

# load logistic regression model and text vectorizer

model = joblib.load("logisticRegressionModel.pkl")
vectorizer = joblib.load("tfidfVectorizer.pkl")

def cleanText(text):
    text = text.lower()
    text = re.sub(r"\W+", " ", text) # removes special characters
    return text

@app.route("/")
def home():
    return "thingies ruynning, send POST requedstion to /predict"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    emailText = data.get("Email Text", "")

    cleanedText = cleanText(emailText)
    features = vectorizer.transform([cleanedText])

    prediction = model.predict(features)[0]
    probability = model.prediction_proba(features)[0][1] * 100 

    return jsonify({"phishing_score": round(probability, 2), "prediction": prediction})

if __name__ == "__main__":
    app.run(debug=True)