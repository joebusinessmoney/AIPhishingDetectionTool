from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import pandas as pd

# read csv file
data = pd.read_csv("Phishing_Email.csv")

# split text and labels
corpus = data["Email Text"].fillna("").tolist()
labels = data["Email Type"]

# creating the tfidf object

tfidf = TfidfVectorizer()

# get tf-df values

result = tfidf.fit_transform(corpus)

# split the data into training and testing data

X_train, X_test, y_train, y_test = train_test_split(result, labels, test_size=0.3, random_state=42)

# train data using a logistic regression model
model = LogisticRegression()
model.fit(X_train, y_train)

# make predictions

y_pred = model.predict(X_test)

# evaluate model

print("\nEvaluation:")
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")

# Detailed classification report
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# get idf values

#print('\nidf values:')
#for ele1, ele2 in zip(tfidf.get_feature_names_out(), tfidf.idf_):
#    print(ele1, ':', ele2)

# get word indexes

#print("\nword index:")
#print(tfidf.vocabulary_)

# display tf-idf values

#print("\ntf-idf value:")
#print(result)

# create matrix

#print("\ntf-idf values in matrix form:")
#print(result.toarray())