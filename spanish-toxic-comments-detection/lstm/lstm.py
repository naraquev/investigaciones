import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from keras.preprocessing import text, sequence
from keras.layers import LSTM, Dense, Dropout, Embedding, Input, GlobalMaxPool1D, Bidirectional, AveragePooling1D
from keras.models import Model
from keras.models import load_model
from sklearn.metrics import f1_score, confusion_matrix
import pickle, re

max_features=600000 # maximo de palabras diferentes - el espanol tiene 300mil - coloque 600mil por duplicar las palabras cuando no se les coloca acentos y una napa para variaciones
maxlen=40 #esta contenido el 95% de los datos
batch_size = 360 # Muestra representativa de la poblacion infinita con un 95% de confianza
embed_size=64 # dimension del embbedding - tunable # rule of thumb max_features**0.25

threshold = 0.5

#reading files
train_x = pd.read_csv('./data/list.csv')
valid_x = pd.read_csv('./data/validate.csv')

# separating text from percents
train_x['text'].fillna(' ')
valid_x['text'].fillna(' ')
train_y = train_x['percent'].values
train_y = [1  if x>threshold else 0 for x in train_y]
valid_y = valid_x['percent'].values
train_x = train_x['text'].str.lower()
valid_x = valid_x['text'].str.lower()

#tokenizing words from train_x
# print(train_x[26].split())
tokenizer = text.Tokenizer(num_words=max_features, lower=True, oov_token='<oov>')
tokenizer.fit_on_texts(list(train_x))
# print(train_x)
train_x = tokenizer.texts_to_sequences(train_x)
# print(train_x[26])

# Ver el proceso de tokenizacion y devolverlo a texto
# comment = valid_x[772]
# words = len(comment.split())
# tokens = len(tokenizer.texts_to_sequences(comment.split()))
# print(comment.split())
# print(tokenizer.texts_to_sequences(comment.split()))
# print('words: ', words)
# print('tokens: ', tokens)
# splitted = re.sub(r"[!\"\#\$\%\&\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~\t]", "",  valid_x[772]).split()
# print(splitted, 'Length: ', len(splitted))
valid_x = tokenizer.texts_to_sequences(valid_x) #no comentar
# print(valid_x[772], 'Length: ', len(valid_x[0]))

# reverse_word_map = dict(map(reversed, tokenizer.word_index.items()))
# def sequence_to_text(list_of_indices):
#     # Looking up words in dictionary
#     words = [reverse_word_map.get(word) for word in list_of_indices]
#     return(words)
# print(sequence_to_text(valid_x[772]))

# save tokenizer
with open('tokenizer.pickle', 'wb') as handle:
    pickle.dump(tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)

# Calculo de la mayor longitud necesaria de entrada
# totalNumWords = [len(tweet) for tweet in train_x]
# accum = 0
# target = 8000*0.95
# for x in totalNumWords:
#     accum = accum + x
#     if accum >= target:
#         print('target reached at', x)
#         break
# plt.hist(totalNumWords, bins = np.arange(0, 80, 2));
# plt.xlabel('Palabras')
# plt.ylabel('Comentarios')
# plt.show()

train_x = sequence.pad_sequences(train_x, maxlen=maxlen, padding='post', truncating='post')
valid_x = sequence.pad_sequences(valid_x, maxlen=maxlen, padding='post', truncating='post')


#Model
inp = Input(shape=(maxlen, )) #input layer - maximo de palabras - tunable
x = Embedding(max_features, embed_size)(inp) #embbeding layer

x = Bidirectional(LSTM(40, return_sequences=True))(x)
# x = Bidirectional(LSTM(60, return_sequences=True))(x)
# x = AveragePooling1D()(x)
x = GlobalMaxPool1D()(x)

# x = Dropout(0.1)(x)
# x = Dense(50, activation="relu")(x)

x = Dropout(0.1)(x)
x = Dense(20, activation="tanh")(x) # arriba de 20 se dispara, y debajo de 3 tambien. keep looking for values in between that optimize

# x = Dropout(0.1)(x)
# x = Dense(10, activation="relu")(x)

x = Dropout(0.1)(x)
preds = Dense(1, activation="sigmoid")(x)

model = Model(inputs=inp, outputs=preds)
model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])


#Train or load
epochs = 20
option = input('1 para entrenar, 2 para cargar entrenamiento anterior: ')
if (option == '1'):
    model.fit(train_x, train_y, batch_size=batch_size, epochs=epochs, validation_split=0.1764, verbose=1, shuffle=False)
    print(model.summary())
elif (option == '2'):
    model = load_model('C:\\Users\\maxim\\Desktop\\Tesis\\neural network\\models\\test_model.hdf5')

#remover tweets con gran porcentaje fuera del vocabulario
puntoDeCambio = 0.3
def oovPercent(numbersList):
    cont = 0
    unpadded = list(filter(lambda a: a != 0, numbersList))
    total = len(unpadded)
    for x in numbersList:
        if (x == 1):
            cont += 1
    return cont/total
removeIndexes = [i for i, val in enumerate(valid_x) if oovPercent(val) >= puntoDeCambio]
for i in reversed(removeIndexes):
    valid_x = np.delete(valid_x, i, 0)
    valid_y = np.delete(valid_y, i, 0)

#prueba con data externa
predictions = model.predict(valid_x, batch_size=batch_size, verbose=1)


# F1-Score
predictionsFlattened = []
for x in predictions:
    predictionsFlattened.append(x[0])
valid_y = [1  if x>threshold else 0 for x in valid_y]
predictionsFlattened = [1  if x>threshold else 0 for x in predictionsFlattened]
score = f1_score(valid_y, predictionsFlattened, pos_label=1, average='binary')
print('F1: ',score)

cmatrix = confusion_matrix(valid_y, predictionsFlattened)
print('Confusion matrix: ')
print(cmatrix)

if(option == '1'):
    doSave = input('Guardar? (y/n)')
    if (doSave == 'y'):
        model.save("../backend/data/test_model.hdf5")
