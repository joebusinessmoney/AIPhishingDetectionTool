from flask import Flask, request, jsonify
import joblib
import re
import os


thing = os.getcwd()

app = Flask(__name__)

# load logistic regression model and text vectorizer

modelPath = os.path.join(os.path.dirname(__file__), "logisticRegressionModel.pkl")
model = joblib.load(modelPath)
vectorizerPath = os.path.join(os.path.dirname(__file__), "tfidfVectorizer.pkl")
vectorizer = joblib.load(vectorizerPath)


def cleanText(text):
    text = text.lower()
    text = re.sub(r"\W+", " ", text) # removes special characters
    return text

#@app.route("/")
#def home():
#    return "thingies ruynning, send POST requedstion to /predict"

@app.route("/predict", methods=["POST"])
def predict():

    print("POST received at /predict zone whats going on witcha")
    data = request.json
    print("the eagle has landed")
    emailText = data.get("email_text", "")

    cleanedText = cleanText(emailText)
    features = vectorizer.transform([cleanedText])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1] * 100 

    return jsonify({"phishing_score": round(probability, 2), "prediction": prediction})

if __name__ == "__main__":
    app.run(debug=True)