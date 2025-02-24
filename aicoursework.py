print("started")
import numpy as np
import pandas as pd
import random
print("first import")
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

print("sklearn")
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout
from tensorflow.keras.utils import to_categorical
import gc
print("keras")

# read dataset from csv file
data = pd.read_csv("Phishing_Email.csv")
print(data.shape)

# split dataset into text and labels, fill missing values with empty strings
corpus = data["Email Text"].fillna("").tolist()
labels = data["Email Type"]

#///////////////////////////////////////////////////
# RNN text classification model:
#///////////////////////////////////////////////////

# encode labels into numbers
labelEncoder = LabelEncoder()
labels = labelEncoder.fit_transform(labels)
labelMapping = {index: label for index, label in enumerate(labelEncoder.classes_)}

# tokenize text and pad sequences
vocabSize = 5000 # max number of unique words in the tokenizer
maxSentenceLength = 50 # max length of each sentence
tokenizer = Tokenizer(num_words=vocabSize)
tokenizer.fit_on_texts(corpus)
wordIndex = tokenizer.word_index # get the index of mapped words
print(wordIndex)
sequences = tokenizer.texts_to_sequences(corpus) # converts text to a sequence of integers
print(corpus[1])
print(sequences[1])
# split data for train test split classification
xClassification = pad_sequences(sequences, maxlen=maxSentenceLength) # pad sequences to max length
yClassification = to_categorical(labels, num_classes=2) # converst labels to categorical format
# train test split  
xTrainClass, xTestClass, yTrainClass, yTestClass = train_test_split(
    xClassification, yClassification, test_size=0.2, random_state=42
)

# build the text classification RNN model
classificationModel = Sequential([
    Embedding(input_dim=vocabSize, output_dim=64, input_length=maxSentenceLength), # embedding layer
    LSTM(128, return_sequences=False), # LSTM layer
    Dropout(0.5), # dropout layer to reduce overfitting
    Dense(64, activation='relu'), # dense layer using ReLU activation
    Dense(2, activation='softmax') # output layer using softmax for binary classification
])

print(classificationModel.layers[0].output)

# compiler
classificationModel.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# train the classification model
print("training classification RNN model:")
classificationModel.fit(xTrainClass, yTrainClass, epochs=10, batch_size=32, validation_split=0.2)

# evaluate classification model
yPredClass = np.argmax(classificationModel.predict(xTestClass), axis=1) # prediction for test data
yTrueClass = np.argmax(yTestClass, axis=1) # actual test data to compare prediction to

# print classification report
print("\nclassification report:")
print(classification_report(yTrueClass, yPredClass, target_names=labelEncoder.classes_))

# function to classify user input text
def classifyEmail(userInput):
    # tokenize and pad the input text
    tokenizedInput = tokenizer.texts_to_sequences([userInput])
    paddedInput = pad_sequences(tokenizedInput, maxlen=maxSentenceLength)
    
    # predict the input texts classification
    prediction = classificationModel.predict(paddedInput, verbose=0)[0]
    predictedClassIndex = np.argmax(prediction)
    
    # get the corresponding label as string
    predictedLabel = labelMapping[predictedClassIndex]
    confidence = prediction[predictedClassIndex] * 100  # confidence in the prediction as a percentage
    
    return predictedLabel, confidence

# user input for text classification
while True:
    userInput = input("\nenter email to classify as phishing email or safe: ")
    if userInput.lower() == "s": # s to skip this part
        break
    label, confidence = classifyEmail(userInput)
    print(f"\nresult: {label}")
    print(f"confidence: {confidence:.2f}%")

#///////////////////////////////////////////////////
# RNN next word prediction model:
#///////////////////////////////////////////////////

# separate phishing emails and safe emails in the data set
phishingEmails = [sequences[i] for i, label in enumerate(labels) if label == labelEncoder.transform(["Phishing Email"])[0]]
safeEmails = [sequences[i] for i, label in enumerate(labels) if label == labelEncoder.transform(["Safe Email"])[0]]

# optimization
maxSequences = 100000  # limit sequences for each type of email
phishingEmails = phishingEmails[:maxSequences]
safeEmails = safeEmails[:maxSequences]

# prepare data for phishing email next word prediction
phishInputSequences, phishNextWords = [], [] # init i/o 
# iterate over phishing sequences and positions
for seq in phishingEmails:
    for i in range(1, len(seq)):
        if len(phishInputSequences) >= maxSequences:
            break
        phishInputSequences.append(seq[:i]) 
        phishNextWords.append(seq[i])

phishInputSequences = pad_sequences(phishInputSequences, maxlen=maxSentenceLength)
phishNextWords = to_categorical(phishNextWords, num_classes=vocabSize)

# prepare data for safe email next word prediction (same as phishing)
safeInputSequences, safeNextWords = [], []
for seq in safeEmails:
    for i in range(1, len(seq)):
        if len(safeInputSequences) >= maxSequences:
            break
        safeInputSequences.append(seq[:i])
        safeNextWords.append(seq[i])

safeInputSequences = pad_sequences(safeInputSequences, maxlen=maxSentenceLength)
safeNextWords = to_categorical(safeNextWords, num_classes=vocabSize)

# optimization
del phishingEmails, safeEmails # free up memory using garbage collector
gc.collect()

# build phishing email next word prediction model
phishingModel = Sequential([
    Embedding(input_dim=vocabSize, output_dim=64, input_length=maxSentenceLength),
    LSTM(128, return_sequences=False),
    Dropout(0.5),
    Dense(vocabSize, activation='softmax')
])

#phishing model compiler
phishingModel.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# build safe email next word prediction model
safeModel = Sequential([
    Embedding(input_dim=vocabSize, output_dim=64, input_length=maxSentenceLength),
    LSTM(128, return_sequences=False),
    Dropout(0.5),
    Dense(vocabSize, activation='softmax')
])

# safe model compiler
safeModel.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# train phishing email model
print("training phishing email next word prediction model:")
phishingModel.fit(phishInputSequences, phishNextWords, epochs=10, batch_size=32, validation_split=0.2)

# optimization
del phishInputSequences, phishNextWords
gc.collect()

# train safe email model
print("training safe email next word prediction model:")
safeModel.fit(safeInputSequences, safeNextWords, epochs=10, batch_size=32, validation_split=0.2)

# optimization
del safeInputSequences, safeNextWords
gc.collect()

# function for temperature based sampling
def tempeSampling(predictions, temperature=1.0):
    predictions = np.log(predictions + 1e-8) / temperature # adjust predictions using temperature
    expPredictions = np.exp(predictions) # exponentiate predictions
    probabilities = expPredictions / np.sum(expPredictions) # normalize to probabilities
    return np.random.choice(len(probabilities), p=probabilities) # sample the word index

# function to generate email text
def generateEmail(seedText, model, maxWords=50, temperature=1.0):
    generatedText = seedText # initizalize generated text with seed text 
    for _ in range(maxWords): # generate max words
        tokenizedInput = tokenizer.texts_to_sequences([generatedText]) # tokenize generated text
        paddedInput = pad_sequences(tokenizedInput, maxlen=maxSentenceLength) # pad input sequence

        predictions = model.predict(paddedInput, verbose=0)[0] # predict next word probabilities
        wordIndex = tempeSampling(predictions, temperature) # sample next word
        word = tokenizer.index_word.get(wordIndex, "[UNK]") # get word from index

        if word == "[UNK]": # stop if word in unkown
            break

        generatedText += " " + word # append word to generated text

    return generatedText

# generate phishing email based on data set
print("\generated phishing email:")
print(generateEmail(seedText="\nYour account is hacked send us your password", model=phishingModel, maxWords=50, temperature=0.7))

# generate safe email based on data set
print("\ngenerated safe email:")
print(generateEmail(seedText="\nPlease send the report", model=safeModel, maxWords=50, temperature=0.1))
