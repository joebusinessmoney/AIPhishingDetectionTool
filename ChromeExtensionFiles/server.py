from flask import Flask, request, jsonify
import joblib
import re
import os


thing = os.getcwd()

app = Flask(__name__)

# load logistic regression model and text vectorizer

modelPath = os.path.join(os.path.dirname(__file__), "logisticRegressionModelLING.pkl")
model = joblib.load(modelPath)
vectorizerPath = os.path.join(os.path.dirname(__file__), "tfidfVectorizerLING.pkl")
vectorizer = joblib.load(vectorizerPath)
print("vectorizer vocab: ", list(vectorizer.vocabulary_.keys())[:10])
probabilityIndex = list(model.classes_).index("Safe Email")
print(probabilityIndex)

def cleanText(text):
    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()    # remove extra spaces
    return text

#@app.route("/")
#def home():
#    return "thingies ruynning, send POST requedstion to /predict"

@app.route("/predict", methods=["POST"])
def predict():

    print("POST received at /predict zone whats going on witcha")
    data = request.json
    print("the eagle has landed: ", data)
    emailText = data.get("email_text", "")
    print("EMAIL TEXT !!!!!!!!!!!!!! ", emailText)
    
    cleanedText = cleanText(emailText)

    print("CLEANED TEXT !!!!!!!!!!!", cleanedText)
    features = vectorizer.transform([cleanedText])
    print(" FEATURE1111111111111111", features)

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    

    return jsonify({"phishing_score": round(probability * 100, 2), "prediction": prediction})

if __name__ == "__main__":
    app.run(debug=True)