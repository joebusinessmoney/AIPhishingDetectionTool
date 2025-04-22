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
print("vectorizer vocab: ", list(vectorizer.vocabulary_.keys())[:10]) # displays the top 10 words in the models vocabulary
probabilityIndex = list(model.classes_).index("Safe Email")
print(probabilityIndex)

def cleanText(text):
    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()    # remove extra spaces
    return text


@app.route("/feedback", methods=["POST"]) # gets POST request from frontend
def feedback():
    feedback=request.json # converts data to JSON
    print("A user has submitted the following feedback: ", feedback) # prints user feedback to terminal

    return jsonify({"status": "success", "message": "feedback received"}), 200 # 200 = okay everything worked

@app.route("/predict", methods=["POST"]) # gets POST request from frontend
def predict():

    print("POST received at /predict") # confirm the POST request is received
    data = request.json # get the data from front end
    print("the eagle has landed: ", data) # confirm data is received and correct
    emailText = data.get("email_text", "") # extract email text from json 
    print("email text: ", emailText)
    
    cleanedText = cleanText(emailText) # send text to cleanText function

    print("cleaned email text: ", cleanedText) # check cleantext looks as intended
    features = vectorizer.transform([cleanedText]) # use loaded tfidf vectorizer to convert the cleaned text into feature matrix
    print(" data features: ", features)

    
    prediction = model.predict(features)[0] # makes prediction using the loaded model  
    probability = model.predict_proba(features)[0][1]

    return jsonify({"phishing_score": round(probability * 100, 2), "prediction": prediction}) # sends the results of the data processing back to frontend

if __name__ == "__main__":
    app.run(debug=True)