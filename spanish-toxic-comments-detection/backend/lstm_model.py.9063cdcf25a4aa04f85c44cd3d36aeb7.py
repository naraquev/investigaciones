import os
import numpy as np
import dill as pickle
import tensorflow as tf
from keras.preprocessing import text, sequence
from keras.models import load_model


script_path = os.path.abspath(__file__) 
path_list = script_path.split(os.sep)
script_directory = path_list[0:len(path_list)-1]

max_features=30000 # maximo de palabras diferentes - el espanol tiene 300mil - coloque 600mil por duplicar las palabras cuando no se les coloca acentos y una napa para variaciones
maxlen=40 #esta contenido el 95% de los datos
batch_size = 360 # Muestra representativa de la poblacion infinita con un 95% de confianza
embed_size=28 

def get_model():
    rel_path = "data/test_model.hdf5"
    path = "/".join(script_directory) + "/" + rel_path  
    print(path);
    loaded_model = load_model(path)
    return loaded_model
    
model = get_model()
model._make_predict_function()
graph = tf.get_default_graph()
print('Model loaded')  

def rank_texts(texts):
    texts = tokenize_text(texts)
    texts = removeOOV(0.2, texts)
    global graph
    with graph.as_default():
		    prediction = model.predict(texts, batch_size=batch_size, verbose=1)
    return prediction

def tokenize_text(texts):
    rel_path = "data/tokenizer.pickle"
    path = "/".join(script_directory) + "/" + rel_path
    with open(path, 'rb') as handle:
        tokenizer = pickle.load(handle)
    texts = tokenizer.texts_to_sequences(texts)
    texts = sequence.pad_sequences(texts, maxlen=maxlen)
    return texts

def oovPercent(numbersList):
    cont = 0
    unpadded = list(filter(lambda a: a != 0, numbersList))
    total = len(unpadded)
    for x in numbersList:
        if (x == 1):
            cont += 1

    if total == 0 : 
        return 0
    
    return cont/total

def removeOOV(threshold, array):
    removeIndexes = [i for i, val in enumerate(array) if oovPercent(val) >= threshold]
    for i in reversed(removeIndexes):
        array = np.delete(array, i, 0)
    return array